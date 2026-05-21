# NaLI Payment Mode Status

Status date: 2026-05-21.

## Current Mode

NaLI production is currently in manual pending payment mode.

When a user requests a paid markdown export and Midtrans is not configured, `/api/payments/create` creates a pending row in the `payments` table and returns `payment_mode = manual`. Export remains locked until the founder confirms the payment.

## Midtrans Status

Midtrans is not configured in production.

Expected behavior while Midtrans is absent:

- No fake Snap checkout URL.
- No fake Snap token.
- No automatic paid status.
- No public claim that payment gateway checkout is active.
- Manual confirmation only after real payment evidence is checked.

## Source Of Truth

The `payments` table is the source of truth for confirmed payment and export unlock.

The export gate checks successful payment state from `payments` joined by `report_id`. Do not copy payment order ids or paid status into `reports` as a second source of truth.

Successful payment statuses currently recognized by the export gate are `paid` and `success`. Manual first-sale confirmation should set the intended pending payment row to `paid`.

## No Fake Success Rule

Payment creation is not payment success.

The create-payment route may create a pending row, but it must not return `paid`, `success`, `export_ready`, or any equivalent success state unless a real payment has already been confirmed through the trusted server-side payment source.

If Midtrans is missing, the correct public state is manual pending payment, not automatic checkout.

## Future Midtrans Activation Checklist

Before claiming automatic checkout is live:

1. Configure production `MIDTRANS_SERVER_KEY`, `MIDTRANS_MERCHANT_ID`, and `MIDTRANS_ENVIRONMENT` in Vercel.
2. Confirm server-only storage of Midtrans secrets. Do not add `NEXT_PUBLIC_` Midtrans secret variables.
3. Verify `/api/system/readiness` reports `midtransConfigured = true`.
4. Create a real or sandbox transaction through the production route, depending on the chosen activation stage.
5. Verify a safe Snap checkout URL is returned only when Midtrans is configured.
6. Verify the Midtrans webhook signature before updating any payment row.
7. Confirm webhook updates the matching `payments` row by Midtrans order id.
8. Confirm markdown export unlocks only after the `payments` row reaches a successful status.
9. Run `npm run smoke:export:prod`.
10. Update founder runbooks and public copy only after verification passes.

Until those checks pass, keep public wording manual and conservative.
