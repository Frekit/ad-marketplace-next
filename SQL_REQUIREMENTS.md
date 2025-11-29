# SQL Requirements Summary

## 📊 Complete List of SQL Components Needed

### ✅ INCLUDED IN INVOICE SYSTEM MIGRATIONS

The following are already prepared and ready to execute:

#### 1️⃣ Tables
| Table | File | Status |
|-------|------|--------|
| `invoices` | `005_create_invoices_table.sql` | ✅ Ready |
| `freelancer_wallets` (columns) | `005_create_invoices_table.sql` | ✅ Ready |

#### 2️⃣ Functions  
| Function | File | Status | Used By |
|----------|------|--------|---------|
| `add_wallet_balance()` | `006_invoice_system_complete.sql` | ✅ Ready | Invoice payment processing |
| `complete_milestone_payment()` | `006_invoice_system_complete.sql` | ✅ Ready | Milestone approval |
| `process_withdrawal()` | `006_invoice_system_complete.sql` | ✅ Ready | Freelancer withdrawals |
| `update_invoice_updated_at()` | `006_invoice_system_complete.sql` | ✅ Ready | Auto-update timestamps |

#### 3️⃣ Indexes
| Index | File | Status |
|-------|------|--------|
| `idx_invoices_freelancer_id` | `005_create_invoices_table.sql` | ✅ Ready |
| `idx_invoices_project_id` | `005_create_invoices_table.sql` | ✅ Ready |
| `idx_invoices_status` | `005_create_invoices_table.sql` | ✅ Ready |
| `idx_invoices_created_at` | `005_create_invoices_table.sql` | ✅ Ready |
| `idx_invoices_invoice_number` | `006_invoice_system_complete.sql` | ✅ Ready |

#### 4️⃣ Triggers
| Trigger | Function | File | Status |
|---------|----------|------|--------|
| `trigger_update_invoice_updated_at` | `update_invoice_updated_at()` | `006_invoice_system_complete.sql` | ✅ Ready |

#### 5️⃣ Columns Added to Existing Tables
| Table | Columns | File | Status |
|-------|---------|------|--------|
| `freelancer_wallets` | `legal_name`, `tax_id`, `address`, `postal_code`, `city`, `default_iban`, `default_swift_bic`, `default_irpf_rate`, `is_autonomo` | `006_invoice_system_complete.sql` | ✅ Ready |

---

## 📁 Migration Files Location

```
supabase/migrations/
├── 005_create_invoices_table.sql          ← STEP 1: Run this first
└── 006_invoice_system_complete.sql         ← STEP 2: Run this second
```

**Alternative:** Combined script available in:
- `SQL_MIGRATIONS_COMPLETE.md` - Has both migrations combined for easy copying

---

## 🚀 How to Execute

### Option A: Using Individual Migration Files (Recommended)

**Step 1:** Execute `005_create_invoices_table.sql`
```
1. Go to Supabase Dashboard > SQL Editor
2. Create New Query
3. Copy entire content from: supabase/migrations/005_create_invoices_table.sql
4. Click Execute
```

**Step 2:** Execute `006_invoice_system_complete.sql`
```
1. Create another New Query
2. Copy entire content from: supabase/migrations/006_invoice_system_complete.sql
3. Click Execute
```

### Option B: Using Combined Script

**Step 1:** Execute Combined Migration
```
1. Go to Supabase Dashboard > SQL Editor
2. Create New Query
3. Copy the SQL code from: SQL_MIGRATIONS_COMPLETE.md
4. Click Execute
```

---

## ✨ Verification Checklist

After running migrations, verify with these queries in Supabase SQL Editor:

### Verify Tables
```sql
-- Should return 56 columns
SELECT COUNT(*) as invoices_columns 
FROM information_schema.columns 
WHERE table_name = 'invoices';
```

### Verify Functions
```sql
-- Should return 4 rows
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'add_wallet_balance',
    'complete_milestone_payment', 
    'process_withdrawal',
    'update_invoice_updated_at'
);
```

### Verify Indexes
```sql
-- Should return 5 rows
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'invoices';
```

### Verify Freelancer Wallets Columns
```sql
-- Should return 9 rows
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'freelancer_wallets' 
AND column_name IN (
    'legal_name', 'tax_id', 'address',
    'postal_code', 'city', 'default_iban',
    'default_swift_bic', 'default_irpf_rate', 'is_autonomo'
);
```

---

## 📋 SQL Breakdown by Component

### Invoices Table Features

**Columns:** 56 total
- Invoice metadata (7): `id`, `invoice_number`, `freelancer_id`, `project_id`, `milestone_index`, `created_at`, `updated_at`
- Legal data (6): `freelancer_legal_name`, `freelancer_tax_id`, `freelancer_address`, `freelancer_postal_code`, `freelancer_city`, `freelancer_country`
- Tax config (4): `tax_scenario`, `vat_applicable`, `vat_rate`, `reverse_charge`
- IRPF data (3): `irpf_applicable`, `irpf_rate`, `irpf_amount`
- Financial data (10): `base_amount`, `vat_amount`, `subtotal`, `total_amount`, `issue_date`, `due_date`, `description`, `payment_method`, `iban`, `swift_bic`
- Status & workflow (4): `status`, `rejection_reason`, `approved_at`, `paid_at`
- Stripe integration (2): `stripe_transfer_id`, `stripe_transfer_status`
- PDF storage (2): `pdf_url`, `pdf_filename`
- Constraints (2): UNIQUE on `invoice_number`, UNIQUE on `(project_id, milestone_index)`

### Database Functions Features

**Function 1: `add_wallet_balance()`**
- Parameters: `p_freelancer_id UUID`, `p_amount DECIMAL`
- Creates wallet if not exists
- Updates wallet with new balance
- Sets updated_at timestamp

**Function 2: `complete_milestone_payment()`**
- Parameters: `p_project_id UUID`, `p_milestone_index INT`, `p_amount DECIMAL`, `p_client_id UUID`, `p_freelancer_id UUID`
- Deducts from client locked balance
- Adds to freelancer wallet
- Creates 2 transaction records (client debit + freelancer credit)

**Function 3: `process_withdrawal()`**
- Parameters: `p_freelancer_id UUID`, `p_amount DECIMAL`, `p_iban TEXT`
- Validates sufficient balance
- Deducts from freelancer wallet
- Creates withdrawal transaction
- Returns transaction UUID

---

## 🔒 Data Integrity

All migrations include:
- ✅ Foreign key constraints
- ✅ Check constraints for valid values
- ✅ Unique constraints where needed
- ✅ Default values for timestamps
- ✅ Automatic updated_at triggers
- ✅ Cascade delete for referential integrity

---

## 📱 API Endpoints Using These SQL Objects

| Endpoint | HTTP Method | Function/Table Used |
|----------|------------|-------------------|
| `/api/freelancer/invoices/create` | POST | invoices table, invoice functions |
| `/api/freelancer/invoices` | GET | invoices table |
| `/api/invoices` | GET | invoices table |
| `/api/invoices/[id]/approve` | POST | invoices table |
| `/api/invoices/[id]/reject` | POST | invoices table |
| `/api/invoices/[id]/process-payment` | POST | invoices table, `add_wallet_balance()` |
| `/api/projects/[id]/milestones/[milestoneIndex]/approve` | POST | `complete_milestone_payment()` |

---

## ⏱️ Execution Time

- **Migration 005**: ~2-5 seconds (creates 56-column table + indexes)
- **Migration 006**: ~1-3 seconds (creates 3 functions + 1 trigger)
- **Total**: ~5-10 seconds

---

## 🚨 Important Notes

1. **Idempotent:** All migrations use `IF NOT EXISTS` or `CREATE OR REPLACE`, safe to run multiple times
2. **Order matters:** Run `005` before `006`
3. **Permissions:** Must use `SUPABASE_SERVICE_ROLE_KEY`, not anon key
4. **No breaking changes:** These migrations don't modify existing tables except `freelancer_wallets` (adds columns)
5. **Reversible:** Each can be undone individually if needed

---

## 📞 If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| "relation 'invoices' already exists" | Table already created, safe to continue |
| "function add_wallet_balance already exists" | Uses CREATE OR REPLACE, safe to continue |
| "column 'legal_name' already exists" | Uses IF NOT EXISTS, safe to continue |
| "relation 'users' does not exist" | Run base schema first (schema.sql, etc.) |
| Permission denied | Check SUPABASE_SERVICE_ROLE_KEY is correct |
| Syntax error | Copy exact SQL from provided files, don't edit |

---

**Status:** ✅ All SQL components prepared and ready
**Last Updated:** November 27, 2025
**Next Step:** Execute migrations in Supabase SQL Editor
