# NaLI Project Status

Status date: 2026-05-21.

## Stable Facts

- Project: NaLI Sprint 0 / Sprint 0.7.
- Production site: `https://naliai.vercel.app`.
- Release checkpoint: `v0.1.0-first-sale`.
- Latest controlling guideline: `NaLI Guidelines v1.5.3 COMPLETE.pdf`.
- Public visual is locked.
- Sprint 0 feedback persistence is locked and verified.
- `reports`, `usage_events`, `report_feedback`, and `payments` are production verified.
- Sprint 0.7 adds CP1-safe `report_events` and `api_usage_logs` foundations for operational audit and cost logging.
- Supabase URL values must be the base project URL only, without `/rest/v1`.
- Sprint 0.1 paid export MVP is production verified.
- Sprint 0.4 simple paid PDF export is production verified.
- Unpaid export returns locked/HTTP `402`.
- Pending payment rows are created in production.
- Confirmed payment unlocks markdown and PDF export through the `payments` table.
- Sprint 0.5 activates the automatic Midtrans one-time payment code path when server-only Midtrans env is configured.
- Sprint 0.6 audit confirms production Midtrans automatic checkout is still blocked by missing Vercel Midtrans env until secure env setup, redeploy, webhook setup, and smoke verification pass.
- Manual pending payment mode remains fallback only when Midtrans env is missing/unavailable.
- CP1 active flow is Text/Form Report Flow only; upload remains dormant/future.
- No CP2/CP3/CP4/CP5/CP6 features should be added before CP1 is live with a real verified Midtrans transaction.

## Current Priority

The current product phase is Sprint 0.7 CP1 operational readiness: lock minimal report events, internal cost logging, and basic templates while keeping Midtrans production env activation as the remaining CP1 blocker.

Do not expand into CP2/CP3/CP4 features, upload pipeline, manual fulfillment/custom reviewed report, DOCX, subscriptions, NaLI Energy UI, Literature Matrix, Crossref/PubMed/DOI resolver, NASA/GFW/Darwin Core, SOS, Professional Dashboard, PostGIS/H3, or other CP5-CP6 features during this CP1 readiness phase.

## Production Verification Notes

- Feedback persistence has production verification.
- Paid export production verification passed for readiness, unpaid export lock, pending payment creation, confirmed payment unlock, markdown export after confirmation, and PDF export after confirmation.
- `payments` is the source of truth for export unlock.
- Payment creation is pending/manual when Midtrans is absent and must not be treated as fake payment success.
- When Midtrans is configured, payment creation must remain pending until a valid Midtrans webhook confirms `settlement` or `capture` with `fraud_status = accept`.
- `/api/system/readiness` may expose `midtransConfigured` and `midtransProductionMode` booleans, but never raw Midtrans env values.
- `/api/system/readiness` should expose safe booleans/counts for `report_events` and `api_usage_logs` only; provider/model/cost details stay internal and off public UI.
- Fallback/local success is useful for resilience, but it is not proof of production persistence.
- Persistence/payment bugs should be checked with production smoke/readiness commands before being marked fixed.

## Environment Notes

- `NEXT_PUBLIC_SUPABASE_URL` and server-side Supabase URL values must be the base Supabase project URL.
- Do not append `/rest/v1`.
- Keep Supabase service role, Midtrans secrets, raw access keys, guest session IDs, and hashes out of logs and commits.
- Local production service-role env may be protected; use trusted admin/MCP confirmation for production smoke resume only when necessary.
