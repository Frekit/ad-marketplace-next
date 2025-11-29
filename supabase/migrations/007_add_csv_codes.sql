-- Add CSV code fields to freelancer_wallets for verification

ALTER TABLE freelancer_wallets
ADD COLUMN IF NOT EXISTS doc_hacienda_csv TEXT, -- Extracted CSV code
ADD COLUMN IF NOT EXISTS doc_seguridad_social_csv TEXT, -- Extracted CSV code
ADD COLUMN IF NOT EXISTS doc_autonomo_csv TEXT; -- Extracted CSV code

COMMENT ON COLUMN freelancer_wallets.doc_hacienda_csv IS 'Código Seguro de Verificación (CSV) extracted from Hacienda certificate';
COMMENT ON COLUMN freelancer_wallets.doc_seguridad_social_csv IS 'CSV code extracted from Social Security certificate';
COMMENT ON COLUMN freelancer_wallets.doc_autonomo_csv IS 'CSV code extracted from autonomo registration certificate';
