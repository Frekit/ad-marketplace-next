-- Create freelancer_offers table
CREATE TABLE IF NOT EXISTS freelancer_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID REFERENCES project_invitations(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    milestones JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_project_id ON freelancer_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_freelancer_id ON freelancer_offers(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_invitation_id ON freelancer_offers(invitation_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_status ON freelancer_offers(status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_freelancer_offer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freelancer_offer_updated_at
    BEFORE UPDATE ON freelancer_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_freelancer_offer_updated_at();
