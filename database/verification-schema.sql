-- Add verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'submitted', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS doc_hacienda_url TEXT,
ADD COLUMN IF NOT EXISTS doc_hacienda_filename TEXT,
ADD COLUMN IF NOT EXISTS doc_seguridad_social_url TEXT,
ADD COLUMN IF NOT EXISTS doc_seguridad_social_filename TEXT,
ADD COLUMN IF NOT EXISTS doc_autonomo_url TEXT,
ADD COLUMN IF NOT EXISTS doc_autonomo_filename TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ES';

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
CREATE POLICY "Freelancers can upload their own verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-docs' AND
  (storage.foldername(name))[1] = 'verification' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Freelancers can read their own verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  (storage.foldername(name))[1] = 'verification' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Admins can read all verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
