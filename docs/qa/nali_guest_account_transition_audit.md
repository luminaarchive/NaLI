# QA Audit: Guest Account Transition

## Checklist
- [x] Unauthenticated guest can access only their own guest thread (verified via cookie).
- [x] Authenticated user can access their own linked thread.
- [x] User A cannot access User B's thread.
- [x] Invalid guest token is denied.
- [x] Duplicate link operation is idempotent (no errors, no changes if already linked).
- [x] LocalStorage cache cannot override server ownership.
- [x] Client-supplied `guest_id` in payload is ignored; system strictly uses HTTP-only cookie.
- [x] Playwright E2E tests successfully simulate homepage query -> workspace -> 3 messages -> refresh -> sidebar reopen -> login -> link guest thread.

## Known Limitations
- Testing the exact login transition in E2E requires a valid test auth environment. If missing, E2E will log a soft bypass and default to mock server validation.