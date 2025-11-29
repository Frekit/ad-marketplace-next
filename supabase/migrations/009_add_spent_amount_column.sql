-- Migration: Add spent_amount column to projects if it doesn't exist
-- This column tracks how much of the allocated budget has been spent

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(10, 2) DEFAULT 0.00;
