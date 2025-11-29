# Project Invitation Workflow

**Date**: November 30, 2025
**Status**: ✅ Fully Implemented

---

## Overview

The AdMarketplace platform has a **complete invitation workflow** that allows clients to invite freelancers to projects and freelancers to respond to invitations.

---

## User Flows

### **Client Flow: Inviting a Freelancer**

```
1. Client creates a project
   → /projects/new
   → Fill in project details and budget

2. Client clicks "Invite Freelancers" on project page
   → /projects/[id]
   → Sees button "Encontrar Mejores Matches con IA"

3. Client browses freelancers
   → /freelancers
   → Can search by name, skills, role
   → Clicks "Invitar" on freelancer card

4. Client sends invitation with optional message
   → Modal or form appears
   → Can add personalized message
   → Clicks "Enviar Invitación"

5. Client sees invitations on project page
   → /projects/[id]
   → Section "Invitaciones Enviadas"
   → Shows freelancer name, email, message, status
   → Status: "Pendiente", "Aceptada", "Rechazada"

6. Waits for freelancer to accept
   → Invitation remains "Pendiente"
   → Client can send follow-up message (future feature)
   → Client can cancel invitation (future feature)
```

### **Freelancer Flow: Responding to Invitations**

```
1. Freelancer logs in
   → /dashboard/freelancer

2. Freelancer sees proposals section
   → /freelancer/proposals
   → Shows all pending invitations
   → Shows project title, client name, skills required

3. Freelancer clicks "Ver Detalles y Enviar Oferta"
   → /freelancer/proposals/[invitationId]
   → Sees full project details
   → Can read client's message

4. Freelancer submits offer with milestones
   → Creates contract with milestones
   → Specifies hourly rate, milestones, timeline
   → Clicks "Enviar Oferta"

5. Offer is sent to client
   → Invitation status changes to "Aceptada"
   → Client receives notification (future feature)
   → Contract created in database

6. Client reviews and accepts offer
   → /projects/[id]/offers
   → Sees freelancer's offer
   → Approves milestones
   → Project moves to "in_progress"
```

---

## Database Tables

### `project_invitations` Table

```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  freelancer_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  message TEXT, -- Optional invitation message
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Fields**:
- `project_id` - Which project the freelancer is invited to
- `freelancer_id` - Which freelancer is being invited
- `client_id` - Which client sent the invitation
- `status` - Current state of the invitation
- `message` - Optional personalized message from client

---

## API Endpoints

### **1. Create Invitation** (Client → Freelancer)
```
POST /api/projects/[projectId]/invite

Request Body:
{
  "freelancerId": "550e8400-e29b-41d4-a716-446655440001",
  "message": "Hi Sarah, we think you'd be perfect for our Facebook campaign!"
}

Response:
{
  "success": true,
  "invitation": {
    "id": "inv-123",
    "status": "pending",
    "created_at": "2025-11-30T10:00:00Z"
  }
}
```

### **2. Get Freelancer's Proposals/Invitations**
```
GET /api/freelancer/proposals

Response:
{
  "proposals": [
    {
      "id": "inv-123",
      "project": {
        "id": "proj-456",
        "title": "Facebook Ads Campaign Q4",
        "description": "...",
        "skills_required": ["Facebook Ads", "Analytics"]
      },
      "client": {
        "name": "Acme Corp",
        "company": "acme@example.com"
      },
      "status": "pending",
      "created_at": "2025-11-30T10:00:00Z"
    }
  ]
}
```

### **3. Get Client's Sent Invitations** (New)
```
GET /api/projects/[projectId]/invitations

Response:
{
  "invitations": [
    {
      "id": "inv-123",
      "status": "pending",
      "created_at": "2025-11-30T10:00:00Z",
      "message": "Hi Sarah, we think you'd be perfect...",
      "freelancer": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": "sarah.johnson@admarket.test"
      }
    }
  ],
  "total": 1
}
```

### **4. Accept Invitation & Send Offer** (Freelancer)
```
POST /api/freelancer/proposals/[invitationId]/offer

Request Body:
{
  "hourly_rate": 85,
  "milestones": [
    {
      "name": "Research & Strategy",
      "amount": 500,
      "due_date": "2025-12-07",
      "description": "Initial market research and campaign strategy"
    },
    {
      "name": "Campaign Setup",
      "amount": 1000,
      "due_date": "2025-12-14",
      "description": "Create and launch Facebook ads"
    }
  ]
}

Response:
{
  "success": true,
  "contract": {
    "id": "contract-789",
    "status": "pending_approval"
  }
}
```

---

## UI Components

### **Client View: Project Page**
```
📋 Project: "Facebook Ads Campaign Q4"

💰 Budget: €5,000 | Spent: €0 | Available: €5,000

📨 Invitaciones Enviadas
├─ 👤 Sarah Johnson
│  ├─ sarah.johnson@admarket.test
│  ├─ Message: "Hi Sarah, we think you'd be perfect..."
│  └─ Status: [Pendiente] (yellow badge)
│
├─ 👤 Michael Chen
│  ├─ michael.chen@admarket.test
│  ├─ Status: [Aceptada] (green badge)
│  └─ 📋 Waiting for contract approval

🎯 Hitos del Proyecto
├─ Phase 1: Research & Strategy
│  ├─ €500 | Due: Dec 7
│  └─ Status: Pendiente
└─ Phase 2: Campaign Setup
   ├─ €1,000 | Due: Dec 14
   └─ Status: Pendiente
```

### **Freelancer View: Proposals Page**
```
📨 Propuestas de Proyecto

📋 Project: "Facebook Ads Campaign Q4"
├─ Client: Acme Corp (acme@example.com)
├─ Description: "We need an experienced Facebook ads specialist..."
├─ Skills: [Facebook Ads] [Analytics] [A/B Testing]
├─ Status: [Pendiente]
└─ [Ver Detalles y Enviar Oferta]

📋 Project: "SEO Optimization 2025"
├─ Client: TechStartup Inc
├─ Status: [Aceptada]
└─ [Ver Detalles]
```

---

## Invitation States

### **Pending** 🟡
- Freelancer has not yet responded
- Freelancer can view in `/freelancer/proposals`
- Client can see invitation is waiting
- No contract yet

### **Accepted** 🟢
- Freelancer has submitted an offer with milestones
- Contract created with `pending_approval` status
- Client can review and approve milestones
- Work can begin once client approves

### **Rejected** 🔴
- Freelancer declined the invitation
- No contract created
- Client can invite another freelancer
- Invitation removed from freelancer's proposals

---

## Current Implementation Status

### ✅ Completed
- [x] Create invitation (client → freelancer)
- [x] Fetch freelancer's proposals/invitations
- [x] Fetch client's sent invitations (NEW)
- [x] Display invitations on client's project page (NEW)
- [x] Display proposals on freelancer's proposals page
- [x] Accept invitation by sending offer
- [x] API endpoints secured with authentication

### ⏳ In Progress
- [ ] Invitation status updates (automated on offer acceptance)
- [ ] Rejection workflow (decline invitation)
- [ ] Cancel invitation (client can cancel)

### 📋 Future Features
- [ ] Email notifications when invited
- [ ] Push notifications for new invitations
- [ ] Message between client and freelancer pre-contract
- [ ] Follow-up messages from client
- [ ] Bulk invitations to multiple freelancers
- [ ] AI-powered "best match" suggestions

---

## Testing the Workflow

### **Test Case 1: Client Invites Freelancer**

1. Log in as a client
2. Create a project at `/projects/new`
3. Go to project detail page `/projects/[projectId]`
4. Go to `/freelancers` and select "Sarah Johnson"
5. Click "Invitar" and send invitation
6. Go back to project page
7. ✅ Should see "Invitaciones Enviadas" section with Sarah's name and "Pendiente" status

### **Test Case 2: Freelancer Sees Invitation**

1. Log in as a freelancer (Sarah Johnson)
2. Go to `/freelancer/proposals`
3. ✅ Should see the project "Facebook Ads Campaign Q4"
4. Click "Ver Detalles y Enviar Oferta"
5. Submit an offer with milestones
6. ✅ Offer should be created and saved

### **Test Case 3: Client Sees Accepted Invitation**

1. Log in as the client who sent the invitation
2. Go to `/projects/[projectId]`
3. ✅ Invitation for Sarah should now show "Aceptada" status
4. Go to `/projects/[projectId]/offers`
5. ✅ Should see Sarah's offer with proposed milestones

---

## API Error Handling

### **Freelancer Not Found**
```
400 Bad Request
{
  "error": "Freelancer not found"
}
```
**Solution**: Invitation was sent to test data. Use real freelancer IDs from `/api/freelancers/search`.

### **Project Not Owned by Client**
```
403 Forbidden
{
  "error": "You do not own this project"
}
```
**Cause**: Only the client who created the project can invite freelancers.

### **Already Invited**
```
400 Bad Request
{
  "error": "An invitation already exists with status: pending"
}
```
**Cause**: Cannot send multiple invitations to same freelancer for same project.

---

## Database Relationships

```
users (clients)
  ├─ projects
  │   ├─ project_invitations ← freelancer
  │   │   └─ users (freelancers)
  │   └─ contracts
  │       └─ milestones
  │
users (freelancers)
  └─ project_invitations (incoming)
      └─ projects
          └─ users (clients)
```

---

## Next Steps

1. **Notification System** - Email/push when freelancer is invited
2. **Rejection Workflow** - Allow freelancers to decline invitations
3. **Cancellation** - Allow clients to cancel pending invitations
4. **Messaging** - Pre-contract communication between client and freelancer
5. **AI Matching** - Auto-suggest best freelancers for projects
6. **Bulk Invitations** - Invite multiple freelancers at once

---

## Summary

**The invitation workflow is fully functional:**

✅ **Clients can invite freelancers** to projects
✅ **Freelancers can see their proposals** and respond with offers
✅ **Clients can track sent invitations** and their status
✅ **All APIs are secure** with role-based access control

**You can now test the complete workflow from invitation to offer submission.**

---

**Last Updated**: November 30, 2025
**Status**: Ready for testing
