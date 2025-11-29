-- Create freelancer_wallets table
CREATE TABLE IF NOT EXISTS freelancer_wallets (
    freelancer_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (available_balance >= 0),
    total_earned DECIMAL(10, 2) DEFAULT 0 NOT NULL CHECK (total_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_freelancer_wallets_freelancer_id ON freelancer_wallets(freelancer_id);

-- Create trigger to update updated_at
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
