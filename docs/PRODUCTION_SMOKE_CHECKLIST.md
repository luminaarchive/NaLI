# NaLI Production Smoke Checklist

Status date: 2026-05-21.

Use this checklist before calling payment, persistence, or export work complete in production.

## Required Commands

```bash
npm run smoke:feedback:prod
npm run smoke:export:prod
```

Check readiness directly:

```bash
npm run check:readiness:prod
```

Or fetch the endpoint:

```bash
curl -s https://naliai.vercel.app/api/system/readiness
```

Do not paste or commit responses that contain secret-like values. The readiness endpoint should report statuses, not secrets.

## Readiness Expectations

Production readiness must show:

- `reports` success is true.
- `report_feedback` success is true.
- `usage_events` success is true.
- `payments` success is true.

Current payment expectation:

- `midtransConfigured` is false until Midtrans env is configured.
- Manual pending payment mode is acceptable only when it is clearly reported as manual, not fake success.

## Feedback Smoke Expectations

`npm run smoke:feedback:prod` must verify:

- Production report creation persists in Supabase.
- Feedback persists in `report_feedback`.
- Usage events persist in `usage_events`.
- Redacted logs do not print raw access keys, guest session ids, hashes, service role values, or tokens.

Fallback responses are useful resilience behavior, but fallback must not be counted as production persistence success.

## Paid Export Smoke Expectations

`npm run smoke:export:prod` must verify:

- Payments readiness success is true.
- Unpaid export is locked, normally HTTP `402`.
- `/api/payments/create` creates a pending payment row.
- Payment creation does not fake paid success.
- Confirmed payment unlocks export through the `payments` table source of truth.
- Markdown export content is returned only after confirmed payment.
- No secrets are printed.

If production service-role env is not available locally, the export smoke may pause after creating a pending payment row. Confirm the saved pending payment with trusted Supabase admin/MCP access, then rerun:

```bash
npm run smoke:export:prod
```

The rerun must verify `export_readiness = export_ready` and successful markdown export.

## Manual Payment Confirmation Check

For first-sale manual payment confirmation, use this only after checking real payment evidence:

```bash
npm run payment:confirm:manual -- --payment-id <payment-id> --confirm
```

or:

```bash
npm run payment:confirm:manual -- --report-id <report-id> --confirm
```

The `payments` table remains the source of truth. Do not unlock export by changing public client state or by treating fallback/local success as production payment success.
