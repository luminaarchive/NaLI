# NaLI CP1 Single Report Product + Report Balance Architecture QA Report

## Status

| Area | Status |
| --- | --- |
| Human Testing | PAUSED |
| Midtrans | DEFERRED |
| Paid Launch | NO-GO |
| Public/user PDF/DOCX export | LOCKED / INACTIVE |
| Upload API | INACTIVE / BLOCKED |
| Source verification | INACTIVE |
| Entitlement Gate | IMPLEMENTED / GO |
| Internal Premium QA Resolver | IMPLEMENTED / GO |
| User-facing model selector | REMOVED / HIDDEN |
| Report Balance Architecture | IMPLEMENTED |
| Payment Activation | NOT IMPLEMENTED |
| Public Premium Activation | NOT IMPLEMENTED |

## Objective

NaLI now presents one public product action: create a report. Normal public screens no longer ask users to select Peregrine, Obsidian, or Zephyr, and they no longer present credit terminology as the monetization unit. Internal engine profiles remain available only for server routing and controlled QA.

The future public unit is **Laporan**. This sprint configures packages and deterministic balance rules without creating payment, purchase, subscription, or paid-balance state.

## Package Configuration

| Package | Prepared Price | Included Unit | Public Copy | Activation |
| --- | ---: | ---: | --- | --- |
| Basic | Rp15.000 | 5 | 5 laporan cepat | Inactive |
| Pro | Rp49.000 | 5 | 5 laporan lengkap | Inactive |
| Pro Bundle | Rp89.000 | 10 | 10 laporan lengkap | Inactive |

No package is connected to checkout or Midtrans in CP1.

## Balance Contract

- A safe default balance contains zero paid Basic or Pro reports and is not treated as verified.
- The explicit starter/free report path remains available under existing rate and integrity controls.
- A Basic or Pro generation request without a verified paid balance is blocked with a safe report-balance-required response.
- Regeneration from scratch is modeled to consume one report only after successful paid generation.
- Manual editing, copying, and downloading the same existing result do not consume a report.
- Server failure, integrity blocking, or rate-limit blocking do not consume a report.

The ledger vocabulary is prepared as typed server configuration:

- `purchase_basic`
- `purchase_pro`
- `purchase_pro_bundle`
- `consume_basic_report`
- `consume_pro_report`
- `refund_report`
- `generation_failed_no_charge`

No database balance migration is introduced in this sprint because payment activation and verified public purchase persistence remain intentionally inactive.

## Server Safety

- Public generation defaults to a neutral starter report path.
- Client-supplied hidden model or engine hints cannot unlock Basic, Pro, or internal premium routing.
- Requested paid report types remain blocked when no verified balance exists.
- The existing trusted internal QA entitlement remains server-only and may exercise internal premium engine paths for QA.
- Internal QA access does not activate payment, public premium access, upload, source verification, or public PDF/DOCX export.

## Public UX Result

- `/create-report` provides one primary action: `Buat Laporan`.
- Model selector pills and model tier explanations are absent from the public composer.
- Pricing uses `Laporan` package language and displays the configured package preparation prices.
- Empty-balance copy is ready: `Laporan kamu habis. Pilih paket untuk lanjut.`
- All package buttons remain inactive and state that payment and checkout are not active in CP1.
- Public PDF/DOCX export remains visibly locked; local Markdown/TXT copying or download remains available.

## Verification Record

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run check:i18n` | PASS, 398 keys matched |
| `npm run test:demo` | PASS, 5/5 tests |
| `node --test tests/reports/*.test.cjs` | PASS, 311/311 tests |

The report suite verifies package configuration, zero paid default balance, no-charge rules, neutral public starter routing, rejection of public hidden-engine attempts, entitlement compatibility, V8 internal renderer differentiation, locked public PDF/DOCX export, and mobile-source regressions.

Rendered mobile smoke QA also passed:

- `/create-report` at 360px and 430px rendered one accessible `Buat Laporan` control, readable inactive-package/starter copy, zero visible internal model or credit terms, zero checkout links, and no horizontal overflow.
- `/pricing` at 360px rendered the three prepared Laporan packages and three disabled `Belum aktif` controls, with payment/checkout inactive copy, zero internal model or credit terms, zero checkout links, and no horizontal overflow.

## Remaining Blockers

- Human Testing remains paused.
- Midtrans and checkout remain deferred/inactive.
- Paid launch and public premium activation remain disabled.
- Public PDF/DOCX export, upload API, and source verification remain inactive.
- Verified public purchase-backed balances and persistent ledger storage are intentionally not activated.

Founder manual testing is not required before agent verification.
