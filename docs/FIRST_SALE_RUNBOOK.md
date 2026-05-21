# NaLI First Sale Runbook

Status date: 2026-05-21.

## Scope

This runbook is for the first real paid NaLI export during Sprint 0.6.

Primary June flow after env activation: free preview -> one-time paid export -> Midtrans one-time checkout -> Midtrans webhook confirmation -> markdown/PDF export unlock.

Manual confirmation is fallback only. Use it only when Midtrans env is missing/unavailable or a payment needs trusted founder/admin recovery. Export must stay locked until the `payments` table has a confirmed successful row.

Current production automatic checkout is not active until Vercel has the required Midtrans env values, production is redeployed, the Midtrans Payment Notification URL is configured, and `npm run smoke:export:prod` passes. Use `docs/MIDTRANS_ENV_SETUP.md` for the secure setup checklist.

Do not use this runbook to change public UI, pricing copy, homepage copy, Field Intelligence copy, or product claims.

## 1. User Generates A Free Preview

1. The user opens `https://naliai.vercel.app`.
2. The user starts the Learn & Report flow and goes to `/create-report`.
3. The user selects the report mode, enters their own material or topic, and checks the academic integrity consent.
4. NaLI generates the free preview and stores the report in production Supabase when persistence is available.
5. The user lands on `/report/[id]`, where the free preview can be reviewed.

Safe evidence to capture:

- Screenshot of the report preview page.
- The report id shown in the URL or admin table.
- The fact that the report is visible before paid export.

Do not screenshot or share raw access keys, guest session ids, hashes, service role values, or provider secrets.

## 2. Unpaid Export Lock

Before payment is confirmed, markdown and PDF export endpoints must stay locked.

Expected behavior:

- `/api/reports/[id]/export` returns a locked response, normally HTTP `402`.
- `/api/reports/[id]/export?format=pdf` returns a locked response, normally HTTP `402`.
- The response says payment is required.
- No markdown or PDF export content is returned before payment confirmation.
- No secret-like values appear in the response.

This is intentional. A free preview is allowed; premium export is not unlocked until the `payments` table has a successful payment row for the report.

## 3. Pending Payment Row Creation

When the user requests export unlock, production calls `/api/payments/create`.

Expected automatic behavior when Midtrans is configured:

- The API validates the report id and report access key.
- The API creates a Midtrans Snap one-time transaction.
- The API creates a `payments` row with `status = pending`.
- The API returns safe checkout data only: `checkout_url`/`snap_url` and `snap_token`.
- The API does not mark the payment as paid.
- Export remains locked while the payment row is pending.

Fallback behavior while Midtrans is not configured:

- The API creates a `payments` row with `status = pending`.
- The API returns `payment_mode = manual`.
- The API returns `status = manual_payment_pending`.
- The API does not return a Snap URL or Snap token.
- The API does not mark the payment as paid.

The pending row is the operational cue. In automatic mode, Midtrans webhook should confirm it. In fallback mode, the founder must check real payment evidence manually.

## 4. Automatic Midtrans Confirmation

When Midtrans sends a webhook:

- Verify the Midtrans signature with the server key.
- Accept success only for `settlement` or `capture` with `fraud_status = accept`.
- Update the matching `payments` row to `paid`.
- Do not copy payment order ids, expiry, or paid state into `reports`.
- Deny, cancel, expire, failure, pending, or challenge states must not unlock export.
- Never expose Midtrans secrets, service role keys, raw access keys, hashes, or guest session ids in logs or UI.

## 5. Founder Verifies Payment Manually

Manual verification is fallback only. Before confirming a fallback payment, the founder should compare the user's proof against production records.

Check the user evidence:

- Screenshot or receipt from the payment channel actually used.
- Paid amount matches the NaLI export price shown for the user.
- Payment date/time is plausible.
- Sender/account/reference matches the buyer conversation as closely as possible.
- The user can identify the report they want unlocked.

Check the database evidence:

- `payments.id` or `payments.report_id` matches the user request.
- `payments.status` is still `pending`.
- `payments.export_type` is `markdown` or `pdf` according to the requested export.
- The row belongs to the intended report.
- There is no existing successful payment row for a different order that is being confused with this sale.

If evidence is unclear, do not confirm the payment yet. Ask the user for clearer proof or wait until the payment is visible in the founder's payment channel.

## 6. Founder Confirms Payment Safely

Preferred local command when production service-role env is available locally:

```bash
npm run payment:confirm:manual -- --payment-id <payment-id> --confirm
```

Alternative lookup by report id:

```bash
npm run payment:confirm:manual -- --report-id <report-id> --confirm
```

Safety rules:

- Run the command only from the founder/admin machine or another trusted server-side environment.
- Confirm only after real payment evidence is checked.
- Update the `payments` table only; do not duplicate payment truth into `reports`.
- Keep confirmation server-side. Do not expose a public client button or public API endpoint for this operation.
- Do not print, screenshot, or share service role keys, access keys, hashes, Midtrans secrets, or raw guest session ids.

If local production service-role env is protected or unavailable, use the Supabase dashboard or trusted admin/MCP access to perform the same operation: update the intended pending `payments` row to `status = paid`, with safe manual metadata. Do not update unrelated rows.

## 7. User Downloads Markdown/PDF Export

After confirmation:

1. The user reloads the existing `/report/[id]` page.
2. `/api/reports/[id]` should return `export_readiness = export_ready`.
3. The user uses Download Markdown or Download PDF.
4. `/api/reports/[id]/export` should return markdown content.
5. `/api/reports/[id]/export?format=pdf` should return `application/pdf`.

Safe evidence to capture:

- Screenshot that export is ready after confirmation.
- Screenshot of the successful markdown/PDF download or browser download entry.
- Safe database screenshot showing the payment id, report id, export type, status, and timestamps only.

## 8. What Not To Claim Publicly Yet

Until production readiness and smokes prove Midtrans automatic checkout, do not claim:

- Card, bank, e-wallet, or Midtrans payment is active.
- Export unlock is instant without founder review.
- Payment confirmation is fully automated.
- Subscriptions or recurring billing are active.
- DOCX premium export is active.
- Field Intelligence is a fully live operational system.

The honest current claim is based on readiness: automatic one-time Midtrans checkout only when `midtransConfigured = true` and production smoke passes; otherwise manual fallback can unlock markdown/PDF after trusted payment confirmation.
