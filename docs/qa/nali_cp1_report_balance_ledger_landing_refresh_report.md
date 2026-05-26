# NaLI CP1 Report Balance Ledger Persistence + Minimal App-Shell Landing Refresh QA Report

## Current Status

| Control                           | State              |
| --------------------------------- | ------------------ |
| Human Testing                     | PAUSED             |
| Midtrans                          | DEFERRED           |
| Paid Launch                       | NO-GO              |
| Public/user PDF/DOCX export       | LOCKED / INACTIVE  |
| Upload API                        | INACTIVE / BLOCKED |
| Source verification               | INACTIVE           |
| Entitlement Gate                  | IMPLEMENTED / GO   |
| Internal Premium QA Resolver      | IMPLEMENTED / GO   |
| Single Report Product             | IMPLEMENTED / GO   |
| Report Balance Architecture       | IMPLEMENTED / GO   |
| Report Balance Ledger Persistence | IMPLEMENTED        |
| Minimal App-Shell Landing Refresh | IMPLEMENTED        |
| Payment Activation                | NOT IMPLEMENTED    |
| Public Premium Activation         | NOT IMPLEMENTED    |

## Summary

This sprint adds a real, additive persistence contract for future `Laporan tersisa` accounting while preserving zero
paid balance by default. It also replaces the heavy public homepage presentation with a compact NaLI-original launcher:
one clear `Buat Laporan` action, short evidence-honest copy, quick intent chips, inactive package visibility, and a
readable mobile footer.

No paid report generation, payment flow, checkout, export unlock, upload, or source verification is activated.

## Backend Ledger Implementation

`src/lib/billing/reportBalanceLedger.ts` supplies a server-safe API for:

- normalized guest, user, or internal ownership with safe identifiers only;
- safe zero lookup when a balance row is missing;
- zero-only balance row initialization;
- Basic or Pro consume eligibility checks;
- idempotent single-report consumption through a database RPC or deterministic test store;
- future-only purchase, refund/adjustment, and generation-failed-no-charge event recording;
- safe ledger summaries without raw metadata.

Metadata is allowlisted to short operational values. Authorization headers, cookies, query strings, prompt/report body
content, payment payloads, secret material, and client-supplied hidden engine names are not stored.

## Migration And Schema

Migration: `supabase/migrations/20260526174926_cp1_report_balance_ledger_persistence.sql`.

`report_balances` stores:

- UUID primary key, `owner_type`, `owner_id`;
- `basic_reports_remaining` and `pro_reports_remaining`, both nonnegative and zero by default;
- created and updated timestamps;
- unique ownership key and owner index.

`report_ledger_events` stores:

- UUID primary key and normalized ownership;
- constrained event/report/source types;
- amount, before/after balance, optional safe report/payment references, optional idempotency key;
- allowlisted JSON metadata and creation timestamp.

Indexes support owner history, report/payment lookup, event monitoring, and a partial unique owner plus idempotency-key
guard. Both tables use RLS and service-role-only policies. The `consume_report_balance` function executes as the caller,
is callable only by the service role, and performs decrement plus ledger insert in one database transaction.

The staged hook configuration excludes `.sql` from the default Prettier pass because the repository has no SQL parser;
the migration is instead protected by focused schema tests and whitespace checking.

## Consumption Policy

| Operation                                            | Prepared Balance Effect                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| New successful paid generation, once activated later | Consume 1 report                                    |
| Paid regenerate from scratch, once activated later   | Consume 1 report                                    |
| Manual edit of an existing result                    | Consume 0                                           |
| Copy/download the same existing result               | Consume 0                                           |
| Integrity or rate-limit block                        | Consume 0                                           |
| Server generation failure                            | Consume 0; may record `generation_failed_no_charge` |
| Internal premium QA exercise                         | Not a paid purchase or public paid consume          |

The public report route remains starter/free. If a client requests a Basic or Pro intent without server-known balance,
it receives a safe `REPORT_BALANCE_REQUIRED` error. Even with a prepared positive persisted balance, public paid
generation remains blocked as `PUBLIC_PAID_GENERATION_INACTIVE` until explicitly activated in a future sprint.

## Landing And App-Shell Refresh

- `/` is a simpler, static task launcher with the headline `Mau bikin laporan apa?`, a large launcher card, and
  quick actions for observations, practicum, KKN, and evidence boundaries.
- The page uses a compact status strip stating that payment, upload, and source verification are not active.
- A shared public shell introduces restrained navigation and a small, truth-preserving footer.
- `/pricing` now uses the shell and displays Basic, Pro, and Pro Bundle as inactive `Laporan` preparation only.
- `/create-report` retains its validated one-report workflow and starter/free messaging; its header gains small links
  to pricing and guidance without exposing internal routing profiles.
- The former heavy homepage video/product showcase composition is no longer mounted by the homepage.

NaLI does not copy another product's branding or layout. It applies only the general minimal task-launcher principle in
NaLI's own evidence-aware Indonesian product language.

## Security Constraints Preserved

- Public UI contains no selectable internal model tiers.
- Client-supplied package, balance, hidden engine, or hidden model cannot activate paid/pro output.
- Internal QA remains separately authorized server-side and does not represent paid access.
- Readiness reports only prepared/disabled status and safe table count readiness, never records or credentials.
- No fake balance, purchase, subscription, source verification, evidence, citation, or social proof is introduced.

## Verification

| Check                                  | Result                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `npm run lint`                         | PASS                                                                         |
| `npm run typecheck`                    | PASS                                                                         |
| `npm run build`                        | PASS; Next emitted its existing edge-runtime static-generation advisory only |
| `npm run check:i18n`                   | PASS, 398 keys matched                                                       |
| `npm run test:demo`                    | PASS, 5/5 tests                                                              |
| Focused new ledger/app-shell tests     | PASS, 6/6 tests                                                              |
| `node --test tests/reports/*.test.cjs` | PASS, 317/317 tests                                                          |

## Mobile QA

Rendered smoke output was stored outside the repository under `/tmp/nali-qa/`.

| Route            | Width | Result                                                                       |
| ---------------- | ----: | ---------------------------------------------------------------------------- |
| `/`              | 360px | PASS: readable stacked launcher, no overflow, key targets at least 44px      |
| `/`              | 430px | PASS: readable launcher/chips/footer, no overflow, key targets at least 44px |
| `/create-report` | 360px | PASS: starter copy readable, no selector/checkout/balance leak, no overflow  |
| `/create-report` | 430px | PASS: starter copy readable, no selector/checkout/balance leak, no overflow  |
| `/pricing`       | 360px | PASS: inactive package cards/actions readable, no overflow                   |
| `/pricing`       | 430px | PASS: inactive package cards/actions readable, no overflow                   |

Every rendered case showed no internal model label, no credit wording, no fake positive balance, and no checkout/Midtrans
link. Founder manual testing is not required before agent verification.

## Remaining Blockers

- Live payment and checkout remain unavailable.
- No verified payment-backed report top-up exists.
- Public PDF/DOCX export remains locked.
- Upload API and source verification remain inactive.
- Human testing remains paused.
