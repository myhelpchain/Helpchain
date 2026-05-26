# HelpChain — Complete Full-Stack Developer Plan
> Every feature, every endpoint, every table, every edge case. Nothing left as demo.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Current State Audit — Real vs Demo](#2-current-state-audit)
3. [Database — Full Schema](#3-database-schema)
4. [Supabase Edge Functions — All Endpoints](#4-edge-functions)
5. [Feature Breakdown: Task Lifecycle](#5-task-lifecycle)
6. [Feature Breakdown: Messaging System](#6-messaging)
7. [Feature Breakdown: Escrow & Payments](#7-escrow-and-payments)
8. [Feature Breakdown: Reviews & Ratings](#8-reviews-and-ratings)
9. [Feature Breakdown: Notifications](#9-notifications)
10. [Feature Breakdown: Worker Verification](#10-worker-verification)
11. [Feature Breakdown: Discover / Marketplace](#11-discover-marketplace)
12. [Feature Breakdown: Admin Dashboard](#12-admin-dashboard)
13. [Feature Breakdown: Dashboard](#13-user-dashboard)
14. [Feature Breakdown: Profile](#14-profile)
15. [Frontend — Pages & Components Checklist](#15-frontend-checklist)
16. [Environment Variables & Secrets](#16-environment-variables)
17. [Deployment & Infrastructure](#17-deployment)
18. [Prioritized Build Order](#18-build-order)

---

## 1. Architecture Overview

```
User Browser
    │
    ▼
React + Vite + TypeScript (client/)
    │   TanStack Query (server state)
    │   Zustand (local UI state)
    │   Wouter (routing)
    │   Framer Motion (animations)
    │   Shadcn/UI + Tailwind (components)
    │
    ├──► Firebase Auth (authentication only)
    │         Google OAuth, Email/Password
    │         Issues JWT tokens verified by Supabase functions
    │
    ├──► Supabase Edge Functions (Deno runtime) ── backend API
    │         task-api/         → tasks, offers, reviews, notifications
    │         wallet-api/       → deposits, withdrawals, balances
    │         messaging-api/    → (MISSING — needs to be built)
    │         admin-api/        → (MISSING — needs to be built)
    │         paystack-webhook/ → payment event handler
    │
    ├──► Supabase PostgreSQL ── primary database
    │         Row Level Security (RLS) enabled per table
    │         Supabase Realtime for messaging
    │
    ├──► Paystack ── NGN payments
    │         Deposit:    initialize → redirect → webhook verifies
    │         Withdrawal: transfer recipients → initiate transfer
    │
    └──► Firebase Storage (optional) ── profile photos, task attachments
```

### Tech versions in use
| Tool | Version |
|------|---------|
| React | 18 |
| TypeScript | 5 |
| Vite | 5 |
| Supabase JS | 2 |
| Firebase | 10 |
| TanStack Query | 5 |
| Tailwind CSS | 3 |
| Framer Motion | 11 |

---

## 2. Current State Audit

### REAL (connected to live backend)
| Feature | File | Notes |
|---------|------|-------|
| Firebase Auth (login/signup/Google) | `auth.tsx`, `FirebaseAuthContext.tsx` | Fully working |
| Wallet balance fetch | `use-wallet.ts` → `wallet-api` | Live Supabase data |
| Wallet transaction history | `use-wallet.ts` → `wallet-api` | Live |
| Paystack deposit (initialize + webhook verify) | `wallet-deposit-modal.tsx` | Redirects to Paystack correctly |
| Paystack withdrawal | `wallet-withdraw-modal.tsx` | Sends to edge function; Paystack transfer initiation needs testing |
| Create task (POST) | `create-request.tsx` → `use-tasks-api.ts` | Saves to Supabase `tasks` table |
| Fetch own tasks | `use-tasks-api.ts` `GET /tasks` | Real data |
| Profile read/write | `use-profile-api.ts` → `task-api` | Real Supabase `profiles` table |
| Notifications (read + mark-read) | `use-notifications.ts` | Real, polls every 30s |
| Onboarding | `onboarding.tsx` | Writes to `profiles` |
| Settings | `settings.tsx` | Profile update + local prefs |

### DEMO / MOCK (needs to be replaced with real backend)
| Feature | File | What to replace it with |
|---------|------|------------------------|
| Discover marketplace | `discover.tsx` uses `useTasksStore` (Zustand, local seed data) | Connect to `GET /tasks/open` from `task-api` |
| Messaging | `messages.tsx` — hardcoded mock conversations | Full messaging system using Supabase Realtime |
| Offer system | `use-offers.ts` — Zustand only, no API | Add offers table + edge function endpoints |
| Request details / bidding | `request-details.tsx` — reads from local store | Connect to real task + offers API |
| Admin dashboard | `admin-dashboard.tsx` — manages mock offers | Connect to real admin API |
| Batch management (escrow releases) | `batch-management.tsx` — local state | Connect to real escrow release endpoint |
| Worker cards on discover | Pravatar placeholder images | Real profile photos |
| Stars/ratings displayed | Static hardcoded values | Connect to reviews table |
| Crypto withdrawal | Modal sends to edge function but `crypto_address` field may not exist in DB | Add crypto_address to withdrawals schema |

---

## 3. Database Schema

All tables live in Supabase PostgreSQL. Every table uses `uuid` primary keys and has `created_at TIMESTAMPTZ DEFAULT NOW()`.

### 3.1 `profiles`
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firebase_uid  TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  full_name     TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  skills        TEXT[],
  location      TEXT,
  country       TEXT DEFAULT 'NG',
  phone         TEXT,
  account_type  TEXT CHECK (account_type IN ('client','worker','both')) DEFAULT 'both',

  -- verification
  id_verified   BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,

  -- stats (denormalised for speed)
  total_tasks_posted  INT DEFAULT 0,
  total_tasks_done    INT DEFAULT 0,
  reputation_score    NUMERIC(3,1) DEFAULT 0,
  success_rate        NUMERIC(5,2) DEFAULT 0,
  total_reviews       INT DEFAULT 0,

  -- onboarding
  onboarding_complete BOOLEAN DEFAULT FALSE,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 `wallets`
```sql
CREATE TABLE wallets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  available_balance NUMERIC(12,2) DEFAULT 0 CHECK (available_balance >= 0),
  escrow_balance    NUMERIC(12,2) DEFAULT 0 CHECK (escrow_balance >= 0),
  lifetime_earned   NUMERIC(12,2) DEFAULT 0,
  lifetime_spent    NUMERIC(12,2) DEFAULT 0,
  status            TEXT CHECK (status IN ('active','frozen','suspended')) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 `transactions`
```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN (
                    'deposit','withdrawal','escrow_lock','escrow_release',
                    'escrow_refund','platform_fee','earning','referral_bonus'
                  )),
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status          TEXT CHECK (status IN ('pending','completed','failed','cancelled')) DEFAULT 'pending',
  reference       TEXT UNIQUE,
  description     TEXT,
  balance_before  NUMERIC(12,2),
  balance_after   NUMERIC(12,2),
  metadata        JSONB DEFAULT '{}',    -- paystack ref, bank details, etc.
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 `tasks`
```sql
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,
  skills_required TEXT[],
  location_type   TEXT CHECK (location_type IN ('remote','local','hybrid')) DEFAULT 'remote',
  location        TEXT,
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  budget_per_worker NUMERIC(12,2) NOT NULL CHECK (budget_per_worker > 0),
  worker_count    INT DEFAULT 1 CHECK (worker_count >= 1 AND worker_count <= 100),
  total_budget    NUMERIC(12,2) NOT NULL,
  platform_fee    NUMERIC(12,2) NOT NULL,
  grand_total     NUMERIC(12,2) NOT NULL,
  urgency         TEXT CHECK (urgency IN ('standard','urgent','flexible')) DEFAULT 'standard',
  deadline        DATE,
  duration        TEXT,
  status          TEXT CHECK (status IN (
                    'draft','published','in_progress','completed',
                    'cancelled','disputed'
                  )) DEFAULT 'published',
  escrow_locked   BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  views_count     INT DEFAULT 0,
  offers_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status       ON tasks(status);
CREATE INDEX idx_tasks_category     ON tasks(category);
CREATE INDEX idx_tasks_creator      ON tasks(creator_id);
CREATE INDEX idx_tasks_created      ON tasks(created_at DESC);
CREATE INDEX idx_tasks_location     ON tasks(location_type);
```

### 3.5 `offers`
```sql
CREATE TABLE offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  worker_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  message       TEXT NOT NULL,
  delivery_time TEXT,
  status        TEXT CHECK (status IN (
                  'pending','accepted','rejected','withdrawn','completed'
                )) DEFAULT 'pending',
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, worker_id)     -- one offer per worker per task
);

CREATE INDEX idx_offers_task_id   ON offers(task_id);
CREATE INDEX idx_offers_worker_id ON offers(worker_id);
CREATE INDEX idx_offers_status    ON offers(status);
```

### 3.6 `conversations`
```sql
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
  offer_id        UUID REFERENCES offers(id) ON DELETE SET NULL,
  participant_a   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_a        INT DEFAULT 0,  -- unread for participant_a
  unread_b        INT DEFAULT 0,  -- unread for participant_b
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_a, participant_b, task_id)
);
```

### 3.7 `messages`
```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  message_type    TEXT CHECK (message_type IN ('text','image','file','system')) DEFAULT 'text',
  file_url        TEXT,
  file_name       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender       ON messages(sender_id);
```

### 3.8 `reviews`
```sql
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  offer_id    UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  role        TEXT CHECK (role IN ('client_to_worker','worker_to_client')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (offer_id, reviewer_id)  -- one review per completed offer per reviewer
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_task     ON reviews(task_id);
```

### 3.9 `notifications`
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,  -- 'task_created','offer_received','offer_accepted','message','payment','review','system'
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  data        JSONB DEFAULT '{}',  -- task_id, offer_id, etc.
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### 3.10 `disputes`
```sql
CREATE TABLE disputes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  offer_id      UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  raised_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  against       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  description   TEXT NOT NULL,
  evidence_urls TEXT[],
  status        TEXT CHECK (status IN ('open','investigating','resolved','dismissed')) DEFAULT 'open',
  resolution    TEXT,
  resolved_by   UUID REFERENCES profiles(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.11 `withdrawals`
```sql
CREATE TABLE withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id  UUID REFERENCES transactions(id),
  amount          NUMERIC(12,2) NOT NULL,
  method          TEXT CHECK (method IN ('bank','crypto')) NOT NULL,
  -- bank fields
  bank_code       TEXT,
  bank_name       TEXT,
  account_number  TEXT,
  account_name    TEXT,
  paystack_recipient_code TEXT,
  paystack_transfer_code  TEXT,
  -- crypto fields
  crypto_network  TEXT,
  crypto_address  TEXT,
  -- status
  status          TEXT CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
  failure_reason  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) rules
```sql
-- Users can only see/modify their own data
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals     ENABLE ROW LEVEL SECURITY;

-- Tasks: public read for published, private write
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published tasks" ON tasks
  FOR SELECT USING (status = 'published');
CREATE POLICY "Creators manage own tasks" ON tasks
  FOR ALL USING (creator_id = auth.uid()::uuid);

-- Messages: only conversation participants
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations   ENABLE ROW LEVEL SECURITY;

-- Reviews: public read, private write
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);

-- NOTE: Edge Functions bypass RLS using service_role key
-- All DB writes happen via Edge Functions (server-side) for security
```

---

## 4. Edge Functions

All functions live in `supabase/functions/`. Each receives a Firebase JWT in `Authorization: Bearer <token>`, verifies it with `jose`, extracts `firebase_uid`, then queries Supabase via `service_role` key (bypassing RLS).

### 4.1 `task-api` (exists, needs expansion)

**Current endpoints:**
| Method | Path | Status |
|--------|------|--------|
| GET | /tasks | Real |
| GET | /tasks/open | Real but unused on frontend |
| POST | /tasks | Real |
| GET | /profile | Real |
| PUT | /profile | Real |
| GET | /notifications | Real |
| PATCH | /notifications/:id/read | Real |

**Missing endpoints to add:**
| Method | Path | What it does |
|--------|------|-------------|
| GET | /tasks/:id | Single task with creator profile + offer count |
| DELETE | /tasks/:id | Cancel task (only if no accepted offers), refund escrow |
| GET | /tasks/:id/offers | All offers for a task (only task creator can see) |
| POST | /tasks/:id/offers | Submit an offer as a worker |
| PATCH | /offers/:id/accept | Task creator accepts an offer; triggers notification |
| PATCH | /offers/:id/reject | Task creator rejects an offer |
| PATCH | /offers/:id/withdraw | Worker withdraws their own offer |
| PATCH | /offers/:id/complete | Task creator marks work done; releases escrow to worker |
| POST | /tasks/:id/dispute | Raise a dispute on a task |
| POST | /tasks/:taskId/reviews | Submit a review after completion |
| GET | /profiles/:id | Public profile of any user |
| PATCH | /notifications/read-all | Mark all notifications as read for this user |

**Detailed: POST `/tasks/:id/offers`**
```typescript
// Request body:
{ amount: number, message: string, delivery_time: string }

// Server logic:
// 1. Verify Firebase JWT → get firebase_uid
// 2. Look up worker profile by firebase_uid
// 3. Ensure worker is NOT the task creator
// 4. Ensure task status === 'published'
// 5. Check no existing offer from this worker for this task
// 6. Insert into offers table
// 7. Increment tasks.offers_count
// 8. Create notification for task creator: "New offer received"
// 9. Return { offer }
```

**Detailed: PATCH `/offers/:id/accept`**
```typescript
// Server logic:
// 1. Verify caller is the task creator
// 2. Update offer.status = 'accepted', offer.accepted_at = now()
// 3. Update task.status = 'in_progress'
// 4. Reject all other pending offers for same task (status = 'rejected')
//    and notify those workers
// 5. Notify accepted worker: "Your offer was accepted!"
// 6. Create a conversation between client and worker (if none exists)
// 7. Return { offer, task }
```

**Detailed: PATCH `/offers/:id/complete`**
```typescript
// Server logic:
// 1. Verify caller is the task creator
// 2. Verify offer.status === 'accepted'
// 3. Calculate worker payout: offer.amount (NOT budget — the agreed offer price)
//    Platform already took fee on task creation
// 4. Add offer.amount to worker's available_balance
// 5. Subtract from tasks escrow (reduce escrow_balance on client wallet)
// 6. Update offer.status = 'completed'
// 7. Update task.status = 'completed'
// 8. Create transaction records for both parties
// 9. Update worker profile: total_tasks_done++, lifetime_earned += amount
// 10. Update client profile: total_tasks_posted++ (if not already counted)
// 11. Notify worker: "Payment released — ₦X sent to your wallet"
// 12. Trigger review flow: notify both parties to leave a review
// 13. Return { success: true }
```

### 4.2 `messaging-api` (needs to be created entirely)

**Create:** `supabase/functions/messaging-api/index.ts`

| Method | Path | What it does |
|--------|------|-------------|
| GET | /conversations | List all conversations for current user, with last message |
| POST | /conversations | Create or get existing conversation with another user |
| GET | /conversations/:id/messages | Paginated message history (limit 50, cursor-based) |
| POST | /conversations/:id/messages | Send a message |
| PATCH | /conversations/:id/read | Mark all messages in conversation as read |

**Realtime (Supabase Realtime, NOT edge function):**
```typescript
// On the frontend, after loading conversation:
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(url, anonKey);

const channel = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // append new message to state
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();

// Cleanup on unmount:
return () => supabase.removeChannel(channel);
```

**What to enable in Supabase:**
- Go to Supabase Dashboard → Database → Replication → Enable Realtime for `messages` table

### 4.3 `wallet-api` (exists, mostly working)

**Current gaps to fix:**
1. **Bank list endpoint** (`GET /banks`) is returning HTML instead of JSON — the Paystack API call likely has a wrong URL or missing API key. Fix: ensure `PAYSTACK_SECRET_KEY` env var is set in Supabase Edge Function secrets.
2. **Withdrawal transfer initiation** — verify that after inserting the withdrawal record, the function actually calls `https://api.paystack.co/transfer` to push the money. If missing, add it.
3. **Crypto withdrawals** — currently the DB `withdrawals` table may not have `crypto_network` or `crypto_address` columns. Add them (migration below).

**Migration to add:**
```sql
ALTER TABLE withdrawals
  ADD COLUMN IF NOT EXISTS crypto_network TEXT,
  ADD COLUMN IF NOT EXISTS crypto_address TEXT;
```

### 4.4 `admin-api` (needs to be created)

Only callable by users whose profile has `is_admin = true`.

| Method | Path | What it does |
|--------|------|-------------|
| GET | /admin/stats | Platform totals: users, tasks, volume, revenue |
| GET | /admin/tasks | All tasks with filters (status, category, date range) |
| GET | /admin/users | All users with filters |
| GET | /admin/disputes | All open disputes |
| PATCH | /admin/disputes/:id | Resolve a dispute (release escrow or refund) |
| POST | /admin/users/:id/suspend | Freeze a user's wallet + account |
| GET | /admin/withdrawals | Pending withdrawal queue |
| PATCH | /admin/withdrawals/:id | Manually approve/reject a withdrawal |

**Add `is_admin` to profiles:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

---

## 5. Task Lifecycle

The complete flow from posting to payment:

```
1. CLIENT posts task
   → create-request.tsx form validates
   → checks: available_balance >= grand_total (budget + 6% fee)
   → POST /tasks → edge function:
       a. Insert task record (status: 'published')
       b. Deduct grand_total from client's available_balance
       c. Add grand_total to client's escrow_balance
       d. Insert escrow_lock transaction record
       e. Notify client: "Task posted successfully"

2. WORKER sees task on /discover
   → GET /tasks/open returns published tasks
   → Worker clicks "Make Offer"
   → POST /tasks/:id/offers with amount + message
   → Client receives notification

3. CLIENT reviews offers
   → GET /tasks/:id/offers (only task creator)
   → Clicks "Accept" on chosen offer
   → PATCH /offers/:id/accept
       a. Offer status → 'accepted'
       b. Task status → 'in_progress'
       c. All other pending offers → 'rejected' (with notifications)
       d. Conversation created between client and worker

4. WORK HAPPENS
   → Client and worker communicate via messaging
   → Worker delivers work

5. CLIENT approves work
   → PATCH /offers/:id/complete
       a. Offer status → 'completed'
       b. Task status → 'completed'
       c. worker.available_balance += offer.amount
       d. client.escrow_balance -= grand_total
       e. Insert earning transaction for worker
       f. Insert escrow_release transaction for client
       g. Both parties prompted to leave reviews

6. REVIEWS POSTED
   → POST /tasks/:taskId/reviews (both directions)
   → Profile reputation scores updated

DISPUTE PATH (alternative to step 5):
   → Either party raises dispute: POST /tasks/:id/dispute
   → Task status → 'disputed'
   → Escrow stays locked
   → Admin reviews and resolves
   → Admin calls resolution endpoint to release or refund
```

---

## 6. Messaging

### What needs to be built

**Backend (new `messaging-api` function):**
- All endpoints listed in section 4.2
- Supabase Realtime enabled on `messages` table

**Frontend — rewrite `messages.tsx` completely:**

```
/messages
  ├── Sidebar: list of conversations
  │     each item shows: avatar, name, last message preview, time, unread badge
  │     search bar to filter conversations
  │
  └── Main area: active conversation
        ├── Header: other person's name + avatar + task badge if linked
        ├── Message feed (scrollable, newest at bottom)
        │     text bubbles, timestamps, read receipts
        │     file/image attachments (future)
        └── Input bar: textarea + send button
              Enter to send, Shift+Enter for newline
```

**New hook: `use-messages.ts`**
```typescript
// Key functions:
// - useConversations() → list of convos via GET /conversations
// - useMessages(conversationId) → paginated history + Realtime subscription
// - sendMessage(conversationId, body) → POST /conversations/:id/messages
// - markRead(conversationId) → PATCH /conversations/:id/read
// - startConversation(userId, taskId?) → POST /conversations
```

**Realtime subscription hook:**
```typescript
function useRealtimeMessages(conversationId: string, onNew: (msg) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => onNew(payload.new))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);
}
```

---

## 7. Escrow and Payments

### 7.1 Deposit Flow (already mostly working)

```
Frontend:
  initializeDeposit(amount)
    → POST wallet-api/wallet/deposit/initialize
    → Returns { authorization_url, reference }
    → window.location.href = authorization_url

User pays on Paystack:
  Paystack sends POST to /paystack-webhook
    → Verify x-paystack-signature (HMAC SHA-512)
    → On charge.success event:
        a. Look up user by reference
        b. Add amount to available_balance
        c. Update transaction record status → 'completed'
        d. Notify user: "₦X added to your wallet"

User returns to /wallet:
  verifyDeposit(reference)
    → POST wallet-api/wallet/deposit/verify
    → Returns updated balance
```

**Currently broken: Bank list (GET /banks)**
- Fix: The Paystack API call in wallet-api is likely failing because `PAYSTACK_SECRET_KEY` is not set in Supabase function secrets.
- Go to Supabase Dashboard → Edge Functions → wallet-api → Secrets → add `PAYSTACK_SECRET_KEY`
- Also set `PAYSTACK_SECRET_KEY` in the Supabase project's vault

### 7.2 Withdrawal Flow

**Bank Transfer:**
```
1. User submits withdrawal request:
   POST wallet-api/wallet/withdraw
   Body: { amount, bankCode, accountNumber, accountName }

2. Edge function:
   a. Verify user has sufficient available_balance
   b. Deduct amount from available_balance immediately
   c. Create withdrawal record (status: 'pending')
   d. Create transaction record (status: 'pending')
   e. Call Paystack to create transfer recipient:
      POST https://api.paystack.co/transferrecipient
      { type: "nuban", name: accountName, account_number: accountNumber, bank_code: bankCode, currency: "NGN" }
   f. Call Paystack to initiate transfer:
      POST https://api.paystack.co/transfer
      { source: "balance", amount: amount * 100, recipient: recipient_code, reason: "HelpChain withdrawal" }
   g. Store transfer_code in withdrawal record

3. Paystack webhook (transfer.success / transfer.failed):
   → Update withdrawal status
   → If failed: refund amount back to available_balance
   → Notify user of outcome
```

**Crypto Withdrawal:**
```
1. User submits: { amount, cryptoNetwork, cryptoAddress }
2. Edge function:
   a. Deduct from available_balance
   b. Create withdrawal record (method: 'crypto', status: 'pending')
   c. Notify admin (email or Slack) to process manually
   d. Admin panel shows pending crypto withdrawals
   e. Admin marks as completed after sending
```

### 7.3 Platform Fee Structure
- 6% on task creation (charged to client, taken from grand_total upfront)
- Breakdowns to show in UI:
  - Budget per worker: ₦X
  - × Workers: N
  - Subtotal: ₦Y
  - Platform fee (6%): ₦Z
  - **Total charged from wallet: ₦Y + ₦Z**
- Worker receives the full `offer.amount` they quoted (not reduced again)

---

## 8. Reviews and Ratings

### When reviews are triggered
- After `PATCH /offers/:id/complete` succeeds
- Both client and worker see a "Leave a review" prompt in:
  - In-app notification
  - Dashboard "Completed Tasks" section
  - Request details page

### Review submission
```
POST /tasks/:taskId/reviews
Body: { rating: 1-5, comment: string, offer_id: string }

Server logic:
1. Determine direction: if caller === task creator → 'client_to_worker'
                        if caller === offer worker → 'worker_to_client'
2. Insert review record
3. Recalculate reviewee's reputation_score:
   UPDATE profiles SET
     reputation_score = (
       SELECT ROUND(AVG(rating)::numeric, 1)
       FROM reviews WHERE reviewee_id = :reviewee_id
     ),
     total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = :reviewee_id)
   WHERE id = :reviewee_id
4. Return { review }
```

### Displaying ratings
- Profile page: show star rating + total review count + recent reviews list
- Task cards on discover: show creator's rating
- Worker offer cards on request-details: show worker's rating
- After task completion: show "Rate your experience" modal with 1-5 stars + comment

---

## 9. Notifications

### Notification types and triggers
| Event | Recipient | Title | Body |
|-------|-----------|-------|------|
| Task posted | Creator | "Task published!" | "Your task 'X' is now live and accepting offers." |
| New offer | Task creator | "New offer received" | "Worker Y submitted an offer of ₦Z on 'X'." |
| Offer accepted | Worker | "Offer accepted!" | "Your offer on 'X' was accepted. Start communicating with the client." |
| Offer rejected | Worker | "Offer not selected" | "Your offer on 'X' was not selected this time." |
| Work completed | Worker | "Payment released!" | "₦X has been added to your wallet for completing 'Y'." |
| Work completed | Client | "Task completed" | "You've approved 'X'. Don't forget to leave a review!" |
| Message received | Recipient | "New message" | "Name sent you a message." |
| Deposit success | User | "Funds added" | "₦X has been added to your wallet." |
| Withdrawal success | User | "Withdrawal sent" | "₦X is on its way to your bank account." |
| Withdrawal failed | User | "Withdrawal failed" | "We couldn't process your ₦X withdrawal. Funds have been returned." |
| Dispute raised | Both | "Dispute opened" | "A dispute has been raised on task 'X'." |
| Dispute resolved | Both | "Dispute resolved" | "The dispute on 'X' has been resolved." |
| Review received | User | "New review" | "Someone left you a 5-star review!" |
| Welcome | New user | "Welcome to HelpChain!" | "Your account is ready. Post your first task or browse open ones." |

### Push notifications (future)
- Use Firebase Cloud Messaging (FCM) for web push
- Store FCM token in profiles table (`fcm_token TEXT`)
- When creating a notification in the DB, also call FCM API

---

## 10. Worker Verification

### Verification tiers
```
Tier 0 — Unverified (default)
  - Can browse and make offers
  - Limited to ₦50,000 max offer amount
  - No verified badge shown

Tier 1 — Phone verified
  - OTP sent to phone number
  - Unlocks: increased limit ₦200,000, verified phone badge

Tier 2 — ID verified
  - Upload government ID (NIN, driver's license, passport)
  - Manual admin review
  - Unlocks: full platform access, "ID Verified" badge on profile

Tier 3 — Bank verified
  - Completed at least 1 withdrawal to a verified bank account
  - Auto-verified via Paystack account name lookup
```

### Implementation
```
Phone verification:
  POST /verify/phone/send → send OTP (use Termii or Africa's Talking SMS API)
  POST /verify/phone/confirm { otp } → verify OTP → update profiles.phone_verified = true

ID verification:
  POST /verify/id { document_type, front_image_url, selfie_url }
  → Creates a verification_requests record
  → Admin reviews in admin dashboard
  → On approval: profiles.id_verified = true + notification

Add to profiles table:
  verification_tier INT DEFAULT 0
  phone_verified    BOOLEAN DEFAULT FALSE
  id_verified       BOOLEAN DEFAULT FALSE
```

---

## 11. Discover / Marketplace

### What needs to change in `discover.tsx`
Currently reads from `useTasksStore` (Zustand seed data). Replace entirely with real API.

**New hook: `use-open-tasks.ts`**
```typescript
export function useOpenTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', 'open', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.locationType) params.set('location_type', filters.locationType);
      if (filters.minBudget) params.set('min_budget', String(filters.minBudget));
      if (filters.maxBudget) params.set('max_budget', String(filters.maxBudget));
      if (filters.query) params.set('q', filters.query);
      if (filters.page) params.set('page', String(filters.page));

      const res = await fetch(`${TASK_API}/tasks/open?${params}`);
      return res.json() as Promise<{ tasks: Task[], total: number, page: number }>;
    },
    staleTime: 60_000,
  });
}
```

**Update `GET /tasks/open` in task-api to support:**
- `category` filter
- `location_type` filter
- `min_budget` / `max_budget` range
- `q` full-text search (on title + description)
- `page` + `limit` pagination (default limit: 20)
- Returns tasks with creator's display_name, avatar_url, reputation_score

**Task card on Discover needs to show:**
- Task title, category badge, budget, time posted
- Creator avatar + name + rating
- Location type chip (Remote / Local)
- Offer count
- "Make an Offer" button (only if logged in and NOT the creator)

---

## 12. Admin Dashboard

### Rewrite `admin-dashboard.tsx` to connect to `admin-api`

**Overview stats panel:**
- Total users, active tasks, total volume processed, platform revenue (fees collected)
- New users this week, tasks posted today, pending withdrawals

**Tables:**
```
/admin
  ├── Overview (stats dashboard)
  ├── Tasks tab: filterable list, click to see details + manage
  ├── Users tab: search, see profile, suspend account
  ├── Disputes tab: open disputes, see evidence, resolve
  ├── Withdrawals tab: pending bank/crypto withdrawals, approve/reject
  └── Reviews tab: flag inappropriate reviews
```

**Access control:**
```typescript
// In admin-dashboard.tsx:
const { user } = useFirebaseAuth();
const { profile } = useProfileApi();

if (!profile?.is_admin) {
  return <Redirect to="/" />;
}
```

---

## 13. User Dashboard

### What's currently in `dashboard.tsx`
- Wallet balances: REAL
- Task stats (from Zustand store): PARTIALLY REAL — only shows tasks created by user
- Profile info: REAL

### What to fix
1. **Remove `useTasksStore`** — replace with `useTasksApi` to fetch real tasks
2. **Active offers widget** — add query: `GET /offers?worker_id=me&status=pending` to show tasks this user has bid on
3. **Earnings chart** — fetch `transactions` for worker and plot monthly earnings
4. **Recent activity feed** — mix of recent notifications + transaction history

**Dashboard layout target:**
```
Top row: 4 stat cards
  [Available Balance] [Escrow Balance] [Tasks Posted] [Tasks Completed]

Middle:
  Left (60%): Recent Tasks table (status, title, offers count, action)
  Right (40%): Quick actions + wallet top-up shortcut

Bottom:
  [Recent Transactions list] [Active Offers I've made list]
```

---

## 14. Profile

### Public profile page (`/profile/:id`)
Currently goes to `/public-profile.tsx`. Connect to `GET /profiles/:id`.

**Show:**
- Avatar, name, location, bio, skills (chips)
- Verification badges (Phone ✓, ID ✓)
- Reputation score + total reviews
- Reviews list (paginated, with reviewer name + task category + comment)
- Active tasks posted (if client)
- Completed tasks (if worker)

### Own profile (`/profile`)
- Same as public but with "Edit Profile" button
- Photo upload → Firebase Storage → save URL to profiles table
- Skills tags with add/remove

---

## 15. Frontend Pages & Components Checklist

### Pages status after full implementation
| Page | Path | Status today | Action needed |
|------|------|-------------|---------------|
| Home | `/` | Real | Done — auth strip added |
| Auth | `/auth` | Real | Done |
| Onboarding | `/onboarding` | Real | Done |
| Dashboard | `/dashboard` | Partial | Replace Zustand task data with API |
| Discover | `/discover` | Demo | Replace useTasksStore with useOpenTasks |
| Request Details | `/request/:id` | Demo | Connect to GET /tasks/:id + GET /tasks/:id/offers |
| Create Request | `/create-request` | Real | Done |
| Create Offer | `/create-offer` | Unknown | Connect to POST /tasks/:id/offers |
| Messages | `/messages` | Demo | Full rewrite with Supabase Realtime |
| Wallet | `/wallet` | Real | Done (deposit + withdraw modals) |
| Profile (own) | `/profile` | Partial | Add photo upload, skill tags |
| Profile (public) | `/profile/:id` | Partial | Connect to real profiles API |
| Settings | `/settings` | Real | Done |
| Admin | `/admin` | Demo | Connect to admin-api |
| Batch Management | `/batch-management` | Demo | Connect to real escrow release endpoint |
| Help | `/help` | Static | Done |

### New components to build
| Component | Where used | Priority |
|-----------|-----------|----------|
| `OfferCard` | request-details, dashboard | High |
| `SubmitOfferModal` | request-details | High |
| `ReviewModal` | After task completion | High |
| `StarRating` | Task cards, profiles | High |
| `TaskStatusBadge` | All task lists | Medium |
| `ConversationList` | messages.tsx | High |
| `MessageBubble` | messages.tsx | High |
| `MessageInput` | messages.tsx | High |
| `VerificationBadge` | profiles, offer cards | Medium |
| `EarningsChart` | dashboard | Low |
| `DisputeModal` | request-details | Medium |
| `PaginationControls` | discover, admin | Medium |

---

## 16. Environment Variables & Secrets

### Frontend (Vite — prefix with VITE_)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...
```

### Supabase Edge Functions (set in Supabase dashboard → Edge Functions → Secrets)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (never expose to frontend)
PAYSTACK_SECRET_KEY=sk_live_...   (or sk_test_... for development)
FIREBASE_PROJECT_ID=your-project-id
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret (set when creating webhook in Paystack dashboard)
```

### Where to set these in Replit
- All `VITE_` vars: Replit Secrets panel (auto-injected at build time)
- Supabase function secrets: Supabase Dashboard → Project Settings → Edge Functions

---

## 17. Deployment & Infrastructure

### Current setup
- Frontend: served by Vite dev server on port 5000 (Replit workflow)
- Backend: Supabase Edge Functions (hosted by Supabase, globally distributed)
- Database: Supabase PostgreSQL (hosted)
- Auth: Firebase (hosted)
- Payments: Paystack (hosted)

### Production deployment on Replit
1. Build: `npm run build` in `HelpChain-1/`
2. Serve: static files from `dist/` with a simple Express or `serve` server
3. Set workflow command to: `cd HelpChain-1 && npm run build && npx serve dist -p 5000`
4. Or better: keep Vite for development, deploy to Replit deployments (separate container)

### Paystack webhook URL
After deploying, register the webhook URL in Paystack dashboard:
```
https://your-project.supabase.co/functions/v1/paystack-webhook
```
Make sure the webhook secret matches `PAYSTACK_WEBHOOK_SECRET` env var.

### Supabase function deployment
```bash
# Deploy all edge functions:
supabase functions deploy task-api
supabase functions deploy wallet-api
supabase functions deploy messaging-api
supabase functions deploy admin-api
supabase functions deploy paystack-webhook

# Set secrets:
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
supabase secrets set FIREBASE_PROJECT_ID=xxx
```

### Database migrations (apply in order)
```bash
# Run each SQL block from section 3 in Supabase SQL editor
# Or use Supabase migration files in supabase/migrations/
```

---

## 18. Prioritized Build Order

Work through this list in order. Each item unblocks the next.

### Phase 1 — Foundation (1-2 days)
These are blockers for everything else.

1. **Apply DB migrations** — add all missing columns (crypto fields, is_admin, verification_tier)
2. **Fix Paystack secret key** in Supabase Edge Function secrets → fixes bank list fetch
3. **Add missing task-api endpoints** — `GET /tasks/:id`, `POST /tasks/:id/offers`, `PATCH /offers/:id/accept`, `PATCH /offers/:id/complete`
4. **Connect discover.tsx** — replace `useTasksStore` with `useOpenTasks` hook calling `GET /tasks/open`

### Phase 2 — Core Marketplace (2-3 days)
5. **Rewrite request-details.tsx** — show real task + offers, allow making offers, accepting offers
6. **Fix offers system frontend** — `create-offer.tsx` and `SubmitOfferModal` fully connected
7. **Review system** — `ReviewModal`, `POST /tasks/:taskId/reviews`, profile score update
8. **Dashboard data** — replace Zustand task data, add active offers widget

### Phase 3 — Messaging (2-3 days)
9. **Create `messaging-api` edge function** with all endpoints
10. **Enable Supabase Realtime** on messages table
11. **Rewrite messages.tsx** — real conversations, Realtime subscription, send + receive

### Phase 4 — Admin & Operations (1-2 days)
12. **Create `admin-api` edge function**
13. **Rewrite admin-dashboard.tsx** — real stats, disputes, withdrawal queue
14. **Batch management** — connect escrow release to real endpoint

### Phase 5 — Trust & Safety (1-2 days)
15. **Phone verification** — OTP flow (Termii API or Africa's Talking)
16. **ID verification** — upload form + admin review workflow
17. **Dispute system** — raise dispute form, admin resolution

### Phase 6 — Polish (1 day)
18. **Push notifications** — Firebase Cloud Messaging
19. **Profile photos** — Firebase Storage upload
20. **Earnings chart** in dashboard
21. **SEO** — meta tags on all public pages
22. **Error boundaries** — catch and display errors gracefully (not blank screens)

---

*Last updated: May 2026. This document covers the full scope to make HelpChain a production-ready marketplace with zero mock data.*
