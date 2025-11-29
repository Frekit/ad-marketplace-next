-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add avatar_url column to freelancer_profiles table (optional, for freelancer-specific avatars)
ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket policy (run this in Supabase Dashboard > Storage)
-- Bucket name: 'avatars'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- RLS policies for avatars bucket will be created via Supabase Dashboard
