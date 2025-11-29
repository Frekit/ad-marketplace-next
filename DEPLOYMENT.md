# Production Deployment Checklist

## Pre-Deployment

### 1. Database Migrations ✅
- [ ] Backup current Supabase database
- [ ] Open Supabase SQL Editor
- [ ] Copy content from `supabase/migrations/complete_migration.sql`
- [ ] Execute the migration script
- [ ] Verify all tables and functions were created (see verification queries at end of script)
- [ ] Test basic CRUD operations on new tables

### 2. Environment Variables
Ensure all required environment variables are set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_production_url
```

### 3. Code Review
- [ ] Review all new API endpoints for security
- [ ] Ensure all database queries use proper authentication
- [ ] Verify RLS (Row Level Security) policies in Supabase
- [ ] Check that sensitive data is not exposed in API responses

## Deployment Steps

### 1. Deploy to Vercel/Production
```bash
# Build locally first to check for errors
npm run build

# If successful, deploy
git add .
git commit -m "feat: complete project workflow implementation"
git push origin main
```

### 2. Post-Deployment Verification

#### Test Complete Workflow
1. **Client Creates Project**
   - Navigate to `/projects/new`
   - Create a project with title, description, skills
   - Verify project appears in database with status "draft"

2. **Client Invites Freelancer**
   - From freelancers page, invite a freelancer
   - Verify invitation record created in `project_invitations`

3. **Freelancer Submits Offer**
   - Login as freelancer
   - Navigate to `/freelancer/proposals`
   - View proposal and submit offer with milestones
   - Verify offer created in `freelancer_offers`

4. **Client Accepts Offer**
   - Login as client
   - Navigate to `/projects/[id]/offers`
   - Accept an offer
   - Verify:
     - Funds moved from `available_balance` to `locked_balance`
     - Project status changed to "active"
     - Milestones stored in project
     - Transaction record created

5. **Freelancer Completes Milestone**
   - Login as freelancer
   - Navigate to `/freelancer/projects/[id]`
   - Mark milestone as completed
   - Verify milestone status updated

6. **Client Approves Milestone**
   - Login as client
   - Navigate to `/projects/[id]`
   - Approve completed milestone
   - Verify:
     - Funds transferred from client locked to freelancer available
     - Transaction records created for both parties
     - Milestone status changed to "approved"

7. **Freelancer Withdraws Funds**
   - Login as freelancer
   - Navigate to `/freelancer/wallet`
   - Initiate SEPA withdrawal
   - Verify:
     - Balance deducted
     - Withdrawal transaction created with status "pending"

## Known Issues & Limitations

### Current Limitations
1. **Tabs Component**: Missing in payments page (non-critical, can be fixed post-deployment)
2. **Stripe SEPA Integration**: Withdrawal creates pending transaction but doesn't actually transfer to bank (needs Stripe Connect integration)
3. **Notifications**: No email/in-app notifications yet (manual checking required)
4. **File Uploads**: No milestone deliverable uploads yet

### Security Considerations
- [ ] Enable RLS on all new tables
- [ ] Add rate limiting to API endpoints
- [ ] Implement CSRF protection
- [ ] Add input validation on all forms
- [ ] Sanitize user-generated content

## Monitoring

### Key Metrics to Track
1. **Financial**
   - Total funds in escrow (sum of all `locked_balance`)
   - Total freelancer earnings
   - Pending withdrawals
   - Failed transactions

2. **User Activity**
   - Projects created per day
   - Offers submitted per project
   - Offer acceptance rate
   - Average time to milestone completion

3. **System Health**
   - API response times
   - Database query performance
   - Error rates by endpoint

### Recommended Tools
- Vercel Analytics for performance
- Sentry for error tracking
- Supabase Dashboard for database monitoring
- Stripe Dashboard for payment monitoring

## Rollback Plan

If critical issues are found:

1. **Immediate**: Disable new project creation
   ```sql
   -- Temporarily disable project creation
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS creation_disabled BOOLEAN DEFAULT TRUE;
   ```

2. **Database Rollback**: Use rollback script from `supabase/migrations/README.md`

3. **Code Rollback**: Revert to previous deployment
   ```bash
   git revert HEAD
   git push origin main
   ```

## Support & Maintenance

### Regular Maintenance Tasks
- Weekly: Review pending withdrawals and process manually if needed
- Monthly: Audit transaction records for discrepancies
- Quarterly: Review and optimize database indexes

### Emergency Contacts
- Database Admin: [contact]
- Stripe Support: [contact]
- DevOps: [contact]

## Next Steps After Deployment

1. **Stripe SEPA Integration**: Connect real bank transfers
2. **Email Notifications**: Implement transactional emails
3. **Admin Dashboard**: Build monitoring and management interface
4. **Mobile Responsiveness**: Optimize all pages for mobile
5. **Performance Optimization**: Add caching and optimize queries
