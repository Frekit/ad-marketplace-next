-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add embedding column to freelancer_profiles table
ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add updated_at tracking for cache invalidation
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

-- Create indexes for faster vector similarity search
CREATE INDEX IF NOT EXISTS idx_projects_embedding ON projects USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_embedding ON freelancer_profiles USING ivfflat (embedding vector_cosine_ops);

-- Trigger to invalidate project embedding cache when project is updated
CREATE OR REPLACE FUNCTION invalidate_project_embedding()
RETURNS TRIGGER AS $$
BEGIN
    -- Only invalidate if relevant fields changed
    IF (NEW.title IS DISTINCT FROM OLD.title) OR 
       (NEW.description IS DISTINCT FROM OLD.description) OR 
       (NEW.skills_required IS DISTINCT FROM OLD.skills_required) THEN
        NEW.embedding := NULL;
        NEW.embedding_updated_at := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_project_embedding
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION invalidate_project_embedding();

-- Trigger to invalidate freelancer embedding cache when profile is updated
CREATE OR REPLACE FUNCTION invalidate_freelancer_embedding()
RETURNS TRIGGER AS $$
BEGIN
    -- Only invalidate if relevant fields changed
    IF (NEW.bio IS DISTINCT FROM OLD.bio) OR 
       (NEW.skills IS DISTINCT FROM OLD.skills) THEN
        NEW.embedding := NULL;
        NEW.embedding_updated_at := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_freelancer_embedding
BEFORE UPDATE ON freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION invalidate_freelancer_embedding();
