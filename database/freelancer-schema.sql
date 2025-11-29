-- Freelancer Profiles
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  hourly_rate DECIMAL(10, 2),
  skills TEXT[],
  bio TEXT,
  availability TEXT CHECK (availability IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
  rating DECIMAL(3, 2) DEFAULT 0,
  total_jobs INT DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  profile_completion INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_skills ON freelancer_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_availability ON freelancer_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_rating ON freelancer_profiles(rating DESC);

-- Update projects table to add more fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_hours INT;

-- Trigger to update freelancer profile stats
CREATE OR REPLACE FUNCTION update_freelancer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE freelancer_profiles
    SET 
      total_jobs = total_jobs + 1,
      updated_at = NOW()
    WHERE user_id = NEW.freelancer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freelancer_stats
AFTER UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_stats();
