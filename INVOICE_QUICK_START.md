# Invoice System - Quick Start Guide

## 📋 What Was Built

A complete mandatory invoice system that enforces Spanish tax compliance before freelancers receive payment. Freelancers must submit legally compliant invoices that admins review and approve before funds are transferred.

## 🎯 Key Features

✅ **Freelancer Invoice Submission**
- Auto-populated legal data form
- Real-time tax calculation (VAT + IRPF)
- Automatic invoice number generation (INV-YYYY-MM-XXXXX)
- PDF storage and download

✅ **Admin Invoice Review**
- Dashboard with statistics
- Status filtering (pending, approved, rejected, paid)
- Detailed invoice view with verification checklist
- Approve/Reject/Process Payment actions

✅ **Spanish Tax Compliance**
- 21% VAT (IVA) for domestic invoices
- 7-19% IRPF withholding for Spanish freelancers
- Reverse charge for EU B2B (0% VAT)
- Tax ID validation (NIF/CIF format)
- IBAN/SWIFT validation

✅ **Integrated Payment Flow**
- Prevents payment without approved invoice
- SEPA transfer processing
- Automatic wallet top-up
- Transaction recording

## 📂 New Files Created

```
src/
├── types/invoice.ts                                    # Type definitions
├── lib/invoice-utils.ts                               # Enhanced utility functions
├── components/
│   ├── invoice-form.tsx                               # Freelancer form
│   ├── invoice-list.tsx                               # Freelancer invoice list
│   ├── admin-invoice-dashboard.tsx                    # Admin overview
│   └── admin-invoice-detail.tsx                       # Admin detail view
├── app/
│   ├── api/
│   │   ├── freelancer/invoices/route.ts               # List invoices
│   │   ├── freelancer/invoices/create/route.ts        # Create (updated)
│   │   ├── invoices/route.ts                          # Admin list
│   │   └── invoices/[id]/
│   │       ├── approve/route.ts                       # Admin approve
│   │       ├── reject/route.ts                        # Admin reject
│   │       └── process-payment/route.ts               # Admin payment
│   ├── freelancer/
│   │   ├── projects/[id]/invoice/new/page.tsx        # Submission page
│   │   └── invoices/
│   │       ├── page.tsx                               # List page
│   │       └── [id]/page.tsx                          # Detail page
│   └── admin/
│       └── invoices/
│           ├── page.tsx                               # Dashboard page
│           └── [id]/page.tsx                          # Detail page
└── supabase/migrations/
    └── 005_create_invoices_table.sql                  # (Existing)
```

## 🚀 Getting Started

### Step 1: Database Migration
```bash
# In Supabase SQL Editor, run:
# supabase/migrations/005_create_invoices_table.sql
```

### Step 2: Test the Flow

**As a Freelancer:**
1. Go to: `/freelancer/projects/{projectId}/invoice/new?milestone=0`
2. Fill out invoice form
3. Submit
4. View status at: `/freelancer/invoices`

**As an Admin:**
1. Go to: `/admin/invoices`
2. Click "Revisar" on pending invoice
3. Verify calculations and data
4. Click "Aprobar Factura"
5. Click "Procesar Pago"

**As a Client:**
1. Try to approve milestone
2. System requires approved invoice
3. Once freelancer submits and admin approves, payment processes automatically

### Step 3: Deploy
```bash
npm run build  # Verify no errors
git push       # Deploy to production
```

## 📊 Useful URLs

### Freelancer Routes
- List invoices: `/freelancer/invoices`
- View invoice: `/freelancer/invoices/{invoiceId}`
- Submit invoice: `/freelancer/projects/{projectId}/invoice/new`

### Admin Routes
- Dashboard: `/admin/invoices`
- Review invoice: `/admin/invoices/{invoiceId}`

### API Endpoints
- `GET /api/freelancer/invoices` - List user's invoices
- `POST /api/freelancer/invoices/create` - Submit invoice
- `GET /api/invoices` - Admin list all
- `POST /api/invoices/{id}/approve` - Approve
- `POST /api/invoices/{id}/reject` - Reject with reason
- `POST /api/invoices/{id}/process-payment` - Process payment

## 💰 Tax Calculation Examples

### Spain (ES) - Domestic
```
Base:       €500.00
IVA 21%:   +€105.00
Subtotal:   €605.00
IRPF 15%:   -€75.00
Transfer:   €530.00
```

### France (FR) - EU B2B
```
Base:       €500.00
IVA:         €0.00  (reverse charge)
IRPF:        €0.00  (not applicable)
Transfer:   €500.00
```

## 🔐 Security

✅ Role-based access control (freelancer/admin/client)
✅ Server-side validation of all inputs
✅ Tax ID format validation
✅ IBAN format validation
✅ Amount verification against milestone
✅ User ownership verification

## ⚙️ Configuration

### Tax Scenarios
- `es_domestic`: Spanish freelancer (21% VAT + 7-19% IRPF)
- `eu_b2b`: EU freelancer (0% VAT, reverse charge)
- `non_eu`: Non-EU (0% VAT, no IRPF)

### Invoice Status Flow
```
pending → under_review → approved → paid
                      ↘ rejected (with reason, can resubmit)
```

### Milestone Status Integration
```
OLD: completed → approved → payment released
NEW: completed → (invoice required) → approved → payment released
```

## 📱 Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive design)

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Invoice not appearing | Refresh page, verify freelancer_id matches |
| Tax calculation wrong | Check country selection, review formulas |
| Payment won't process | Verify invoice status is 'approved' |
| IBAN validation fails | Remove spaces, check country code, format |
| Tax ID validation fails | Select correct country, use proper format |

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify database migration ran
3. Check Supabase logs
4. Review implementation guide: `INVOICE_SYSTEM_IMPLEMENTATION.md`
5. See setup guide: `INVOICE_SETUP_GUIDE.md`

## ✅ Verification Checklist

Before going live, verify:
- [ ] Database migration executed
- [ ] All API endpoints responding
- [ ] Freelancer can submit invoice
- [ ] Admin can view invoices
- [ ] Tax calculations correct
- [ ] Payment processing works
- [ ] Milestone approval requires invoice
- [ ] Email notifications (if configured)
- [ ] PDF generation works
- [ ] Mobile UI responsive

## 🔄 Future Enhancements

1. **Real Stripe Integration** - Replace test SEPA transfers
2. **PDF Generation** - Auto-generate professional PDFs
3. **Email Notifications** - Notify users of status changes
4. **Reporting Dashboard** - Tax and payment reports
5. **Additional Countries** - Support more tax scenarios
6. **Digital Signatures** - Sign invoices digitally

## 📚 Documentation

- Full implementation: `INVOICE_SYSTEM_IMPLEMENTATION.md`
- Setup & deployment: `INVOICE_SETUP_GUIDE.md`

---

**Status:** ✅ READY FOR DEPLOYMENT
**Version:** 1.0
**Last Updated:** November 27, 2025
