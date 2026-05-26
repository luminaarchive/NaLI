# NaLI CP1 Report Balance Runbook

## Operational State

| Control | Required State |
| --- | --- |
| Human Testing | PAUSED |
| Midtrans | DEFERRED |
| Paid Launch | NO-GO |
| Public/user PDF/DOCX export | LOCKED / INACTIVE |
| Upload API | INACTIVE / BLOCKED |
| Source verification | INACTIVE |
| Entitlement Gate | IMPLEMENTED / GO |
| Internal Premium QA Resolver | IMPLEMENTED / GO |
| Payment Activation | NOT IMPLEMENTED |
| Public Premium Activation | NOT IMPLEMENTED |

## Public Product Contract

- Normal users see a single report workflow and the primary `Buat Laporan` action.
- Do not expose Peregrine, Obsidian, Zephyr, Haiku, or Sonnet as public choices.
- Internal engine profiles remain permitted for backend routing and trusted internal QA only.
- Public monetization language uses `Laporan`, never model names or credits.

## Configured Packages

| ID | Display | Prepared Price | Included Reports | Public Copy |
| --- | --- | ---: | ---: | --- |
| `basic` | Basic | Rp15.000 | 5 | 5 laporan cepat |
| `pro` | Pro | Rp49.000 | 5 | 5 laporan lengkap |
| `pro_bundle` | Pro Bundle | Rp89.000 | 10 | 10 laporan lengkap |

These are configuration and copy readiness only. Do not add a live buy action, checkout redirect, webhook success transition, or report credit grant until separately authorized.

## Balance Decisions

Default CP1 behavior:

- Starter/free report generation is explicitly available and remains rate-limited and integrity-checked.
- Paid report balances default to zero and unverified.
- Basic or Pro generation requires a future verified balance and is denied while no such balance exists.
- Never infer balance from client input, local storage, query strings, internal model names, or internal QA tokens.

Charge rules:

| Action | Balance Effect |
| --- | --- |
| New successful paid report generation | Consume 1 report |
| Regenerate from scratch after successful paid generation | Consume 1 report |
| Manual edit of an existing report | No consumption |
| Copy/download of the same result | No consumption |
| Server generation failure | `generation_failed_no_charge` |
| Integrity or rate-limit block | `generation_failed_no_charge` |

## Ledger Vocabulary

The server type layer reserves only these balance event types:

```text
purchase_basic
purchase_pro
purchase_pro_bundle
consume_basic_report
consume_pro_report
refund_report
generation_failed_no_charge
```

Persistent `report_balances` and `report_ledger_events` storage is deferred in this sprint. Payment is not active, and introducing public balance truth before an authorized purchase path would risk creating misleading entitlement state.

## API Rules

- The public request may express a safe report type, but it must never select an internal engine.
- Client-supplied model or engine names must not unlock a premium path.
- Server-selected public generation remains the starter/free path until a future verified report balance system is activated.
- Existing trusted internal QA entitlement may continue exercising premium internal profiles server-side.
- Internal QA entitlement does not create paid status and does not unlock public export, upload, verification, or payment.

## Public UI Rules

- Display package information as inactive CP1 readiness copy only.
- Use: `Laporan kamu habis. Pilih paket untuk lanjut.` for prepared empty-balance UX.
- Always pair package display with: `Pembayaran dan checkout belum aktif di CP1.`
- Keep public PDF/DOCX lock messaging visible.
- Retain local Markdown/TXT result copy or download only where already allowed.

## Readiness Contract

Readiness must safely report:

```text
singleReportProduct: enabled
reportPackagesConfigured: true
reportBalanceArchitecture: enabled
paymentActivation: disabled
publicPremiumActivation: disabled
midtrans: deferred_inactive
publicExport: locked_inactive
uploadApi: inactive_blocked
sourceVerification: inactive
```

Do not expose secret values, internal authorization material, fake balance, or purchase state.

## Verification

Before merging or deploying changes to this area, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
node --test tests/reports/*.test.cjs
```

Run `npm run check:i18n` when the script exists. Inspect `/create-report` at 360px and 430px widths to confirm one-report copy is readable, no model selector is present, public PDF/DOCX remains locked, no checkout action appears, and there is no horizontal overflow.

Founder manual testing is not required before agent verification.
