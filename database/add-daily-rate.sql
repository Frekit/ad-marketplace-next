-- Add daily_rate field to users table for freelancers
ALTER TABLE users
ADD COLUMN daily_rate DECIMAL(10, 2) DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_daily_rate ON users(daily_rate);
