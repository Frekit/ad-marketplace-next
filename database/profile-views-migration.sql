-- Migration: Create profile_views table for tracking freelancer profile visits
-- Purpose: Track when and how many times a freelancer's profile is viewed
-- Date: 2025-12-01

-- Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_type VARCHAR(20) CHECK (viewer_type IN ('client', 'guest', 'freelancer')),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewer_ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_views_freelancer_id
ON profile_views(freelancer_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_freelancer_date
ON profile_views(freelancer_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_date
ON profile_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_type
ON profile_views(viewer_type);

-- Create a view for easy 30-day statistics
CREATE OR REPLACE VIEW profile_views_30_days AS
SELECT
    freelancer_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT viewer_id) FILTER (WHERE viewer_id IS NOT NULL) as unique_clients,
    COUNT(*) FILTER (WHERE viewer_type = 'client') as client_views,
    COUNT(*) FILTER (WHERE viewer_type = 'guest') as guest_views,
    COUNT(*) FILTER (WHERE viewer_type = 'freelancer') as freelancer_views,
    MAX(viewed_at) as last_viewed_at
FROM profile_views
WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY freelancer_id;

-- Create a view for tracking viewer trend (previous 30 days vs current 30 days)
CREATE OR REPLACE VIEW profile_views_trend AS
SELECT
    freelancer_id,
    COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days') as current_period,
    COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '60 days'
                     AND viewed_at < CURRENT_DATE - INTERVAL '30 days') as previous_period,
    CASE
        WHEN COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '60 days'
                              AND viewed_at < CURRENT_DATE - INTERVAL '30 days') = 0 THEN 100
        ELSE ROUND(
            (COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days')::NUMERIC /
             COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE - INTERVAL '60 days'
                              AND viewed_at < CURRENT_DATE - INTERVAL '30 days')::NUMERIC - 1) * 100, 2)
    END as trend_percentage
FROM profile_views
GROUP BY freelancer_id;

-- Enable Row Level Security
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can view their own profile view statistics
CREATE POLICY profile_views_user_read ON profile_views
    FOR SELECT
    USING (freelancer_id = auth.uid());

-- Create RLS policy: System can insert profile views (via API)
CREATE POLICY profile_views_system_insert ON profile_views
    FOR INSERT
    WITH CHECK (true);

-- Create RLS policy: Admins can view all profile views
CREATE POLICY profile_views_admin_read ON profile_views
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE profile_views IS 'Tracks when freelancer profiles are viewed by clients and guests';
COMMENT ON COLUMN profile_views.viewer_type IS 'Type of viewer: client (logged in client), guest (anonymous), freelancer (other freelancer)';
