-- ============================================
-- INVOICE SYSTEM - COMPLETE SQL MIGRATION
-- ============================================
-- This migration must be run AFTER the base schema is created
-- Execution order:
-- 1. Base schema (schema.sql, wallet-schema.sql, etc.)
-- 2. This migration

-- ============================================
-- 1. CREATE INVOICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_index INT NOT NULL,
    
    -- Legal Data
    freelancer_legal_name TEXT NOT NULL,
    freelancer_tax_id TEXT NOT NULL,
    freelancer_address TEXT NOT NULL,
    freelancer_postal_code TEXT NOT NULL,
    freelancer_city TEXT NOT NULL,
    freelancer_country TEXT NOT NULL,
    
    -- Tax Configuration
    tax_scenario TEXT NOT NULL CHECK (tax_scenario IN (
        'es_domestic',
        'eu_b2b',
        'non_eu'
    )),
    
    -- Financial Data
    base_amount DECIMAL(10,2) NOT NULL,
    vat_applicable BOOLEAN DEFAULT true,
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(10,2) DEFAULT 0,
    reverse_charge BOOLEAN DEFAULT false,
    
    -- IRPF
    irpf_applicable BOOLEAN DEFAULT false,
    irpf_rate DECIMAL(5,2),
    irpf_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Totals
    subtotal DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Invoice Details
    issue_date DATE NOT NULL,
    due_date DATE,
    description TEXT NOT NULL,
    
    -- Status & Validation
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'under_review',
        'approved',
        'rejected',
        'paid'
    )),
    rejection_reason TEXT,
    
    -- Payment Info
    payment_method TEXT DEFAULT 'sepa',
    iban TEXT NOT NULL,
    swift_bic TEXT,
    
    -- Stripe Integration
    stripe_transfer_id TEXT,
    stripe_transfer_status TEXT,
    
    -- PDF Storage
    pdf_url TEXT NOT NULL,
    pdf_filename TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(project_id, milestone_index)
);

-- ============================================
-- 2. CREATE INDEXES FOR INVOICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_freelancer_id ON invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- 3. CREATE TRIGGER FOR INVOICES UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_updated_at();

-- ============================================
-- 4. ALTER FREELANCER_WALLETS TABLE
-- ============================================

ALTER TABLE freelancer_wallets
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS default_iban TEXT,
ADD COLUMN IF NOT EXISTS default_swift_bic TEXT,
ADD COLUMN IF NOT EXISTS default_irpf_rate DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS is_autonomo BOOLEAN DEFAULT true;

-- ============================================
-- 5. CREATE add_wallet_balance FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION add_wallet_balance(
    p_freelancer_id UUID,
    p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create wallet if it doesn't exist
    INSERT INTO freelancer_wallets (freelancer_id, available_balance, total_earned)
    VALUES (p_freelancer_id, p_amount, p_amount)
    ON CONFLICT (freelancer_id)
    DO UPDATE SET
        available_balance = freelancer_wallets.available_balance + p_amount,
        total_earned = freelancer_wallets.total_earned + p_amount,
        updated_at = NOW();
END;
$$;

-- ============================================
-- 6. CREATE complete_milestone_payment FUNCTION
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

    -- Add to freelancer's available balance
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
-- 7. CREATE process_withdrawal FUNCTION
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
-- 8. VERIFICATION QUERIES
-- ============================================

-- Verify invoices table exists
SELECT 'invoices table created' as status, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'invoices';

-- Verify functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'add_wallet_balance', 
    'complete_milestone_payment', 
    'process_withdrawal',
    'update_invoice_updated_at'
) 
ORDER BY routine_name;

-- Verify indexes on invoices
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'invoices' 
ORDER BY indexname;

-- Verify freelancer_wallets new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'freelancer_wallets' 
AND column_name IN (
    'legal_name', 'tax_id', 'address', 
    'postal_code', 'city', 'default_iban', 
    'default_swift_bic', 'default_irpf_rate', 'is_autonomo'
)
ORDER BY column_name;
