# HelpChain

A task marketplace connecting Nigerian clients ("Requesters") with verified skilled workers ("Helpers"), featuring escrow-protected payments via Paystack.

## Stack

- **Frontend**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **State**: Zustand (localization only) + TanStack React Query (server state)
- **Routing**: Wouter
- **Auth**: Firebase Auth (email + Google)
- **Backend**: Supabase Edge Functions (Deno) — `task-api` function
- **Payments**: Paystack (deposit/withdrawal via `wallet-api` function)
- **Mobile**: Capacitor 8 (Android + iOS)

## Design System

- **Brand color**: `#0C6B38` (deep forest green)
- **Font**: Figtree (Google Fonts)
- **Background**: White `#FFFFFF` / light sections `#F8FAF8`
- **Text**: `#0D0D0D` (near black)
- **Currency**: NGN (₦) — `formatLocal()` from `useLocalizationStore`
- **Logo**: `/images/helpchain-logo.png` (served from `client/public/images/`)

## Architecture

### Frontend pages (all using real APIs)
- `home.tsx` — Landing page, marketing content
- `auth.tsx` — Firebase sign-in / sign-up
- `dashboard.tsx` — Real tasks from API, wallet balance
- `discover.tsx` — Open tasks marketplace (real `task-api/tasks/open`)
- `search.tsx` — Searchable task list with filters (uses real open tasks)
- `request-details.tsx` — Task detail + offer submission + hire/complete/review flow
- `batch-management.tsx` — Offer management for a specific task (real offers API)
- `messages.tsx` — Real conversations + messages (polls every 8-15s)
- `public-profile.tsx` — User profile + reviews (real `task-api/public-profile/:id`)
- `admin-dashboard.tsx` — Admin only (email-gated), real task data
- `create-request.tsx` — Post new task (real API + escrow)
- `wallet.tsx` — Paystack deposit + withdrawal
- `profile.tsx` — Edit own profile (Firebase + Supabase profiles table)

### Backend (Supabase Edge Functions)
- `task-api/index.ts` — All task/offer/review/conversation/message endpoints
  - Firebase JWT verification via JWKS (jose)
  - Routes: GET/POST /tasks, GET /tasks/open, GET/POST/PATCH /tasks/:id/offers,
    PATCH /offers/:id/(accept|reject|withdraw), PATCH /tasks/:id/complete,
    GET/POST /reviews, GET /conversations, POST /conversations,
    GET/POST /conversations/:id/messages, GET /public-profile/:userId

### Hooks
- `use-tasks-api.ts` — `useTasksApi()`, `useTask()`, `useTaskOffers()`, `useCompleteTask()`, `useSubmitReview()`, `useUserReviews()`
- `use-messaging.ts` — `useConversations()`, `useMessages()`
- `use-wallet.ts` — Paystack integration + balance
- `use-firebase-auth.ts` — Firebase auth state + token

## Database (Supabase PostgreSQL)

### Tables
- `profiles` — user profiles (user_id TEXT, full_name, avatar_url, bio, skills, location, reputation_score, total_tasks_done, id_verified)
- `tasks` — task listings (requester_id, helper_id, title, description, category, budget, status: open/in_progress/completed, offers_count, is_remote)
- `offers` — task applications (task_id, worker_id, amount, message, status: pending/accepted/rejected/withdrawn)
- `reviews` — ratings after completion (task_id, reviewer_id, reviewee_id, rating 1-5, comment)
- `conversations` — message threads (participant_a, participant_b, task_id, unread_a, unread_b)
- `messages` — individual messages (conversation_id, sender_id, body)
- `wallets` — NGN balance ledger (available_balance, escrow_balance)
- `wallet_transactions` — audit log
- `deposits` / `withdrawals` — Paystack payment records

Migration file: `supabase/migrations/20260524000000_helpchain_full_schema.sql`

## Mobile Publishing (Capacitor)

### Setup complete
- `capacitor.config.ts` — app ID `ng.helpchain.app`, webDir `dist`
- `android/` — Android project (Gradle, ready for Android Studio)
- `ios/` — iOS project (Xcode project, ready for Xcode)

### Build commands (run from HelpChain-1/)
```bash
# Build web app + sync to native
npm run cap:sync

# Open Android Studio (requires Android Studio installed)
npm run cap:android

# Open Xcode (requires macOS + Xcode)
npm run cap:ios
```

### Android publishing checklist
1. Run `npm run cap:android` to open in Android Studio
2. Generate signed APK/AAB: Build → Generate Signed Bundle/APK
3. Upload to Google Play Console

### iOS publishing checklist
1. On a Mac, run `npm run cap:ios` to open in Xcode
2. Set team/signing in Xcode
3. Archive → Distribute App → App Store Connect

## Environment Variables Required

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_PAYSTACK_PUBLIC_KEY=
```

## User Preferences
- No mock/seed data — all features must use real APIs
- No Expo — using Capacitor for mobile
- Nigerian market: NGN (₦) currency, local city references
- Green brand (#0C6B38), Figtree font
- Mobile-first design, all pages must work on small screens
