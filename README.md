# Freelance Advertising Marketplace

A premium Next.js marketplace connecting clients with freelance advertising experts.

## Features

- **Split Sign-Up Flow**: Separate registration for clients and freelancers
- **Business Email Validation**: Clients must use corporate emails
- **Milestone-Based Payments**: Track project progress with payment milestones
- **Real-Time Chat**: Communicate directly with clients/freelancers
- **Gig Management**: Browse, create, and manage service listings

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS v4
- **Authentication**: NextAuth.js v5
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Custom components with Radix UI primitives

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 3. Create Database Table

Go to **SQL Editor** in Supabase and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('client', 'freelancer')),
  company_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### 4. Configure Environment Variables

Create `.env.local` in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xazrmgulwzaunoczkipn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhenJtZ3Vsd3phdW5vY3praXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTI4NDUsImV4cCI6MjA3OTQ2ODg0NX0.r0YmoCRsebV_kiQnHkEFVTECfDSRe9-5cZW3AlD0sMY

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Sign Up

1. Go to `/sign-up`
2. Choose your role:
   - **Client**: Requires business email (no Gmail, Yahoo, etc.)
   - **Freelancer**: Any email accepted
3. Fill in your details and create account

### Sign In

Go to `/sign-in` and enter your credentials.

## Project Structure

```
src/
├── app/
│   ├── api/auth/          # Auth API routes
│   ├── sign-up/           # Registration pages
│   ├── sign-in/           # Login page
│   ├── gigs/              # Gig listings
│   ├── orders/            # Order management
│   └── messages/          # Chat interface
├── components/            # Reusable UI components
├── lib/                   # Utilities and configs
└── auth.ts                # NextAuth configuration
```

## Database Schema

See `database/schema.sql` for the complete database structure.

## License

MIT
