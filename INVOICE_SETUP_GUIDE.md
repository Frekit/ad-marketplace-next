# Invoice System - Setup & Deployment Guide

## Pre-Deployment Checklist

### Database
- [ ] Run migration: `005_create_invoices_table.sql` (creates tables)
- [ ] Run migration: `006_invoice_system_complete.sql` (creates functions)
- [ ] Verify `invoices` table created (56 columns)
- [ ] Verify `freelancer_wallets` columns added
- [ ] Verify indexes created
- [ ] Verify functions exist: `add_wallet_balance`, `complete_milestone_payment`, `process_withdrawal`

### Environment Variables
Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Dependencies
The implementation uses only existing dependencies:
- Next.js (existing)
- Supabase client (existing)
- TypeScript (existing)

No new npm packages required for Phase 1.

---

## Deployment Steps

### Phase 1: Deploy Invoice System (Non-Breaking)

1. **Database Migration - Execute SQL**
   
   **⚠️ IMPORTANT:** Use the clean SQL file, not the Markdown documentation.
   
   ```bash
   # Copy from: INVOICE_MIGRATION_CLEAN.sql
   # NOT from: SQL_MIGRATIONS_COMPLETE.md (contains Markdown)
   ```
   
   Steps:
   - Open `INVOICE_MIGRATION_CLEAN.sql`
   - Select all content (`Ctrl+A`)
   - Copy (`Ctrl+C`)
   - Go to Supabase Dashboard → SQL Editor → New Query
   - Paste (`Ctrl+V`)
   - Click Execute
   
   See: `SQL_COPY_INSTRUCTIONS.md` for detailed instructions

2. **Deploy Code**
   ```bash
   git add .
   git commit -m "feat: implement invoice system phase 1"
   git push
   # Deploy to your hosting (Vercel, etc.)
   ```

4. **Test Endpoints**
   ```bash
   # Test freelancer invoice creation
   POST /api/freelancer/invoices/create
   
   # Test admin endpoints
   GET /api/invoices?status=pending
   POST /api/invoices/{id}/approve
   POST /api/invoices/{id}/reject
   POST /api/invoices/{id}/process-payment
   ```

### Phase 2: Make Invoices Mandatory (After Testing)

1. **Update Milestone Approval**
   - The code is already updated to require invoices
   - Current status: Ready to activate

2. **Activate Payment Flow**
   ```bash
   # Already implemented in:
   # src/app/api/projects/[id]/milestones/[milestoneIndex]/approve/route.ts
   ```

3. **Migration Script (if needed)**
   ```sql
   -- For existing invoices without records, you may want to:
   -- INSERT INTO invoices ... FROM projects WHERE milestones
   -- This is optional for backward compatibility
   ```

### Phase 3: Production Stripe Integration

1. **Configure Stripe**
   - Set up Stripe Connect account
   - Configure SEPA payout settings
   - Add webhook endpoints

2. **Update Payment Function**
   ```typescript
   // Replace test mode in processSepaTransfer()
   async function processSepaTransfer(invoice: any) {
     const transfer = await stripe.transfers.create({
       amount: invoice.total_amount * 100,
       currency: 'eur',
       destination: freelancerStripeAccountId,
       transfer_group: invoice.invoice_number,
     });
   }
   ```

3. **Add Webhook Handler**
   ```typescript
   // src/app/api/webhooks/stripe/payout/route.ts
   // Handle payout.paid and payout.failed events
   ```

---

## Feature Activation Flags

To control when features are active, you can use feature flags:

```typescript
// lib/features.ts
export const FEATURES = {
  INVOICE_SYSTEM_ENABLED: process.env.NEXT_PUBLIC_INVOICE_SYSTEM === 'true',
  INVOICES_REQUIRED: process.env.NEXT_PUBLIC_INVOICES_REQUIRED === 'true',
  STRIPE_TRANSFERS: process.env.NEXT_PUBLIC_STRIPE_TRANSFERS === 'true',
};
```

### .env.local
```
NEXT_PUBLIC_INVOICE_SYSTEM=true
NEXT_PUBLIC_INVOICES_REQUIRED=false  # Activate in Phase 2
NEXT_PUBLIC_STRIPE_TRANSFERS=false   # Activate in Phase 3
```

---

## Rollback Plan

If issues arise, you can rollback by:

### Option 1: Keep Tables, Disable Features
```bash
# Set feature flags to false
NEXT_PUBLIC_INVOICES_REQUIRED=false
# Restart application
```

### Option 2: Drop Tables (Complete Rollback)
```sql
DROP TABLE IF EXISTS invoices CASCADE;

ALTER TABLE freelancer_wallets
DROP COLUMN IF EXISTS legal_name,
DROP COLUMN IF EXISTS tax_id,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS postal_code,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS default_iban,
DROP COLUMN IF EXISTS default_swift_bic,
DROP COLUMN IF EXISTS default_irpf_rate,
DROP COLUMN IF EXISTS is_autonomo;
```

---

## Testing Workflows

### Scenario 1: Happy Path (Spain)

1. **Freelancer:** Navigate to `/freelancer/projects/{id}/invoice/new`
2. **Freelancer:** Fill form with Spanish details
   - Name: "Juan Pérez García"
   - Tax ID: "12345678A"
   - Country: "ES"
   - Base Amount: €500
   - IRPF: 15%
3. **Verify:** Expected totals:
   - IVA 21%: €105
   - IRPF 15%: €75
   - Total: €530
4. **Freelancer:** Submit invoice
5. **Admin:** Navigate to `/admin/invoices`
6. **Admin:** Click "Revisar" on invoice
7. **Admin:** Verify calculations
8. **Admin:** Click "Aprobar Factura"
9. **Client:** Approve milestone (should work now)
10. **Admin:** Click "Procesar Pago"
11. **Verify:** 
    - Invoice status: 'paid'
    - Freelancer wallet: +€530
    - Transaction created

### Scenario 2: Rejection & Resubmission

1. **Admin:** Reject invoice with reason "NIF format incorrect"
2. **Freelancer:** See rejection on `/freelancer/invoices`
3. **Freelancer:** Click "Reenviar"
4. **Freelancer:** Correct tax ID
5. **Freelancer:** Resubmit
6. **Admin:** Approve corrected invoice
7. **Verify:** Payment processes

### Scenario 3: EU Freelancer (No VAT/IRPF)

1. **Freelancer:** Submit invoice with country "FR"
2. **Verify:** Form shows 0% VAT/IRPF
3. **Verify:** Total = Base amount (€500)
4. **Admin:** Approve
5. **Verify:** €500 transferred (no withholding)

### Scenario 4: Invoice Already Submitted

1. **Freelancer:** Try to submit second invoice for same milestone
2. **Verify:** Error "An invoice already exists for this milestone"

### Scenario 5: Amount Mismatch

1. **Freelancer:** Try to submit with base amount €400 (milestone €500)
2. **Verify:** Error "Base amount must match milestone amount"

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Invoice Submission**
   - Invoices submitted per day
   - Submission errors (by reason)
   - Average time to submit

2. **Admin Review**
   - Invoices pending review
   - Average review time
   - Approval vs rejection rate
   - Common rejection reasons

3. **Payment Processing**
   - Invoices paid per day
   - Payment errors
   - Average payment amount
   - Transfer failures

### Logs to Monitor

```typescript
// In process-payment endpoint
console.log('Invoice Payment Processing', {
  invoiceId: id,
  amount: invoice.total_amount,
  transferId: transfer.id,
  status: transfer.status,
});

// Monitor for errors
console.error('Payment Processing Failed', {
  invoiceId: id,
  error: error.message,
  timestamp: new Date(),
});
```

---

## Support & Troubleshooting

### Common Issues

**Issue: "Invoice not found" error**
- Verify invoice belongs to authenticated user
- Check database has invoice record
- Verify milestone index matches

**Issue: "Tax ID format invalid"**
- Check country selection matches tax ID format
- For Spain: 8 digits + letter, or letter + 7 digits + letter
- Other countries: See TAX_ID_PATTERNS in invoice-utils.ts

**Issue: "Invalid IBAN"**
- Verify IBAN starts with country code (ES, FR, etc.)
- Remove spaces and hyphens
- Must be 22-34 characters for most countries
- Spain: 24 characters starting with ES

**Issue: Payment not processing**
- Verify invoice status is 'approved'
- Verify freelancer wallet exists
- Check Supabase logs for RPC errors
- In Phase 3, check Stripe connection

### Getting Help

1. Check database state:
```sql
SELECT id, invoice_number, status FROM invoices 
WHERE freelancer_id = 'user_id' 
ORDER BY created_at DESC;
```

2. Check wallet state:
```sql
SELECT freelancer_id, available_balance, total_earned 
FROM freelancer_wallets 
WHERE freelancer_id = 'user_id';
```

3. Check transactions:
```sql
SELECT * FROM transactions 
WHERE user_id = 'user_id' 
ORDER BY created_at DESC LIMIT 10;
```

---

## Performance Optimization

### Database Indexes
✅ Already created in migration:
- `idx_invoices_freelancer_id`
- `idx_invoices_project_id`
- `idx_invoices_status`
- `idx_invoices_created_at`

### Query Optimization
- Admin list endpoint has pagination (default 50)
- Use status filter to reduce results
- Indexes on status for quick filtering

### Caching Strategy (Optional)
```typescript
// Cache invoice dashboard for 5 minutes
export const revalidate = 300; // seconds
```

---

## Security Audit Checklist

- [ ] Verify role-based access control
- [ ] Test SQL injection scenarios
- [ ] Verify CSRF protection (Next.js built-in)
- [ ] Check XSS prevention in forms
- [ ] Verify sensitive data not logged
- [ ] Test invoice access from other users
- [ ] Verify admin-only endpoints require auth
- [ ] Check rate limiting (if configured)

---

## Compliance Checklist

- [ ] Spain tax requirements documented
- [ ] IVA calculation verified with examples
- [ ] IRPF withholding rates correct
- [ ] Reverse charge for EU B2B implemented
- [ ] Invoice retention period defined
- [ ] Tax ID format validation working
- [ ] Terms of service updated (if needed)
- [ ] Privacy policy updated (if needed)

---

## Success Criteria for Go-Live

✅ All 8 implementation tasks complete
✅ Unit tests passing
✅ Integration tests passing
✅ Admin can create and review invoices
✅ Freelancer can submit and view invoices
✅ Payment processing working correctly
✅ Tax calculations verified
✅ Security audit passed
✅ Performance acceptable (< 200ms for most queries)
✅ Stakeholder sign-off obtained

---

**Last Updated:** November 27, 2025
**Status:** Ready for Phase 1 Deployment
