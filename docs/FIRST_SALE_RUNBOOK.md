# NaLI First Sale Runbook

Status date: 2026-05-21.

## Scope

This runbook is for the first real paid NaLI export while production is in manual pending payment mode. Midtrans is not configured, so payment is not automatic and export must stay locked until the founder confirms a real payment in the `payments` table.

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

Before payment is confirmed, the markdown export endpoint must stay locked.

Expected behavior:

- `/api/reports/[id]/export` returns a locked response, normally HTTP `402`.
- The response says payment is required.
- No export markdown is returned before payment confirmation.
- No secret-like values appear in the response.

This is intentional. A free preview is allowed; premium markdown export is not unlocked until the `payments` table has a successful payment row for the report.

## 3. Pending Payment Row Creation

When the user requests export unlock, production calls `/api/payments/create`.

Current expected behavior while Midtrans is not configured:

- The API creates a `payments` row with `status = pending`.
- The API returns `payment_mode = manual`.
- The API returns `status = manual_payment_pending`.
- The API does not return a Snap URL or Snap token.
- The API does not mark the payment as paid.

The pending row is the founder's operational cue that a real payment must be checked manually.

## 4. Founder Verifies Payment Manually

Before confirming a payment, the founder should compare the user's proof against production records.

Check the user evidence:

- Screenshot or receipt from the payment channel actually used.
- Paid amount matches the NaLI export price shown for the user.
- Payment date/time is plausible.
- Sender/account/reference matches the buyer conversation as closely as possible.
- The user can identify the report they want unlocked.

Check the database evidence:

- `payments.id` or `payments.report_id` matches the user request.
- `payments.status` is still `pending`.
- `payments.export_type` is `markdown`.
- The row belongs to the intended report.
- There is no existing successful payment row for a different order that is being confused with this sale.

If evidence is unclear, do not confirm the payment yet. Ask the user for clearer proof or wait until the payment is visible in the founder's payment channel.

## 5. Founder Confirms Payment Safely

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

## 6. User Downloads Markdown Export

After confirmation:

1. The user reloads the existing `/report/[id]` page.
2. `/api/reports/[id]` should return `export_readiness = export_ready`.
3. The user uses the existing Download Markdown action.
4. `/api/reports/[id]/export` should return markdown content.

Safe evidence to capture:

- Screenshot that export is ready after confirmation.
- Screenshot of the successful markdown download or browser download entry.
- Safe database screenshot showing the payment id, report id, export type, status, and timestamps only.

## 7. What Not To Claim Publicly Yet

While Midtrans is not configured and production is in manual pending payment mode, do not claim:

- Automatic checkout is live.
- Card, bank, e-wallet, or Midtrans payment is active.
- Export unlock is instant without founder review.
- Payment confirmation is fully automated.
- Subscriptions or recurring billing are active.
- PDF/DOCX premium exports are active if only markdown has been verified.
- Field Intelligence is a fully live operational system.

The honest current claim is: first-sale markdown export can be unlocked manually after the founder verifies payment.
