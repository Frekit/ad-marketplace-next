-- Add wallet columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS locked_balance DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10, 2) DEFAULT 0.00;

-- Update alvarovi24@gmail.com with 200 euros
UPDATE users 
SET available_balance = 200.00 
WHERE email = 'alvarovi24@gmail.com';
