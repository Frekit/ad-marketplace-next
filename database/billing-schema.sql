-- Add billing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS billing_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'ES';

-- Create index for tax_id lookups
CREATE INDEX IF NOT EXISTS idx_users_tax_id ON users(tax_id);
