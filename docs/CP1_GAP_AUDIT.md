# CP1 Gap Audit

Status date: 2026-05-21.

Latest controlling guideline: `NaLI Guidelines v1.5.3 COMPLETE 2.pdf`.

## Summary

Sprint 0 through Sprint 0.5 has the core paid export foundation in place: report generation, markdown export, PDF export, feedback capture, integrity guardrails, payment-gated unlock, and a Midtrans Snap code path. The remaining CP1 operational gap is production Midtrans activation: Vercel Production does not currently have the required Midtrans env values, so production readiness correctly reports Midtrans as not configured and manual pending payment remains fallback only.

No public visual surface was redesigned for this audit.

## CP1 / Build Now Matrix

| CP1 item                            | Status         | Evidence                                                                                                                                                                                                                                    | Next action                                                                                                       |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Report quality                      | DONE           | Sprint 0.3 report structure includes title, summary, observation context, findings, evidence-based analysis, confidence note, disclaimer, recommendations, and evidence notes.                                                              | Keep improving only through small tested content/export changes.                                                  |
| Markdown export                     | DONE           | Paid markdown export is locked before payment and available after confirmed payment.                                                                                                                                                        | Keep regression tests and production smoke.                                                                       |
| PDF export                          | DONE           | Sprint 0.4 added simple paid PDF export with the same payment gate as markdown.                                                                                                                                                             | Keep PDF simple; do not add DOCX now.                                                                             |
| Midtrans one-time automatic payment | BLOCKED BY ENV | Code path exists, but Vercel Production env audit found no `MIDTRANS_*` values. Readiness must remain `midtransConfigured: false` until env is configured and redeployed.                                                                   | Add server-only Midtrans env in Vercel, set Midtrans webhook URL, redeploy, then run `npm run smoke:export:prod`. |
| Paid export gate                    | DONE           | Export unlock source of truth remains `payments` table joined by `report_id`; unpaid markdown/PDF returns locked HTTP `402`.                                                                                                                | Do not weaken pending/manual fallback behavior.                                                                   |
| Minimal founder admin view          | DONE           | `/system` and `/system/orders` are protected by Supabase auth and show safe operational metadata: report counts/status, payment counts/status, export locked/ready indicators, feedback count, manual pending count, and Midtrans booleans. | Keep it minimal; do not turn it into a Professional Dashboard.                                                    |
| Basic templates min. 3              | DONE           | `reportTemplates` currently has seven basic Learn & Report templates.                                                                                                                                                                       | Do not add large template infrastructure now.                                                                     |
| User feedback capture               | DONE           | `report_feedback` exists and production feedback smoke is part of required verification.                                                                                                                                                    | Continue using production smoke for regressions.                                                                  |
| Integrity/disclaimer lock           | DONE           | Server-side integrity policy and required disclaimers are covered by regression tests.                                                                                                                                                      | Keep prompt-only safety out of the critical path.                                                                 |
| No fake citation/source guard       | DONE           | Source verification remains clearly inactive in MVP and fake citation/data requests are blocked by policy tests.                                                                                                                            | Do not claim live source verification until implemented and verified.                                             |
| Minimal cost logging                | DONE           | `usage_events` readiness is production verified and cost protection status appears in the internal system view.                                                                                                                             | Keep logs non-blocking and avoid provider-cost public language.                                                   |

## Midtrans Production Activation Gap

Current env contract supported by code:

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_MERCHANT_ID`
- `MIDTRANS_ENVIRONMENT`
- `MIDTRANS_IS_PRODUCTION`
- optional `MIDTRANS_SNAP_BASE_URL`
- optional `NALI_EXPORT_PRICE_IDR`

`MIDTRANS_CLIENT_KEY` is not required by the current server-created redirect URL flow and must not be exposed with `NEXT_PUBLIC_`.

Production activation is not complete until:

1. Vercel Production has the required server-only env values.
2. Production is redeployed.
3. Midtrans dashboard has `https://naliai.vercel.app/api/payments/midtrans-webhook` as the Payment Notification URL.
4. `/api/system/readiness` returns `midtransConfigured: true`.
5. `npm run smoke:export:prod` verifies checkout data, pending state, locked export while pending, confirmed payment unlock, markdown export, and PDF export.

## Founder Admin View Risk

`/system` and `/system/orders` are internal protected routes under `src/app/(app)`. `src/proxy.ts` redirects unauthenticated `/system` requests to `/login`, and the `(app)` layout also requires a Supabase session.

The founder order view is intentionally minimal. It must not expose:

- raw `guest_session_id`
- raw access keys or access tokens
- SHA-256 hashes
- service role values
- Midtrans Server Key
- Snap token values
- webhook signatures

Existing manual fulfillment views are treated as prepared/internal metadata only. Do not build manual fulfillment/custom reviewed report as a CP1 feature in this sprint.

## Production Claim

Current safe claim: paid markdown/PDF export works through the `payments` table source of truth, and manual pending payment remains fallback while Midtrans env is missing.

Do not claim automatic Midtrans production payment is active until the env setup and smoke verification above pass.
