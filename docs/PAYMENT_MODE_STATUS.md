# NaLI Payment Mode Status

Status date: 2026-05-21.

## Current Mode

NaLI Sprint 0.5 target mode is automatic Midtrans one-time payment for paid report export.

When Midtrans server env is configured, `/api/payments/create` creates a Midtrans Snap one-time transaction, stores a pending row in the `payments` table, and returns only safe checkout data (`checkout_url`/`snap_url` and `snap_token`) to the client. Export remains locked while the payment row is pending.

Manual fallback exists only when Midtrans env is missing or unavailable. In fallback mode, `/api/payments/create` creates a real pending row in the `payments` table and returns `payment_mode = manual`; export remains locked until trusted founder/admin confirmation updates the row.

## Midtrans Status

The code path for automatic Midtrans checkout is active when server-only Midtrans env is configured. Production readiness must be checked through `/api/system/readiness`; do not infer readiness from local fallback behavior.

Current server-only env names:

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_MERCHANT_ID`
- `MIDTRANS_ENVIRONMENT` (`production` enables production Snap)
- `MIDTRANS_IS_PRODUCTION` (alias accepted for production mode)
- `MIDTRANS_SNAP_BASE_URL` (optional, must point to `https://app.midtrans.com` or `https://app.sandbox.midtrans.com`)

`MIDTRANS_CLIENT_KEY` is not required by the current server-created Snap redirect flow and must not be exposed through `NEXT_PUBLIC_`.

Expected behavior while Midtrans is absent:

- No fake Snap checkout URL.
- No fake Snap token.
- No automatic paid status.
- No public claim that payment gateway checkout is active.
- Manual confirmation only after real payment evidence is checked.

## Source Of Truth

The `payments` table is the source of truth for confirmed payment and export unlock.

The export gate checks successful payment state from `payments` joined by `report_id`. Do not copy payment order ids or paid status into `reports` as a second source of truth.

Successful payment statuses currently recognized by the export gate are `paid` and `success`. Midtrans webhook confirmation maps only `settlement` or `capture` with `fraud_status = accept` to `paid`.

Denied, cancelled, expired, failed, challenge, or pending Midtrans states must not unlock export.

## No Fake Success Rule

Payment creation is not payment success.

The create-payment route may create a pending row, but it must not return `paid`, `success`, `export_ready`, or any equivalent success state unless a real payment has already been confirmed through the trusted server-side payment source.

If Midtrans is missing, the correct public state is manual pending payment, not automatic checkout.

## Midtrans Activation Checklist

Before claiming automatic checkout is live in production:

1. Configure production `MIDTRANS_SERVER_KEY`, `MIDTRANS_MERCHANT_ID`, and either `MIDTRANS_ENVIRONMENT=production` or `MIDTRANS_IS_PRODUCTION=true` in Vercel.
2. Confirm server-only storage of Midtrans secrets. Do not add `NEXT_PUBLIC_` Midtrans secret variables.
3. Verify `/api/system/readiness` reports `midtransConfigured = true`.
4. Create a real or sandbox transaction through the production route, depending on the chosen activation stage.
5. Verify a safe Snap checkout URL/token is returned only when Midtrans is configured.
6. Verify the Midtrans webhook signature before updating any payment row.
7. Confirm webhook updates the matching `payments` row by Midtrans order id.
8. Confirm markdown and PDF export unlock only after the `payments` row reaches a successful status.
9. Run `npm run smoke:export:prod`.
10. Update founder runbooks and public copy only after verification passes.

Until those checks pass in production, keep public wording conservative and do not promise instant checkout.
