# Invoice System Database Migration

## How to Execute

This migration must be run in the **Supabase SQL Editor** before deploying the invoice system.

### Steps:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Execute** or press `Ctrl+Enter`

---

## SQL Migration Script

```sql
-- ============================================
-- INVOICE SYSTEM DATABASE MIGRATION
-- ============================================

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_index INT NOT NULL,
    
    -- Legal Data
    freelancer_legal_name TEXT NOT NULL,
    freelancer_tax_id TEXT NOT NULL, -- NIF/CIF/VAT Number
    freelancer_address TEXT NOT NULL,
    freelancer_postal_code TEXT NOT NULL,
    freelancer_city TEXT NOT NULL,
    freelancer_country TEXT NOT NULL, -- ISO code (ES, FR, DE, etc.)
    
    -- Tax Configuration
    tax_scenario TEXT NOT NULL CHECK (tax_scenario IN (
        'es_domestic',    -- Spanish freelancer → Spanish company (IVA + IRPF)
        'eu_b2b',         -- EU freelancer → Spanish company (Reverse charge)
        'non_eu'          -- Non-EU (future)
    )),
    
    -- Financial Data
    base_amount DECIMAL(10,2) NOT NULL, -- Base imponible (before taxes)
    
    -- VAT (IVA)
    vat_applicable BOOLEAN DEFAULT true,
    vat_rate DECIMAL(5,2), -- % IVA (21% standard Spain, 0% for reverse charge)
    vat_amount DECIMAL(10,2) DEFAULT 0, -- Calculated VAT
    reverse_charge BOOLEAN DEFAULT false, -- True for EU B2B
    
    -- IRPF (Income Tax Withholding - Spain only)
    irpf_applicable BOOLEAN DEFAULT false,
    irpf_rate DECIMAL(5,2), -- % IRPF (7%, 15%, or custom)
    irpf_amount DECIMAL(10,2) DEFAULT 0, -- Withheld amount
    
    -- Totals
    subtotal DECIMAL(10,2) NOT NULL, -- Base + VAT
    total_amount DECIMAL(10,2) NOT NULL, -- Subtotal - IRPF (amount to transfer)
    
    -- Invoice Details
    issue_date DATE NOT NULL,
    due_date DATE,
    description TEXT NOT NULL,
    
    -- Status & Validation
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Submitted by freelancer
        'under_review', -- Being reviewed by admin
        'approved',     -- Approved, ready for payment
        'rejected',     -- Rejected, needs correction
        'paid'          -- Payment completed
    )),
    rejection_reason TEXT,
    
    -- Payment Info
    payment_method TEXT DEFAULT 'sepa',
    iban TEXT NOT NULL,
    swift_bic TEXT,
    
    -- Stripe Integration
    stripe_transfer_id TEXT,
    stripe_transfer_status TEXT,
    
    -- PDF Storage (Supabase Storage path)
    pdf_url TEXT NOT NULL,
    pdf_filename TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure one invoice per milestone
    UNIQUE(project_id, milestone_index)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer_id ON invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_updated_at();

-- Add invoice-related columns to freelancer_wallets
ALTER TABLE freelancer_wallets
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS default_iban TEXT,
ADD COLUMN IF NOT EXISTS default_swift_bic TEXT,
ADD COLUMN IF NOT EXISTS default_irpf_rate DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS is_autonomo BOOLEAN DEFAULT true;
```

---

## Verification

After running the migration, verify it was successful by executing:

```sql
-- Check if invoices table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'invoices';

-- Check invoices table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices' ORDER BY ordinal_position;

-- Check freelancer_wallets new columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'freelancer_wallets' AND column_name LIKE '%iban%' OR column_name LIKE '%tax%';
```

**Expected Results:**
- ✅ `invoices` table exists
- ✅ Table has 56 columns including `invoice_number`, `status`, `total_amount`, etc.
- ✅ Indexes created: `idx_invoices_freelancer_id`, `idx_invoices_status`, etc.
- ✅ `freelancer_wallets` table has new columns: `legal_name`, `tax_id`, `default_iban`, etc.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation 'invoices' already exists" | This is normal if running twice. Use `DROP TABLE IF EXISTS invoices CASCADE;` first |
| "column 'legal_name' already exists" | Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` (already in script) |
| Permission error | Ensure using `SUPABASE_SERVICE_ROLE_KEY` (not anon key) |
| Trigger not created | Check PostgreSQL version (requires 9.0+) |

---

## Next Steps

After successful migration:

1. ✅ Migration executed
2. → Deploy invoice system code (API routes, components, pages)
3. → Test Phase 1 workflow (freelancer submit → admin review → payment)
4. → Activate Phase 2 (make invoices mandatory)
5. → Connect Stripe for production payments

---

**Migration Version:** 005
**Date Created:** November 27, 2025
**Status:** Ready for deployment
