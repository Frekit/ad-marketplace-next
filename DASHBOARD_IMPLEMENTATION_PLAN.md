# 📊 Dashboard Implementation Plan

## Overview
This document outlines all UI/UX components visible in the dashboard that lack complete backend implementation or functional integration. The goal is to systematically activate these features to create a fully functional dashboard experience.

---

## 🎯 PRIORITY LEVELS

- **🔴 Critical**: Core functionality that blocks user workflows
- **🟠 High**: Important features that enhance user experience significantly
- **🟡 Medium**: Nice-to-have features that improve dashboard completeness
- **🟢 Low**: Polish and minor enhancements

---

## 📋 FREELANCER DASHBOARD FEATURES

### Feature 1: Profile Completion Tracking 🔴
**Current State**: Shows 0% always. UI exists but backend doesn't calculate completion.

**What's Visible**:
- Progress bar showing percentage (always 0%)
- Profile completion alert card
- Link to profile settings

**What's Missing**:
- Backend calculation of profile completion %
- Check which profile fields are filled
- Update percentage based on: bio, skills, experience, portfolio, rate, verification status

**Implementation Tasks**:
1. **Create new endpoint**: `GET /api/freelancer/profile/completion`
   - Check: bio (text not empty), skills (array length > 0), experience (text not empty), portfolio (items array > 0), hourly_rate (set), verification_status (approved)
   - Return: `{ completionPercentage: number, missingFields: string[] }`

2. **Update Frontend API call** in `src/app/dashboard/freelancer/page.tsx`
   - Fetch completion percentage from new endpoint
   - Pass to `<Card>` component showing progress

3. **Database Query**:
   ```sql
   SELECT
     bio,
     skills,
     hourly_rate,
     verification_status
   FROM freelancer_profiles
   WHERE user_id = $1;

   SELECT COUNT(*) as portfolio_count
   FROM portfolio_items
   WHERE freelancer_id = $1;
   ```

4. **Calculate Logic**:
   - 20% = Bio filled
   - 20% = Skills added (minimum 3)
   - 20% = Hourly rate set
   - 20% = At least 1 portfolio item
   - 20% = Identity verified

**Expected Output**: "Tu perfil está 60% completo. Completa tu biografía y añade experiencia."

---

### Feature 2: Profile Views Statistics 🟠
**Current State**: Shows "0" always. Not tracked anywhere.

**What's Visible**:
- Stat card: "Profile Views" with number and "Last 30 days"
- Uses TrendingUp icon

**What's Missing**:
- No profile view tracking system
- No database table for tracking views
- No logic to increment counter when freelancer profile is visited

**Implementation Tasks**:
1. **Create Database Table**:
   ```sql
   CREATE TABLE profile_views (
     id UUID PRIMARY KEY,
     freelancer_id UUID REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
     viewer_type VARCHAR(20), -- 'client' or 'guest'
     viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
     viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     viewer_ip VARCHAR(50),
     user_agent TEXT
   );

   CREATE INDEX idx_profile_views_freelancer_date
   ON profile_views(freelancer_id, viewed_at);
   ```

2. **Create Tracking Endpoint**: `POST /api/profile-views`
   - Log view when freelancer profile page loads
   - Check if already viewed in last hour (prevent duplicate counts)
   - Increment counter in cache/database

3. **Create Stats Endpoint**: `GET /api/freelancer/stats/profile-views`
   - Count views from last 30 days
   - Filter by viewer_type (clients vs guests)
   - Return: `{ total: number, clients: number, guests: number, trend: number }`

4. **Update Frontend** in freelancer dashboard
   - Fetch from new endpoint
   - Display total count
   - Show trend (up/down from previous period)

5. **Add View Tracking** to freelancer profile page (`src/app/profile/[id]/page.tsx`)
   - Call tracking endpoint on page load
   - Pass freelancer_id and viewer_id (if logged in)

**Expected Output**: "156 Profile Views (Last 30 days)" with TrendingUp icon

---

### Feature 3: Action Required Tasks 🟠
**Current State**: Hardcoded task cards with non-functional "Completar" buttons.

**What's Visible**:
```
- Añade una descripción profesional (Add profile description)
- Añade experiencia profesional (Add professional experience)
- Verifica tu identidad (Verify identity)
```
All buttons say "Completar" but don't navigate anywhere.

**What's Missing**:
- Links to actual implementation pages
- Task completion tracking
- Backend logic to determine which tasks to show

**Implementation Tasks**:
1. **Create Task Tracking System**:
   ```sql
   CREATE TABLE freelancer_onboarding_tasks (
     id UUID PRIMARY KEY,
     freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
     task_type VARCHAR(50), -- 'profile_description', 'experience', 'verification', etc.
     completed BOOLEAN DEFAULT FALSE,
     completed_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(freelancer_id, task_type)
   );
   ```

2. **Create Endpoint**: `GET /api/freelancer/onboarding/tasks`
   - Check profile fields and return list of incomplete tasks
   - Return: `{ tasks: { type: string, label: string, completed: boolean, url: string }[] }`
   - Tasks to check:
     - `profile_description`: bio is empty
     - `experience`: no experience records
     - `verification`: verification_status != 'approved'
     - `skills`: no skills added
     - `portfolio`: no portfolio items

3. **Update Frontend Component**:
   - Replace hardcoded tasks with fetched data
   - Make buttons link to actual pages:
     - `profile_description` → `/freelancer/profile-settings#bio`
     - `experience` → `/freelancer/profile-settings#experience`
     - `verification` → `/freelancer/verification`
     - `skills` → `/freelancer/profile-settings#skills`
     - `portfolio` → `/freelancer/profile-settings#portfolio`

4. **Add Task Completion Tracking**:
   - Mark task as completed when user fills in the field
   - Show checkmark when completed
   - Hide completed tasks or move to "Completed" section

**Expected Output**:
- Dynamic list of 1-3 tasks based on missing data
- Buttons link to correct pages
- Completed tasks show checkmark and disappear

---

### Feature 4: Calendar Section 🟡
**Current State**: Placeholder with "No tienes eventos próximos" message.

**What's Visible**:
- Calendar component (appears to be a simple placeholder)
- "Ver calendario" button (not functional)
- "No tienes eventos próximos" empty state

**What's Missing**:
- Calendar implementation
- Event/milestone system
- Backend data for project milestones and deadlines
- Link to full calendar view

**Implementation Tasks** (Optional/Future):
1. **Option A - Simple Deadline View** (Easier, 🟢 Low Priority):
   - Show next 5 project milestones/deadlines
   - List view instead of calendar grid
   - Fetch from `freelancer_projects` deadlines
   - No actual calendar component needed

2. **Option B - Full Calendar** (More Complex, 🔴 if needed):
   - Integrate library (react-big-calendar or similar)
   - Create `freelancer_calendar_events` table
   - Include: project deadlines, payment dates, meetings, milestones
   - Sync with project milestones automatically

**Recommendation**: Start with Option A (simple list of upcoming deadlines)

---

### Feature 5: Proposal Details Navigation 🟠
**Current State**: "Ver detalles" button on each proposal card is hardcoded, not linked.

**What's Visible**:
- Proposal cards in "My Proposals" section
- Each card has a "Ver detalles" button
- Button doesn't navigate anywhere

**What's Missing**:
- Button onClick handler
- Navigation to proposal detail page

**Implementation Tasks**:
1. **Simple Fix** - Update button in dashboard:
   ```tsx
   // FROM:
   <Button>Ver detalles</Button>

   // TO:
   <Button onClick={() => router.push(`/freelancer/proposals/${proposal.id}`)}>
     Ver detalles
   </Button>
   ```

2. **Already Implemented**: The detail page already exists at `/freelancer/proposals/[id]/page.tsx`

**Expected Output**: Clicking "Ver detalles" opens full proposal detail page

---

## 📋 CLIENT DASHBOARD FEATURES

### Feature 6: Top Freelancers Recommendation 🟠
**Current State**: Hardcoded placeholder showing "John Doe" twice.

**What's Visible**:
- "Top Freelancers for You" section
- 2 cards with freelancer info: name, skills badges, availability, hourly rate
- Shows hardcoded placeholder data

**What's Missing**:
- Backend recommendation algorithm
- Filtering by project skills
- Ranking by ratings/reviews
- Database queries to fetch actual freelancers

**Implementation Tasks**:
1. **Create Recommendation Endpoint**: `GET /api/client/freelancers/recommended`
   - Query parameters: `projectId` or `skills[]`
   - Get projects by client
   - Extract required skills from last 3-5 projects
   - Find freelancers with matching skills
   - Rank by: rating (desc), completed projects (desc), reviews (desc)
   - Limit to top 5, randomly select 2 for dashboard
   - Return: `{ id, name, skills, hourly_rate, rating, availability }`

2. **Database Query**:
   ```sql
   SELECT
     u.id,
     u.first_name,
     u.last_name,
     fp.hourly_rate,
     fp.skills,
     fp.availability,
     COALESCE(AVG(r.rating), 0) as avg_rating,
     COUNT(DISTINCT fp.id) as completed_projects
   FROM freelancer_profiles fp
   JOIN users u ON u.id = fp.user_id
   LEFT JOIN reviews r ON r.freelancer_id = u.id AND r.verified = TRUE
   WHERE fp.skills && $1 -- Array overlap with required skills
   AND fp.verification_status = 'approved'
   AND fp.availability IN ('available', 'semi-available')
   GROUP BY u.id, u.first_name, u.last_name, fp.hourly_rate, fp.skills, fp.availability
   ORDER BY avg_rating DESC, completed_projects DESC
   LIMIT 5;
   ```

3. **Update Frontend**:
   - Replace hardcoded data with API call
   - Fetch on component mount
   - Show loading skeleton while fetching
   - Display actual freelancer data

4. **Add "View Profile" Link**:
   - Make freelancer card clickable
   - Navigate to `/freelancers/[id]` to view profile

**Expected Output**: Shows 2 different freelancers with actual data matching client's project needs

---

### Feature 7: Active Projects Section 🔴
**Current State**: Shows empty state message but doesn't display actual projects when they exist.

**What's Visible**:
- "Active Projects" section heading
- Empty state: "No tienes proyectos activos"
- "Crear nuevo proyecto" button

**What's Missing**:
- Project list rendering logic
- Conditional display (show list when projects exist, show empty state when none)
- Project card component/styling
- Status badges

**Implementation Tasks**:
1. **Create Project Card Component** (if not exists):
   ```tsx
   // src/components/ProjectCard.tsx
   interface ProjectCardProps {
     id: string;
     title: string;
     status: 'active' | 'completed' | 'paused' | 'draft';
     budget: number;
     proposalsReceived: number;
     postedDate: string;
     deadline: string;
     onViewDetails: () => void;
   }
   ```

2. **Fetch Active Projects**:
   - Query `projects` table where client_id = current_user AND status = 'active'
   - Include proposal counts
   - Sort by created_at DESC

3. **Update Component Logic**:
   ```tsx
   // If projects exist:
   {projects.length > 0 ? (
     <div className="grid gap-4">
       {projects.map(project => (
         <ProjectCard key={project.id} {...project} />
       ))}
     </div>
   ) : (
     // Empty state
   )}
   ```

4. **Add Navigation**:
   - "View project details" link per project
   - Link to `/projects/[id]` or `/dashboard/client/projects/[id]`

5. **Add Filters** (Optional):
   - Filter by status (Active, Completed, Paused)
   - Sort by date, budget, proposals received

**Expected Output**: Shows 3-5 active projects with cards displaying title, status, budget, proposals received, deadline

---

## 📋 ADMIN DASHBOARD FEATURES

### Feature 8: Revenue Calculation 🟠
**Current State**: Shows "Total Revenue: €0.00" (or very low number)

**What's Visible**:
- Purple stat card showing total revenue in EUR
- Label: "Total Revenue"

**What's Missing**:
- Proper calculation from paid invoices
- Including commission system
- Excluding pending/unpaid invoices
- Period filtering (should be current year or all-time)

**Implementation Tasks**:
1. **Update API Endpoint**: `GET /api/admin/stats`
   - Change revenue calculation:
   ```sql
   SELECT
     SUM(amount) as totalRevenue
   FROM invoices
   WHERE status = 'paid'
   AND paid_at >= DATE_TRUNC('year', CURRENT_DATE);
   ```

2. **Add Revenue Breakdown**:
   - Show "This Month" revenue
   - Show "This Year" revenue
   - Show "All Time" revenue
   - Return all 3 in API response

3. **Update Frontend**:
   - Display "Total Revenue: €X.XXX" with actual calculated value
   - Add small text: "This year" or "All time"
   - Add trend indicator (up/down from last period)

**Expected Output**: Shows actual revenue total based on paid invoices

---

### Feature 9: Invoice Status Distribution Chart 🟡
**Current State**: Chart displays but may have incorrect data or not updating.

**What's Visible**:
- Pie chart showing invoice status breakdown
- Categories: Pending, Approved, Paid, Rejected
- Uses Recharts library

**What's Missing**:
- Verify data accuracy from API
- Real-time updates
- Color coding consistency
- Proper legend

**Implementation Tasks**:
1. **Verify API Data**: `GET /api/admin/stats`
   - Check `invoiceStatus` object has all statuses
   - Ensure counts are accurate

2. **Add Color Coding**:
   ```tsx
   const statusColors = {
     pending: '#FFA500',    // Orange
     approved: '#4CAF50',   // Green
     paid: '#2196F3',       // Blue
     rejected: '#F44336',   // Red
   };
   ```

3. **Add Data Labels**:
   - Show percentages on chart
   - Show legend with counts
   - Add tooltip with exact numbers

**Expected Output**: Accurate pie chart with color-coded invoice statuses

---

### Feature 10: User Distribution Chart 🟡
**Current State**: Bar chart displays user counts by type.

**What's Visible**:
- Bar chart showing: Clients, Freelancers, Total Users
- Uses Recharts library

**What's Missing**:
- Verify accuracy of counts
- Time-series data (trend over time)
- Add comparison with previous period

**Implementation Tasks**:
1. **Enhance Data**:
   - Keep current simple bar chart
   - Add separate card showing user growth trend
   - Add monthly/weekly user signup counts

2. **Create Chart for User Trends** (Optional):
   ```sql
   SELECT
     DATE_TRUNC('month', created_at) as month,
     COUNT(*) as new_users,
     COUNT(*) FILTER (WHERE role = 'client') as new_clients,
     COUNT(*) FILTER (WHERE role = 'freelancer') as new_freelancers
   FROM users
   WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
   GROUP BY DATE_TRUNC('month', created_at)
   ORDER BY month DESC;
   ```

3. **Update Frontend**:
   - Add line chart showing user growth over time
   - Show current month vs previous month comparison

**Expected Output**: Shows current user distribution + growth trend over time

---

### Feature 11: Quick Action Links 🟢
**Current State**: 5 action cards are hardcoded and working.

**What's Visible**:
- Verificaciones (Verifications)
- Proyectos (Projects)
- Invoices
- Usuarios (Users)
- Transacciones (Transactions)

**Status**: ✅ Already functional - links work correctly

**Optional Enhancements**:
1. Add unread count badges to action cards
2. Add icon to show status/alerts (e.g., "5 pending verifications")
3. Add quick stats to each card

---

## 🛠️ TECHNICAL REQUIREMENTS

### Database Migrations Needed:
1. **profile_views table** - For tracking freelancer profile visits
2. **freelancer_onboarding_tasks table** - For task tracking
3. **Add indexes** for performance on large datasets

### New API Endpoints Needed:
1. `GET /api/freelancer/profile/completion` - Profile completion %
2. `POST /api/profile-views` - Log profile view
3. `GET /api/freelancer/stats/profile-views` - Get view count
4. `GET /api/freelancer/onboarding/tasks` - Get pending tasks
5. `GET /api/client/freelancers/recommended` - Get recommended freelancers
6. Update `GET /api/admin/stats` - Better revenue calculation

### Frontend Updates Needed:
1. Update freelancer dashboard component to fetch dynamic data
2. Update client dashboard component
3. Update admin dashboard stats
4. Add navigation handlers to buttons
5. Add loading states and error handling

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Core Freelancer Features (Week 1)
Priority: 🔴 Critical
- Feature 1: Profile Completion Tracking
- Feature 3: Action Required Tasks
- Feature 5: Proposal Details Navigation

**Time Estimate**: 2-3 days
**Impact**: Unblocks user onboarding and main workflows

### Phase 2: Analytics & Tracking (Week 2)
Priority: 🟠 High
- Feature 2: Profile Views Statistics
- Feature 4: Calendar Section (Simple Version)
- Feature 8: Revenue Calculation (Admin)

**Time Estimate**: 2-3 days
**Impact**: Provides visibility into performance and analytics

### Phase 3: Recommendations & Smart Features (Week 3)
Priority: 🟠 High
- Feature 6: Top Freelancers Recommendation
- Feature 7: Active Projects Section (Client)

**Time Estimate**: 2-3 days
**Impact**: Improves user engagement through personalization

### Phase 4: Polish & Analytics (Week 4)
Priority: 🟡 Medium
- Feature 9: Invoice Status Chart Verification
- Feature 10: User Distribution Enhancement
- General dashboard polish

**Time Estimate**: 1-2 days
**Impact**: UI completeness and professional appearance

---

## ✅ SUCCESS CRITERIA

After completion, the dashboard should:
- [ ] Show accurate profile completion percentage (0-100%)
- [ ] Track and display profile views with trends
- [ ] Display dynamic list of pending onboarding tasks
- [ ] Link all action buttons to functional pages
- [ ] Show real freelancer recommendations based on skills
- [ ] Display active projects for clients with full details
- [ ] Show accurate admin statistics and revenue
- [ ] Have no hardcoded placeholder data visible
- [ ] Load with appropriate skeleton/loading states
- [ ] Handle empty states gracefully
- [ ] Display real-time data (within 5-minute refresh)

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Start Small**: Begin with Feature 1 (Profile Completion) as it's critical and straightforward
2. **Test Thoroughly**: Each feature should have test data to validate
3. **User Feedback**: After implementing, gather feedback from actual users
4. **Performance**: Monitor query performance as data grows
5. **Caching**: Consider caching profile views and stats for performance
6. **Real-time**: Consider WebSocket/polling for real-time stats updates in future
7. **Mobile**: Ensure all new features work on mobile views
8. **Accessibility**: Follow WCAG guidelines for all interactive elements

---

## 📊 FEATURE DEPENDENCY MAP

```
Profile Completion (1)
    ↓
Action Required Tasks (3) [depends on 1 being tracked]
    ↓
Profile Views (2) [independent]

Proposal Navigation (5) [independent]
    ↓
Calendar (4) [uses proposal deadlines]

Client Dashboard:
  - Recommended Freelancers (6) [uses freelancer ratings from reviews]
  - Active Projects (7) [independent]

Admin Dashboard:
  - Revenue Calculation (8) [independent]
  - Charts (9, 10) [use stats endpoint]
```

---

## 🎯 NEXT STEPS

1. Review this plan and prioritize features based on business needs
2. Start with Phase 1 (Freelancer core features)
3. Create database migrations
4. Implement API endpoints
5. Update frontend components
6. Test with real data
7. Deploy and monitor
8. Move to Phase 2

