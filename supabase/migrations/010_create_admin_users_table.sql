-- ============================================
-- Migration: Create admin_users table
-- ============================================
-- This table stores emails that have admin access

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

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ============================================
-- Add admin emails (modify with your actual emails)
-- ============================================
INSERT INTO admin_users (email, name, role) VALUES
    ('admin@marketplace.com', 'Admin Principal', 'admin'),
    ('support@marketplace.com', 'Soporte', 'moderator')
ON CONFLICT (email) DO NOTHING;
