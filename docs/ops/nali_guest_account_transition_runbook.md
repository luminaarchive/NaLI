# NaLI Guest Account Transition Runbook

## Troubleshooting Account Transition

- **Guest Threads Not Linking**: Verify that the `guest_id` cookie is properly set as `HttpOnly` and is included in the `/api/auth/link-guest` request.
- **Cross-user Leakage**: Ensure the `user_id` `IS NULL` condition is enforced during the `UPDATE` operation in the linking route.
- **Sidebar Loading Issues**: Check network requests to `/api/reports/threads`. If the backend fails (e.g., 500 error), the UI should gracefully fall back to parsing `localStorage`.

## Rollback Strategy
If the server-side persistence causes issues:
1. Revert to client-side `localStorage` by flipping the `NEXT_PUBLIC_USE_LOCAL_STORAGE_ONLY` feature flag.
2. Threads created exclusively on the server may temporarily disappear from the local cache until the feature is restored.