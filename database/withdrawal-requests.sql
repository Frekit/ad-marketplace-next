-- ============================================
-- WITHDRAWAL REQUESTS TABLE
-- Stores withdrawal requests with blocked funds
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_invoice' CHECK (
        status IN (
            'pending_invoice',      -- Esperando que el freelancer cree factura
            'pending_approval',     -- Factura subida, esperando aprobación
            'approved',             -- Factura aprobada, listo para payout
            'paid',                 -- Payout completado
            'cancelled',            -- Retiro cancelado
            'failed'                -- Payout falló
        )
    ),

    -- Dinero bloqueado
    available_balance_before DECIMAL(10, 2) NOT NULL,
    amount_blocked DECIMAL(10, 2) NOT NULL,

    -- Datos fiscales calculados
    base_amount DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 21.00,
    vat_amount DECIMAL(10, 2) DEFAULT 0,
    irpf_rate DECIMAL(5, 2),
    irpf_amount DECIMAL(10, 2) DEFAULT 0,

    -- Vinculación a factura
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    -- Payout info
    stripe_payout_id TEXT,
    payout_status TEXT,
    payout_error TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invoice_expected_by TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Audit
    rejection_reason TEXT,
    rejection_notes TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_freelancer_id ON withdrawal_requests(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_invoice_id ON withdrawal_requests(invoice_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_withdrawal_requests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_requests_timestamp
BEFORE UPDATE ON withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION update_withdrawal_requests_timestamp();
