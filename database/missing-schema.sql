-- ============================================
-- MISSING SCHEMA DEFINITIONS
-- Execute this in Supabase SQL Editor to complete the database setup
-- ============================================

-- 1. Freelancer Profiles Table (from freelancer-schema.sql)
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

CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_skills ON freelancer_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_availability ON freelancer_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_rating ON freelancer_profiles(rating DESC);

-- 2. Billing Columns for Users (from billing-schema.sql)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS billing_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_postal_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'ES';

CREATE INDEX IF NOT EXISTS idx_users_tax_id ON users(tax_id);

-- 3. Milestones Table (from projects-schema.sql)
-- This is needed for detailed milestone tracking beyond the JSONB column in contracts
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    order_index INTEGER,
    status TEXT CHECK (status IN ('pending', 'completed', 'approved')) DEFAULT 'pending',
    deliverables TEXT,
    completed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_contract ON milestones(contract_id);

-- 4. Update projects table with freelancer columns (if not already present)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_hours INT;
