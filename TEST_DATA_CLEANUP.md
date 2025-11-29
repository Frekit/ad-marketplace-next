# Test Data Cleanup Guide

**Created**: November 30, 2025
**Purpose**: Track test/demo data created for development and testing

---

## Test Freelancers Created

The following freelancer accounts were created for **testing and demo purposes only**. Delete them when no longer needed.

### Freelancer IDs (UUIDs)

```
550e8400-e29b-41d4-a716-446655440001  → Sarah Johnson (Facebook Ads Specialist)
550e8400-e29b-41d4-a716-446655440002  → Michael Chen (Google Ads Expert)
550e8400-e29b-41d4-a716-446655440003  → Emma Rodriguez (Social Media Manager)
550e8400-e29b-41d4-a716-446655440004  → David Kim (SEO Specialist)
550e8400-e29b-41d4-a716-446655440005  → Lisa Anderson (Email Marketing Strategist)
550e8400-e29b-41d4-a716-446655440006  → James Taylor (Video Marketing Expert)
```

### Email Addresses

```
sarah.johnson@admarket.test
michael.chen@admarket.test
emma.rodriguez@admarket.test
david.kim@admarket.test
lisa.anderson@admarket.test
james.taylor@admarket.test
```

---

## How to Delete Test Freelancers

### Option 1: Delete via Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run this query:

```sql
DELETE FROM users
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006'
);
```

### Option 2: Delete via API Endpoint

Create an admin endpoint like:

```bash
curl -X POST "http://localhost:3000/api/admin/delete-test-data" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your-admin-key"
```

---

## Related Test Data

### API Endpoint for Creating Test Freelancers
- **URL**: `POST /api/admin/create-test-freelancers`
- **Auth**: Requires `x-admin-key` header
- **Purpose**: Creates these 6 test freelancers in the database

### Freelancer Search API
- **URL**: `GET /api/freelancers/search`
- **Note**: Returns these test freelancers when they exist in the database
- **Fallback**: Returns mock data if database freelancers don't exist

---

## Important Notes

⚠️ **These are test accounts with placeholder data:**
- Password hashes are not real (placeholders for demo)
- Profile data is hardcoded (no ability to edit via UI yet)
- Do NOT use in production
- Delete before going live

✅ **Why we created them:**
- Allow testing of freelancer invitation workflow
- Enable testing of real database queries vs. mock data
- Verify that freelancer search returns real IDs that work with API

---

## Files That Reference These IDs

1. **`src/app/api/freelancers/search/route.ts`** - Mock data with these UUIDs
2. **`src/app/api/admin/create-test-freelancers/route.ts`** - Creates these freelancers
3. **`TEST_DATA_CLEANUP.md`** - This file (documentation)

---

## Deletion Checklist

- [ ] Delete freelancers from Supabase `users` table
- [ ] Delete freelancer profiles from `freelancer_profiles` table (if exists)
- [ ] Delete any test projects created with these freelancers
- [ ] Delete any test invitations sent to these freelancers
- [ ] Remove the mock data UUIDs from `/api/freelancers/search` route
- [ ] Update `TEST_DATA_CLEANUP.md` to mark as completed

---

## Next Steps for Production

After deleting test data:

1. **Implement Real Freelancer Registration**
   - Create freelancer sign-up flow
   - Store real freelancer profiles in database
   - Remove mock data from search API

2. **Update Search API**
   - Remove hardcoded mock data
   - Query all freelancers from database
   - Add pagination and filters

3. **Production Considerations**
   - Never use placeholder password hashes
   - Require proper authentication
   - Add verification steps
   - Implement real profile completion

---

**Last Updated**: November 30, 2025
**Status**: ✅ Test freelancers created and documented
