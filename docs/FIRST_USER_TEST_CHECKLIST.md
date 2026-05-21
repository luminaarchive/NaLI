# NaLI First User Test Checklist

Status date: 2026-05-21.

## Scope

Use this checklist for the `v0.1.0-first-sale` checkpoint. The goal is to validate that a real person can understand the Learn & Report flow, receive a useful preview, request a paid markdown export, wait through manual payment confirmation, and download the export.

This is not a feature-building phase. Do not redesign public UI, change pricing, add automation, or claim automatic payment while Midtrans is not configured.

## Founder Test As A Customer

Run one full test as if you are a first buyer:

1. Open `https://naliai.vercel.app` in a normal browser window.
2. Start from the public CTA and go to the Learn & Report flow.
3. Use a realistic but low-risk test topic with your own material.
4. Check the academic integrity consent.
5. Generate a free preview.
6. Try markdown export before payment and confirm it is locked.
7. Create a manual pending payment request.
8. Confirm the payment using founder/admin-only handling.
9. Return to the report and download markdown.
10. Save only safe evidence: screenshots of visible UI states and safe payment row metadata.

Do not share raw access keys, guest session ids, hashes, service role values, Midtrans secrets, or private customer payment details.

## Report Generation Checklist

- User can find the report creation path from the public site.
- User understands the difference between draft-from-materials and start-from-zero guidance.
- Empty material is rejected.
- Academic integrity consent is required.
- A realistic free preview is generated.
- The preview says it is a draft/support document, not final truth.
- Source verification limits are clear.
- The report page loads after generation.
- The report id can be identified safely for support.

## Payment Pending Checklist

- User can request markdown export unlock.
- Before confirmed payment, export remains locked.
- Unpaid export returns locked/HTTP `402` or equivalent locked state.
- Payment creation creates a `payments` row with `status = pending`.
- Response indicates manual pending payment mode.
- No Snap URL or Snap token is shown while Midtrans is not configured.
- Payment creation does not claim paid, success, automatic checkout, or instant unlock.

## Manual Confirmation Checklist

- Founder verifies real payment evidence outside NaLI.
- Amount matches the expected markdown export price.
- Report id or payment id matches the intended user/report.
- `payments.status` is `pending` before confirmation.
- `payments.export_type` is `markdown`.
- Confirmation is done server-side/admin-only.
- Confirmation updates the intended `payments` row to `paid`.
- Payment truth stays in the `payments` table, not duplicated into `reports`.
- No public API route or public client control is used for manual confirmation.

Founder/admin command when production service-role env is available locally:

```bash
npm run payment:confirm:manual -- --payment-id <payment-id> --confirm
```

## Markdown Export Checklist

- After confirmation, report lookup returns `export_readiness = export_ready`.
- Download Markdown is available through the existing report flow.
- Export endpoint returns markdown only after confirmed payment.
- Markdown includes the draft/support label and required disclaimer.
- Export content does not contain access keys, guest session ids, hashes, service role values, or Midtrans secrets.
- User can open the downloaded markdown and understand what to review manually.

## Questions For The First Tester

Ask these after the test:

- What did you expect NaLI to do before you started?
- Was the free preview useful enough to continue?
- Which part of the report felt most helpful?
- Which part felt confusing, too long, or not credible?
- Did the integrity/disclaimer wording feel understandable?
- Did the export lock and manual payment explanation make sense?
- Were you comfortable waiting for founder confirmation?
- What would make you trust the output more?
- Would you pay for this markdown export again? Why or why not?
- What one change would make the next test easier?

## Successful First Test

Count the first test as successful when:

- The tester generates a preview without founder hand-holding beyond normal support.
- The tester understands that NaLI provides draft/support, not final truth.
- Unpaid export stays locked.
- Manual pending payment is created without fake success.
- Founder confirmation unlocks export through the `payments` table.
- Markdown export downloads after confirmation.
- The tester can name at least one useful part of the output.
- The founder collects concrete feedback for the next validation pass.

Do not count the test as successful if export unlock requires editing public client state, bypassing payment truth, printing secrets, or explaining away a broken persistence/payment flow.

## Feedback To Collect

Collect:

- Tester profile: student, teacher, field staff, NGO, researcher, or other.
- Original task/topic and whether the tester brought real materials.
- Time from landing page to preview.
- Time from export request to manual confirmation.
- Whether the tester understood manual payment mode.
- The tester's willingness to pay again.
- Confusing words or screens.
- Missing evidence/source expectations.
- Any support questions asked during the flow.
- Safe screenshots of the free preview, locked export, pending payment metadata, export-ready state, and markdown download.

Keep feedback concrete. The next phase is real user validation and sales learning, not broad new feature build.
