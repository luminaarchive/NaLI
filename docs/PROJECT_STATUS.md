# NaLI Project Status

Status date: 2026-05-21.

## Stable Facts

- Project: NaLI Sprint 0 / Sprint 0.2.
- Production site: `https://naliai.vercel.app`.
- Public visual is locked.
- Sprint 0 feedback persistence is locked and verified.
- `reports`, `usage_events`, `report_feedback`, and `payments` are production verified.
- Supabase URL values must be the base project URL only, without `/rest/v1`.
- Sprint 0.1 paid export MVP is production verified.
- Unpaid export returns locked/HTTP `402`.
- Pending payment rows are created in production.
- Confirmed payment unlocks markdown export through the `payments` table.
- Midtrans is not configured in production.
- Manual pending payment mode is active for first-sale operations.
- No big agentic features should be added while first-sale manual payment operations are being stabilized.

## Current Priority

The next meaningful product checkpoint is Sprint 0.2 first sale readiness: founder-safe manual payment SOP, conservative payment claims, and repeatable production smoke checks. Do not expand into large Professional Layer, agentic, realtime, enterprise, SOS, or dashboard features during this pass.

## Production Verification Notes

- Feedback persistence has production verification.
- Paid export production verification passed for readiness, unpaid export lock, pending payment creation, confirmed payment unlock, and markdown export after confirmation.
- `payments` is the source of truth for export unlock.
- Payment creation is pending/manual when Midtrans is absent and must not be treated as fake payment success.
- Fallback/local success is useful for resilience, but it is not proof of production persistence.
- Persistence/payment bugs should be checked with production smoke/readiness commands before being marked fixed.

## Environment Notes

- `NEXT_PUBLIC_SUPABASE_URL` and server-side Supabase URL values must be the base Supabase project URL.
- Do not append `/rest/v1`.
- Keep Supabase service role, Midtrans secrets, raw access keys, guest session IDs, and hashes out of logs and commits.
- Local production service-role env may be protected; use trusted admin/MCP confirmation for production smoke resume only when necessary.
