# NaLI Thread Persistence Architecture

## Overview
To provide a seamless experience for wildlife field intelligence, NaLI supports guest report sessions that persist server-side and transition to authenticated accounts post-login.

## Architecture
1. **Guest Identifier**: Unauthenticated users are assigned a secure HTTP-only `guest_id` cookie upon creating a report or chat thread.
2. **Server-side Persistence**: Threads and messages are stored in Supabase. The `threads` table references either a `user_id` (for authenticated users) or a `guest_id` (for anonymous users).
3. **Account Transition**: Post-registration or login, the client calls `/api/auth/link-guest`. The backend verifies the `guest_id` cookie and updates all matching threads to link to the authenticated `user_id`, setting `guest_id` to null.
4. **Local Fallback**: `localStorage` acts only as a secondary offline cache. The sidebar always prioritizes server-fetched threads.

## Security & RLS
- Row Level Security (RLS) ensures `auth.uid() = user_id` for registered users.
- For guests, API routes validate the `guest_id` cookie against the `guest_id` column using a service role or custom claims, preventing URL parameter manipulation.
- Linking is idempotent and prevents cross-user takeover by ensuring `user_id` is currently null before linking.