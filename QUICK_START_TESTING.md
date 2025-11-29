# Quick Start Testing Guide

## 🚀 Getting Started with Testing

The AdMarketplace application is now running on **http://localhost:3000** with all new features compiled and ready.

---

## 📍 Feature URLs Map

### Freelancer Features
| Feature | URL | Route File |
|---------|-----|-----------|
| Dashboard | `/dashboard/freelancer` | `src/app/dashboard/freelancer/page.tsx` |
| Profile Settings | `/freelancer/profile-settings` | `src/app/freelancer/profile-settings/page.tsx` |
| Reviews | `/freelancer/reviews` | `src/app/freelancer/reviews/page.tsx` |
| Messages | `/freelancer/messages` | `src/app/freelancer/messages/page.tsx` |
| Notifications | `/freelancer/notifications` | `src/app/freelancer/notifications/page.tsx` |

### API Endpoints
| Feature | Endpoint | Method |
|---------|----------|--------|
| Get Profile | `/api/freelancer/profile` | GET |
| Update Profile | `/api/freelancer/profile` | PUT |
| Get Reviews | `/api/reviews/freelancer/[id]` | GET |
| Get Notifications | `/api/notifications` | GET |
| Update Notification | `/api/notifications/[id]` | PATCH |
| Mark All Read | `/api/notifications/mark-all-read` | POST |
| Get Conversations | `/api/conversations` | GET |
| Get Messages | `/api/conversations/[id]/messages` | GET |
| Send Message | `/api/conversations/[id]/messages` | POST |

---

## 🧪 Test Case 1: Profile Editing

### Objective
Verify freelancer can edit their profile and save changes.

### Steps
1. **Navigate to Profile Settings**
   ```
   URL: http://localhost:3000/freelancer/profile-settings
   Expected: Profile form loads with current data
   ```

2. **Edit Profile Information**
   - Update first name (e.g., "John" → "Jon")
   - Update last name (e.g., "Doe" → "Smith")
   - Update bio (enter new text, watch 500 char counter)
   - Update hourly rate (try €25.50)
   - Select availability (click "Busy")

3. **Add Skills**
   - Type "React" in skills input
   - Click suggestion or press Enter
   - Type "TypeScript" and add
   - Type "Node.js" and add
   - Verify max 15 skills limit

4. **Save Changes**
   - Click "Guardar cambios" button
   - Watch for loading spinner
   - Verify success message appears (green)

5. **Verify Persistence**
   - Refresh page (F5)
   - Confirm all changes are still present

### Expected Results
- ✅ Form submits without errors
- ✅ Success message appears
- ✅ Data persists after refresh
- ✅ Skills display as badges
- ✅ Character counter works

---

## 💬 Test Case 2: Messaging System

### Objective
Verify freelancer can view conversations and send messages.

### Steps
1. **Navigate to Messages**
   ```
   URL: http://localhost:3000/freelancer/messages
   Expected: Two-panel layout (conversations + messages)
   ```

2. **View Conversations List**
   - Verify list shows conversations
   - Check for participant name
   - Look for last message preview
   - Check for unread badge (if applicable)
   - Note the time ago (e.g., "2h")

3. **Select Conversation**
   - Click on a conversation in left panel
   - Right panel should show message history
   - Verify messages load

4. **Send a Message**
   - Type message in input field: "Testing messaging system"
   - Click send button or press Enter
   - Watch loading state
   - Verify message appears in thread

5. **Verify Auto-Refresh**
   - Wait 3 seconds
   - New messages should appear if any

### Expected Results
- ✅ Conversations list loads with data
- ✅ Selected conversation highlights
- ✅ Messages display with timestamps
- ✅ Send button is clickable
- ✅ Messages persist in thread
- ✅ Auto-refresh updates thread

---

## 🔔 Test Case 3: Notifications System

### Objective
Verify notification bell and notification center work.

### Steps
1. **Check Notification Bell**
   ```
   URL: http://localhost:3000/freelancer/messages
   Look for bell icon in top-right of header
   Expected: Bell icon visible (may show red dot if unread)
   ```

2. **Open Notification Dropdown**
   - Click bell icon
   - Dropdown should appear
   - Shows up to 5 recent unread notifications
   - Each shows: icon, type, message, timestamp

3. **Navigate to Notifications Page**
   - Click "Ver todas las notificaciones" → in dropdown
   - OR navigate directly: http://localhost:3000/freelancer/notifications
   - Expected: Full notifications page loads

4. **Test Filtering**
   - Click "Sin leer" button (show unread only)
   - Verify list filters to unread only
   - Click again to show all notifications
   - Verify count updates

5. **Mark as Read**
   - Click checkmark icon on unread notification
   - Verify it moves to read section
   - Verify unread count decreases
   - Click "Marcar todo como leído"
   - Verify all marked as read

### Expected Results
- ✅ Bell icon displays in header
- ✅ Dropdown opens/closes
- ✅ Shows unread notifications
- ✅ Links navigate correctly
- ✅ Filtering works
- ✅ Mark as read updates UI
- ✅ Count badges update

---

## ⭐ Test Case 4: Reviews System

### Objective
Verify reviews page displays freelancer ratings.

### Steps
1. **Navigate to Reviews**
   ```
   URL: http://localhost:3000/freelancer/reviews
   Expected: Reviews page loads
   ```

2. **Check Reviews Statistics**
   - Verify average rating displays (e.g., 4.8/5.0)
   - Check star visualization (yellow filled stars)
   - Verify total review count (e.g., "Basado en 12 reseñas")

3. **View Individual Reviews**
   - Scroll through review list
   - Verify each shows:
     - Client name
     - Star rating
     - Review text
     - Time ago (e.g., "hace 2 días")

4. **Test Empty State** (if no reviews)
   - Should show: "Aún no tienes reseñas"
   - Icon and explanation text

### Expected Results
- ✅ Reviews page loads
- ✅ Statistics display correctly
- ✅ Reviews show complete info
- ✅ Time formatting works
- ✅ Empty state displays properly

---

## 🔐 Test Case 5: Security Headers

### Objective
Verify security headers are present in responses.

### Steps
1. **Open DevTools**
   - Press F12 or right-click → Inspect
   - Go to Network tab

2. **Trigger Page Load**
   - Reload page (F5)
   - Click on main document request
   - Go to Response Headers section

3. **Verify Headers Present**
   ```
   Look for these headers:
   ✅ X-Frame-Options: SAMEORIGIN
   ✅ X-Content-Type-Options: nosniff
   ✅ X-XSS-Protection: 1; mode=block
   ✅ Referrer-Policy: strict-origin-when-cross-origin
   ✅ Permissions-Policy: camera=(), microphone=(), ...
   ✅ Content-Security-Policy: default-src 'self'; ...
   ✅ Access-Control-*: (if cross-origin)
   ```

### Expected Results
- ✅ All security headers present
- ✅ No errors in console
- ✅ Page loads normally

---

## 📊 Test Case 6: Rate Limiting

### Objective
Verify rate limiting works correctly.

### Prerequisites
- Open DevTools Console
- Have access to API endpoint

### Steps
1. **Get Your Freelancer ID**
   - Open DevTools → Application/Storage
   - Look for session or auth token (if visible)
   - OR check from a successful API call response

2. **Test Rate Limit via API**
   ```javascript
   // Open console and run:
   async function testRateLimit() {
     for (let i = 0; i < 110; i++) {
       try {
         const res = await fetch('/api/reviews/freelancer/YOUR_ID');
         console.log(`Request ${i + 1}:`, res.status);
       } catch (e) {
         console.error(`Request ${i + 1} failed:`, e);
       }
     }
   }
   testRateLimit();
   ```

3. **Watch for 429 Response**
   - After 100 requests in 60 seconds
   - Should get 429 (Too Many Requests)
   - Check response headers for X-RateLimit-*

### Expected Results
- ✅ First 100 requests succeed (200 status)
- ✅ Request 101+ return 429 status
- ✅ X-RateLimit-Remaining header present
- ✅ Retry-After header present

---

## 🐛 Debugging Tips

### If Features Don't Load
1. **Check Console for Errors**
   - Press F12 → Console tab
   - Look for red error messages
   - Note the exact error message

2. **Check Network Requests**
   - Press F12 → Network tab
   - Reload page
   - Look for failed requests (red)
   - Click on failed request for details

3. **Verify Session**
   - Must be logged in as freelancer
   - Session required for protected routes
   - Check Application → Cookies for session

### If API Doesn't Respond
1. **Check Backend Server**
   ```bash
   # Terminal: Check if dev server is running
   curl http://localhost:3000
   # Should get 200 response
   ```

2. **Check Database Connection**
   - API calls depend on Supabase
   - Verify .env.local has SUPABASE_* variables

3. **Check Browser Console**
   - Network errors show in DevTools
   - CORS errors show as red crosses

---

## 📱 Testing Different Screen Sizes

### Mobile (375px - 480px)
```
Testing URLs:
- /freelancer/profile-settings (form stacking)
- /freelancer/messages (responsive layout)
- /freelancer/notifications (list view)

Expected: Single-column layout, touch-friendly buttons
```

### Tablet (768px - 1024px)
```
Testing URLs: All of above

Expected: Two-column or adaptive layout
```

### Desktop (1440px+)
```
Testing URLs: All of above

Expected: Full two-panel layout, optimal spacing
```

---

## ⏱️ Performance Observation

### Expected Load Times
| Page | Expected | Acceptable |
|------|----------|-----------|
| Profile Settings | <500ms | <1000ms |
| Messaging | <500ms | <1000ms |
| Notifications | <300ms | <800ms |
| Reviews | <300ms | <800ms |

### Browser DevTools
1. Open DevTools → Performance tab
2. Click record circle
3. Reload page
4. Stop recording
5. Analyze flame chart

---

## ✅ Completion Checklist

After running all test cases, mark as complete:

### Functional Tests
- [ ] Profile editing saves data
- [ ] Skills autocomplete works
- [ ] Messaging sends/receives
- [ ] Conversations load
- [ ] Notifications display
- [ ] Notifications can be marked as read
- [ ] Reviews show correctly
- [ ] Rate limiting works

### Integration Tests
- [ ] Navigation works between pages
- [ ] Sidebar links active correctly
- [ ] Data persists (page refresh)
- [ ] Auth works (401 when not logged in)
- [ ] No database errors in console

### UI/UX Tests
- [ ] Forms are responsive
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Empty states display
- [ ] Color coding visible (notifications)

### Security Tests
- [ ] Security headers present
- [ ] CORS working
- [ ] Rate limiting enforced
- [ ] No sensitive data in console

---

## 📞 Reporting Issues

When reporting issues, include:
1. **URL**: Exact page URL
2. **Browser**: Chrome, Firefox, Safari, etc.
3. **Error**: Exact error message from console
4. **Steps**: Steps to reproduce
5. **Expected vs Actual**: What should happen vs what did

Example:
```
Title: Profile settings form doesn't save
URL: http://localhost:3000/freelancer/profile-settings
Browser: Chrome 120.0
Steps:
1. Enter "John" in first name
2. Click Save
Expected: Green success message
Actual: Red error "Failed to update profile"
Console Error: 401 Unauthorized
```

---

## 🎯 Success Criteria

All tests pass when:
- ✅ No 500 errors in console
- ✅ No CORS errors
- ✅ No unhandled promise rejections
- ✅ All pages load in <2 seconds
- ✅ Forms submit and save data
- ✅ Navigation works between pages
- ✅ Security headers present
- ✅ No authentication errors (unless expected)

---

**Last Updated**: 2025-11-29
**Server Status**: ✅ Running on http://localhost:3000
**Testing Ready**: ✅ Yes

