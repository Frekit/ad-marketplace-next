-- ============================================
-- Migration: Make allocated_budget nullable
-- ============================================
-- Allow projects to be created without an allocated budget
-- The budget can be assigned later when the project is funded

ALTER TABLE projects
ALTER COLUMN allocated_budget DROP NOT NULL;

-- Set default value to NULL for new projects
ALTER TABLE projects
ALTER COLUMN allocated_budget SET DEFAULT NULL;
