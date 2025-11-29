# Database Migration Guide

## Overview
This directory contains all SQL migrations needed for the Ad Marketplace project workflow system.

## Quick Start - Production Deployment

### Option 1: Single Script (Recommended)
Run the complete migration script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of:
complete_migration.sql
```

This single file contains all tables, indexes, triggers, and functions needed.

### Option 2: Individual Files
If you prefer to run migrations individually, execute them in this order:

1. `001_create_freelancer_wallets.sql`
2. `002_create_project_invitations.sql`
3. `003_create_freelancer_offers.sql`
4. `004_alter_projects_table.sql`
5. `lock_project_funds.sql`
6. `payment_functions.sql`

## What Gets Created

### Tables
- **freelancer_wallets**: Stores freelancer earnings and available balance
- **project_invitations**: Tracks client invitations to freelancers
- **freelancer_offers**: Stores freelancer proposals with milestones and pricing

### Table Modifications
- **projects**: Adds `freelancer_id` and `milestones` columns

### Functions
- **lock_project_funds**: Moves client funds from available to locked balance
- **complete_milestone_payment**: Transfers funds from client escrow to freelancer wallet
- **process_withdrawal**: Handles freelancer SEPA withdrawals

## Verification

After running the migrations, verify everything was created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('freelancer_wallets', 'project_invitations', 'freelancer_offers');

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('lock_project_funds', 'complete_milestone_payment', 'process_withdrawal');

-- Check projects table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('freelancer_id', 'milestones');
```

## Rollback (if needed)

To rollback all changes:

```sql
-- Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS freelancer_offers CASCADE;
DROP TABLE IF EXISTS project_invitations CASCADE;
DROP TABLE IF EXISTS freelancer_wallets CASCADE;

-- Remove columns from projects
ALTER TABLE projects 
DROP COLUMN IF EXISTS freelancer_id,
DROP COLUMN IF EXISTS milestones;

-- Drop functions
DROP FUNCTION IF EXISTS lock_project_funds;
DROP FUNCTION IF EXISTS complete_milestone_payment;
DROP FUNCTION IF EXISTS process_withdrawal;
```

## Notes

- All tables include `created_at` and `updated_at` timestamps
- Triggers automatically update `updated_at` on modifications
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately
- Indexes are created for all foreign keys and status columns
- All monetary amounts use `DECIMAL(10, 2)` for precision
- Check constraints ensure data integrity (e.g., positive balances)

## Support

If you encounter any issues during migration, check:
1. That the `users`, `projects`, `client_wallets`, and `transactions` tables exist
2. That you have proper permissions in Supabase
3. The Supabase logs for detailed error messages
