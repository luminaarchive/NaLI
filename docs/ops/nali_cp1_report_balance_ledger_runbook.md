# NaLI CP1 Report Balance Ledger Persistence Runbook

## Operational State

| Control                           | Required State     |
| --------------------------------- | ------------------ |
| Human Testing                     | PAUSED             |
| Midtrans                          | DEFERRED           |
| Paid Launch                       | NO-GO              |
| Public/user PDF/DOCX export       | LOCKED / INACTIVE  |
| Upload API                        | INACTIVE / BLOCKED |
| Source verification               | INACTIVE           |
| Single Report Product             | IMPLEMENTED / GO   |
| Report Balance Architecture       | IMPLEMENTED / GO   |
| Report Balance Ledger Persistence | IMPLEMENTED        |
| Payment Activation                | NOT IMPLEMENTED    |
| Public Premium Activation         | NOT IMPLEMENTED    |

## Purpose

`report_balances` is the future server-owned snapshot of remaining Basic and Pro reports. A missing row or database
failure means zero usable paid reports, never an implicit grant.

`report_ledger_events` is the append-only operational trail for purchases, consumption, refunds, no-charge failures,
and explicitly internal adjustments or test seeds. It prepares accounting without creating a live payment path.

## Owner Model

| Owner Type | Intended Use                     | Identifier Rule                                      |
| ---------- | -------------------------------- | ---------------------------------------------------- |
| `guest`    | Existing CP1 guest/session flow  | Existing server-hashed guest session identifier only |
| `user`     | Future authenticated owner       | Valid server-resolved UUID only                      |
| `internal` | Controlled operational/test path | Safe internal identifier only                        |

Never store raw cookies, raw access values, authorization headers, internal QA tokens, or founder tokens as owner IDs.

## Storage Contract

- Rows initialize with `basic_reports_remaining = 0` and `pro_reports_remaining = 0`.
- Amount convention: consumption events store `-1`; no-charge events store `0`.
- Supported paid consumption report types are only `basic` and `pro`.
- A partial unique index on `(owner_type, owner_id, idempotency_key)` prevents repeated logical events.
- RLS permits writes only through privileged server/service-role execution.
- The atomic `consume_report_balance` database function locks the balance row, rejects duplicate idempotency keys,
  decrements one unit only when available, and inserts its matching ledger event in the same transaction.

## Consumption Rules

| Trigger                                        |       Consume? | Ledger Guidance                                |
| ---------------------------------------------- | -------------: | ---------------------------------------------- |
| Future successful new paid generation          |              1 | `consume_basic_report` or `consume_pro_report` |
| Future successful paid regenerate from scratch |              1 | New unique idempotency key                     |
| Manual edit                                    |              0 | Do not call consume                            |
| Copy/download existing output                  |              0 | Do not call consume                            |
| Generation server failure                      |              0 | Optional `generation_failed_no_charge`         |
| Integrity or rate-limit block                  |              0 | Never consume                                  |
| Client submits engine/model/package hints      |              0 | Reject/ignore; never consume                   |
| Trusted internal QA premium generation         | 0 paid reports | Do not record as a purchase                    |

The current public API remains starter/free and does not consume paid balances. A positive row is readiness data only
until a separate, authorized public paid-generation activation sprint.

## Metadata Safety

Only short allowlisted operational flags may be stored, such as safe route, report type, package ID, boolean internal QA
marker, or outcome enum. Never store:

- raw request body, report text, prompt, field observation text, or uploads;
- raw query strings, cookies, authorization headers, guest access material, or entitlement tokens;
- provider/payment secret keys or full payment provider payloads;
- client-supplied internal model or engine names.

## Future Payment Webhook Integration

Midtrans is deferred and inactive. When payment activation is separately authorized, the webhook handler must first
validate the server-side payment truth under the existing conservative payment rules, then add one idempotent purchase
event and increment the correct balance exactly once. Do not grant reports from browser redirects or client claims.

## Future Refund Or Admin Adjustment

- Refunds and adjustments are privileged server operations only.
- Each mutation must have a unique idempotency key, safe reason enum, and matching balance mutation.
- `admin_adjustment_internal` is not a public purchase and must never be presented as payment success.
- Test seeds are limited to deterministic testing or an explicitly controlled internal environment.

## Troubleshooting A Balance Mismatch

1. Confirm public payment and paid generation have not been activated unexpectedly.
2. Query safe ledger events for the normalized server-owned owner only through protected operations.
3. Match each consume event to its idempotency key and balance before/after values.
4. Check whether a failure was correctly recorded as no-charge.
5. Do not repair balance from client screenshots, raw cookies, or browser-provided claims.
6. Use a documented privileged adjustment only after identifying the ledger discrepancy.

## Before Paid Launch

- Apply and verify the migration in the intended database environment.
- Add a reviewed payment-backed top-up transaction with webhook idempotency.
- Establish authenticated/guest ownership lifecycle and access controls.
- Exercise race, retry, refund, and generation-failure scenarios.
- Keep public PDF/DOCX export locked until separately authorized and payment truth is verified.

Founder manual testing is not required before agent verification.
