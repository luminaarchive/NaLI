# NaLI Project Status

Status date: 2026-05-21.

## Stable Facts

- Project: NaLI Sprint 0 / Sprint 0.1.
- Production site: `https://naliai.vercel.app`.
- Public visual is locked.
- Sprint 0 feedback persistence is locked and verified.
- `reports`, `usage_events`, and `report_feedback` are production verified.
- Supabase URL values must be the base project URL only, without `/rest/v1`.
- Sprint 0.1 paid export MVP code is implemented.
- Paid export production verification is the next pending task.
- No big agentic features should be added until the monetization flow is verified.

## Current Priority

The next meaningful product checkpoint is production verification of the paid export flow. Until that is done, do not expand into large Professional Layer, agentic, realtime, enterprise, SOS, or dashboard features.

## Production Verification Notes

- Feedback persistence has production verification.
- Payment/export code exists, but code implementation is not the same as production payment verification.
- Fallback/local success is useful for resilience, but it is not proof of production persistence.
- Persistence/payment bugs should be checked with production smoke/readiness commands before being marked fixed.

## Environment Notes

- `NEXT_PUBLIC_SUPABASE_URL` and server-side Supabase URL values must be the base Supabase project URL.
- Do not append `/rest/v1`.
- Keep Supabase service role, Midtrans secrets, raw access keys, guest session IDs, and hashes out of logs and commits.
