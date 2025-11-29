-- ============================================
-- 🚀 COPY & PASTE IN SUPABASE SQL EDITOR
-- ============================================
-- Execute these migrations in order to set up admin dashboard

-- STEP 1: Make allocated_budget nullable
-- ============================================
ALTER TABLE projects ALTER COLUMN allocated_budget DROP NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(10, 2) DEFAULT 0;

-- STEP 2: Create admin_users table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
    permissions JSONB DEFAULT '{"invoices": true, "users": true, "projects": true, "analytics": true}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- STEP 3: Add initial admin emails
-- ============================================
-- IMPORTANTE: REEMPLAZA ESTOS EMAILS CON LOS REALES
INSERT INTO admin_users (email, name, role, is_active) VALUES
    ('admin@example.com', 'Admin Principal', 'admin', true),
    ('support@example.com', 'Soporte', 'moderator', true)
ON CONFLICT (email) DO NOTHING;

-- STEP 4 (OPTIONAL): Add your own email as admin
-- ============================================
-- Uncomment and modify with your real email
-- INSERT INTO admin_users (email, name, role, is_active) VALUES
--     ('your-email@gmail.com', 'Your Name', 'admin', true)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check if projects table has new columns
-- SELECT * FROM projects LIMIT 1;

-- Check admin_users table
-- SELECT * FROM admin_users;

-- Check admin_users indexes
-- SELECT * FROM pg_indexes WHERE tablename = 'admin_users';

-- ============================================
-- CLEANUP (IF NEEDED - Run only if you need to reset)
-- ============================================
-- WARNING: This will delete all admin users!
-- DELETE FROM admin_users;

-- ============================================
-- 📋 SUMMARY OF CHANGES
-- ============================================
-- ✅ projects.allocated_budget → Now nullable
-- ✅ projects.spent_amount → New column for tracking spending
-- ✅ admin_users table → Created with email-based auth
-- ✅ Indexes → Created for performance
-- ✅ Sample data → Inserted (modify with real emails)

-- ============================================
-- 🔐 SECURITY NOTES
-- ============================================
-- 1. Only emails in admin_users with is_active=true can access admin panel
-- 2. Change role field to 'admin' or 'moderator' for different permissions
-- 3. Update permissions JSONB to control access to specific features
-- 4. Set is_active=false to disable an admin without deleting them

-- ============================================
-- 🚀 NEXT STEPS
-- ============================================
-- 1. Execute all queries in Supabase SQL Editor
-- 2. Replace example emails with real emails
-- 3. Restart your Next.js dev server
-- 4. Login with an admin email
-- 5. Visit http://localhost:3000/admin/dashboard
