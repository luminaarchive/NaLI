# Midtrans Env Setup

Status date: 2026-05-21.

## Current Production Status

The Midtrans one-time payment code path is implemented, but production is not automatic until Vercel has the required server-only Midtrans env values and the webhook URL is configured in Midtrans.

Current production Vercel env audit found no Midtrans env names. Manual pending payment remains the honest fallback until `/api/system/readiness` returns:

- `midtransConfigured: true`
- `midtransProductionMode: true` only when production mode is intentionally enabled

Do not paste Midtrans keys into chat, docs, commits, screenshots, or support messages.

## Env Names Supported By Current Code

Required for automatic Snap checkout:

- `MIDTRANS_SERVER_KEY`: server-only. Never expose with `NEXT_PUBLIC_`.
- `MIDTRANS_MERCHANT_ID`: server-only operational identifier.

Production mode:

- `MIDTRANS_ENVIRONMENT=production` enables production mode.
- `MIDTRANS_IS_PRODUCTION=true` is also accepted as an alias.

Optional:

- `MIDTRANS_SNAP_BASE_URL`: only use when needed. The code accepts only official HTTPS Midtrans app hosts and otherwise falls back to the environment-derived Snap endpoint.
- `NALI_EXPORT_PRICE_IDR`: optional export price override.

Not required by the current redirect flow:

- `MIDTRANS_CLIENT_KEY`: only needed if a future frontend Snap popup/script flow is added. Do not add `NEXT_PUBLIC_MIDTRANS_*` for the current redirect URL flow.
- `MIDTRANS_NOTIFICATION_URL`: not read by code. Configure the notification URL directly in the Midtrans dashboard.

## Vercel Dashboard Setup

Use Vercel Project Settings, not chat:

1. Open the NaLI project in Vercel.
2. Go to Settings -> Environment Variables.
3. Add the required env names for the Production environment only.
4. Paste values from the Midtrans dashboard directly into Vercel.
5. Do not add these values to `.env.local` unless the founder intentionally needs local testing; never commit them.
6. Redeploy production after env changes.
7. Run `npm run smoke:export:prod`.

If using Vercel CLI interactively, use `vercel env add <NAME> production` and type the value only into the secure CLI prompt. Do not echo values in shell history.

## Midtrans Dashboard Webhook Setup

Midtrans HTTP notifications are configured in the Merchant Administration Portal under Settings -> Configuration.

Set the Payment Notification URL to:

```text
https://naliai.vercel.app/api/payments/midtrans-webhook
```

Use HTTPS and standard ports. The webhook endpoint must be reachable from the public internet and must not require custom auth headers because Midtrans signs the JSON notification body.

Webhook success is required for automatic export unlock. The NaLI webhook accepts payment success only after a valid signature and one of these states:

- `settlement`
- `capture` with `fraud_status = accept`

`pending`, `deny`, `cancel`, `expire`, `failure`, and `challenge` must not unlock markdown or PDF export.

## Sandbox vs Production

Sandbox and production keys are different in Midtrans. For production payments:

- use production Server Key and Merchant ID;
- set `MIDTRANS_ENVIRONMENT=production` or `MIDTRANS_IS_PRODUCTION=true`;
- confirm `/api/system/readiness` reports production mode as true;
- run production smoke verification before claiming automatic payment is active.

Until the env and webhook are configured and smoke-verified, public claims must remain conservative: manual fallback can unlock paid export after trusted founder confirmation, but automatic Midtrans checkout is not active.
