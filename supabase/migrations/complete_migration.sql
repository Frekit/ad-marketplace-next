-- ============================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Ad Marketplace - Project Workflow System
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- This will create all necessary tables and functions

-- ============================================
-- 1. CREATE FREELANCER WALLETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS freelancer_wallets (
    freelancer_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (available_balance >= 0),
    total_earned DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (total_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_freelancer_wallets_freelancer_id ON freelancer_wallets(freelancer_id);

CREATE OR REPLACE FUNCTION update_freelancer_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freelancer_wallet_updated_at
    BEFORE UPDATE ON freelancer_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_freelancer_wallet_updated_at();

-- ============================================
-- 2. CREATE PROJECT INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS project_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'offer_submitted', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_freelancer_id ON project_invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_client_id ON project_invitations(client_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);

CREATE OR REPLACE FUNCTION update_project_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_invitation_updated_at
    BEFORE UPDATE ON project_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_project_invitation_updated_at();

-- ============================================
-- 3. CREATE FREELANCER OFFERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS freelancer_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID REFERENCES project_invitations(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    milestones JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_freelancer_offers_project_id ON freelancer_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_freelancer_id ON freelancer_offers(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_invitation_id ON freelancer_offers(invitation_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_status ON freelancer_offers(status);

CREATE OR REPLACE FUNCTION update_freelancer_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freelancer_offer_updated_at
    BEFORE UPDATE ON freelancer_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_freelancer_offer_updated_at();

-- ============================================
-- 4. ALTER PROJECTS TABLE
-- ============================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS milestones JSONB;

CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

COMMENT ON COLUMN projects.status IS 'Valid values: draft, active, completed, cancelled';

-- ============================================
-- 5. LOCK PROJECT FUNDS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION lock_project_funds(
    p_client_id UUID,
    p_project_id UUID,
    p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
    -- Move funds from available_balance to locked_balance
    UPDATE client_wallets
    SET 
        available_balance = available_balance - p_amount,
        locked_balance = locked_balance + p_amount
    WHERE client_id = p_client_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for client %', p_client_id;
    END IF;

    -- Create transaction record
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_client_id,
        'escrow_lock',
        p_amount,
        'completed',
        'Funds locked in escrow for project',
        jsonb_build_object('project_id', p_project_id)
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. COMPLETE MILESTONE PAYMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION complete_milestone_payment(
    p_project_id UUID,
    p_milestone_index INT,
    p_amount DECIMAL,
    p_client_id UUID,
    p_freelancer_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Deduct from client's locked balance
    UPDATE client_wallets
    SET locked_balance = locked_balance - p_amount
    WHERE client_id = p_client_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client wallet not found for %', p_client_id;
    END IF;

    -- Add to freelancer's available balance (create wallet if doesn't exist)
    INSERT INTO freelancer_wallets (freelancer_id, available_balance, total_earned)
    VALUES (p_freelancer_id, p_amount, p_amount)
    ON CONFLICT (freelancer_id) 
    DO UPDATE SET 
        available_balance = freelancer_wallets.available_balance + p_amount,
        total_earned = freelancer_wallets.total_earned + p_amount;

    -- Create transaction records
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_client_id,
        'milestone_payment',
        -p_amount,
        'completed',
        'Payment for completed milestone',
        jsonb_build_object(
            'project_id', p_project_id,
            'milestone_index', p_milestone_index,
            'freelancer_id', p_freelancer_id
        )
    );

    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_freelancer_id,
        'milestone_received',
        p_amount,
        'completed',
        'Received payment for completed milestone',
        jsonb_build_object(
            'project_id', p_project_id,
            'milestone_index', p_milestone_index,
            'client_id', p_client_id
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. PROCESS WITHDRAWAL FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION process_withdrawal(
    p_freelancer_id UUID,
    p_amount DECIMAL,
    p_iban TEXT
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Verify sufficient balance
    IF (SELECT available_balance FROM freelancer_wallets WHERE freelancer_id = p_freelancer_id) < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance for withdrawal';
    END IF;

    -- Deduct from freelancer's available balance
    UPDATE freelancer_wallets
    SET available_balance = available_balance - p_amount
    WHERE freelancer_id = p_freelancer_id;

    -- Create withdrawal transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata
    ) VALUES (
        p_freelancer_id,
        'withdrawal',
        -p_amount,
        'pending',
        'SEPA withdrawal to bank account',
        jsonb_build_object('iban', p_iban)
    )
    RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all tables exist
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('freelancer_wallets', 'project_invitations', 'freelancer_offers')
ORDER BY table_name;

-- Verify all functions exist
SELECT 
    routine_name,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('lock_project_funds', 'complete_milestone_payment', 'process_withdrawal')
ORDER BY routine_name;

-- Show projects table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('freelancer_id', 'milestones')
ORDER BY column_name;
