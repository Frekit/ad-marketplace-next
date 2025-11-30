-- Add columns to invitations table to support project invitation terms
-- Rename table from invitations to project_invitations if not already done

-- First, check if we need to rename the table
ALTER TABLE IF EXISTS invitations RENAME TO project_invitations;

-- Add new columns if they don't exist
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS estimated_days INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS suggested_milestones JSONB,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update existing indexes to reference new table name
DROP INDEX IF EXISTS idx_invitations_project;
DROP INDEX IF EXISTS idx_invitations_freelancer;
DROP INDEX IF EXISTS idx_invitations_status;

CREATE INDEX IF NOT EXISTS idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_freelancer ON project_invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON project_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_client ON project_invitations(client_id);
