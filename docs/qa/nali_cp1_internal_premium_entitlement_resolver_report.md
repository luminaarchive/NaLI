# NaLI CP1 Internal Premium Entitlement Resolver Report

## Decision Status

| Area                         | Status             |
| ---------------------------- | ------------------ |
| Human Testing                | PAUSED             |
| Midtrans                     | DEFERRED           |
| Paid Launch                  | NO-GO              |
| Public/user PDF/DOCX export  | LOCKED / INACTIVE  |
| Upload API                   | INACTIVE / BLOCKED |
| Source verification          | INACTIVE           |
| Entitlement Gate             | IMPLEMENTED / GO   |
| Internal Premium QA Resolver | IMPLEMENTED        |
| Payment Activation           | NOT IMPLEMENTED    |
| Public Premium Activation    | NOT IMPLEMENTED    |

Founder manual testing is not required before agent verification.

## Purpose

The V8 differentiation ladder requires controlled internal access to inspect Obsidian and Zephyr while public premium access remains closed. This change permits internal QA model generation only after a trusted server-side founder entitlement is validated. It is not payment state, credit balance, subscription state, or a public premium unlock.

## Implemented Contract

- Peregrine remains allowed by default for public starter generation.
- Obsidian and Zephyr remain locked by default and continue returning `403 MODEL_ENTITLEMENT_REQUIRED` without a trusted internal QA decision.
- The internal resolver reuses the existing server-side founder authorization credential and accepts it only through an internal request header consumed by `/api/reports/generate`.
- The resolver never reads premium authority from request bodies, query parameters, browser storage, selector state, or generated report content.
- A valid resolver decision grants model access only; generation still passes through rate limiting, integrity enforcement, output safety, and existing persistence rules.

## Safe Result States

For a premium request that is denied, the API can report only a non-secret internal QA status:

| State               | Meaning                                                       |
| ------------------- | ------------------------------------------------------------- |
| `unconfigured`      | No trusted founder QA credential is configured server-side.   |
| `missing`           | Resolver is configured, but no internal QA header was sent.   |
| `invalid`           | An internal QA header was sent but did not validate.          |
| `valid_internal_qa` | Used internally to permit model access; no token is returned. |

No status implies a payment, credit, subscription, or public entitlement.

## Inactive Features Preserved

Internal QA entitlement does not:

- activate Midtrans, checkout, payment success handling, or paid launch;
- unlock public/user PDF or DOCX export;
- activate uploads or source verification;
- create a paid user, balance, subscription, or public model access control;
- expose grant values in readiness responses, public UI, report output, or API errors.

## Readiness Surface

The safe readiness response includes:

| Field                          | Value                         |
| ------------------------------ | ----------------------------- |
| `entitlementGate`              | `enabled`                     |
| `internalPremiumQaResolver`    | `configured` / `unconfigured` |
| `premiumModelsLockedByDefault` | `true`                        |
| `peregrineAvailable`           | `true`                        |
| `publicPremiumActivation`      | `disabled`                    |
| `paymentActivation`            | `disabled`                    |
| `midtrans`                     | `deferred_inactive`           |
| `publicExport`                 | `locked_inactive`             |

This surface reports configuration readiness only and returns no credential value or grant material.

## QA Coverage

Automated coverage verifies that:

- Peregrine remains available without entitlement.
- Obsidian and Zephyr fail closed with missing or invalid internal QA access.
- Only a correctly validated server-side founder QA header admits premium model generation.
- Body, query, and local-storage-like client payload claims do not unlock premium processing.
- A valid internal QA entitlement cannot bypass integrity checking or public export locks.
- Public model selectors remain disabled for premium tiers; V8 tier differentiation stays intact.
- Readiness reports configuration status without leaking tokens or claiming payment activation.

## Remaining Blockers

- Public premium activation and payment remain intentionally unimplemented.
- Public PDF/DOCX export, upload API, and source verification remain inactive.
- Human Testing remains paused.
- V8 document artifacts remain external at `/Users/macintosh/Downloads/NaLI-QA/` and must not be committed.
