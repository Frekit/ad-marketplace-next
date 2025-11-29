-- Add freelancer verification documents to freelancer_wallets table

ALTER TABLE freelancer_wallets
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,

-- Spanish freelancer documents (required for ES)
ADD COLUMN IF NOT EXISTS doc_hacienda_url TEXT, -- Certificado de estar al corriente con Hacienda
ADD COLUMN IF NOT EXISTS doc_hacienda_filename TEXT,
ADD COLUMN IF NOT EXISTS doc_hacienda_uploaded_at TIMESTAMP,

ADD COLUMN IF NOT EXISTS doc_seguridad_social_url TEXT, -- Certificado de estar al corriente con Seguridad Social
ADD COLUMN IF NOT EXISTS doc_seguridad_social_filename TEXT,
ADD COLUMN IF NOT EXISTS doc_seguridad_social_uploaded_at TIMESTAMP,

ADD COLUMN IF NOT EXISTS doc_autonomo_url TEXT, -- Certificado de alta de autónomo
ADD COLUMN IF NOT EXISTS doc_autonomo_filename TEXT,
ADD COLUMN IF NOT EXISTS doc_autonomo_uploaded_at TIMESTAMP,

-- Verification timestamps
ADD COLUMN IF NOT EXISTS documents_submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS documents_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS documents_rejected_at TIMESTAMP;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_freelancer_wallets_verification_status ON freelancer_wallets(verification_status);

COMMENT ON COLUMN freelancer_wallets.doc_hacienda_url IS 'Certificate of no debt to Tax Agency (Hacienda)';
COMMENT ON COLUMN freelancer_wallets.doc_seguridad_social_url IS 'Certificate of no debt to Social Security';
COMMENT ON COLUMN freelancer_wallets.doc_autonomo_url IS 'Proof of self-employed registration (alta de autónomo)';
