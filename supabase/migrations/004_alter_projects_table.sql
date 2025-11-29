-- Add new columns to projects table for the revised workflow
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS milestones JSONB;

-- Create index for freelancer_id
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

-- Update status enum to include new statuses (if using enum type)
-- If status is just TEXT, this is already flexible
-- But we'll add a comment to document valid statuses
COMMENT ON COLUMN projects.status IS 'Valid values: draft, active, completed, cancelled';
