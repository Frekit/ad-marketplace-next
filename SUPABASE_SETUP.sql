-- ============================================
-- SUPABASE MIGRATIONS - COMPLETE SETUP
-- ============================================
-- Execute all these commands in Supabase SQL Editor
-- Copy and paste the entire content

-- ============================================
-- 1. Make allocated_budget nullable
-- ============================================
ALTER TABLE projects
ALTER COLUMN allocated_budget DROP NOT NULL;

ALTER TABLE projects
ALTER COLUMN allocated_budget SET DEFAULT NULL;

-- ============================================
-- 2. Add spent_amount column to projects
-- ============================================
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(10, 2) DEFAULT 0.00;

-- ============================================
-- 3. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

-- ============================================
-- Done! Your database is now ready
-- ============================================
