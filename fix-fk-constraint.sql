-- Drop the incorrect foreign key constraint
ALTER TABLE freelancer_offers 
DROP CONSTRAINT IF EXISTS freelancer_offers_invitation_id_fkey;

-- Add the correct foreign key constraint pointing to invitations table
ALTER TABLE freelancer_offers
ADD CONSTRAINT freelancer_offers_invitation_id_fkey 
FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE;
