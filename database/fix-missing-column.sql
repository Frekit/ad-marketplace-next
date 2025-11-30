-- Add missing documents_submitted_at column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS documents_submitted_at TIMESTAMP;
