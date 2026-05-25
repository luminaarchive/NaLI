# NaLI CP1 Credit Entitlement Gate Report

## Decision Status

| Area                        | Status             |
| --------------------------- | ------------------ |
| Human Testing               | PAUSED             |
| Midtrans                    | DEFERRED           |
| Paid Launch                 | NO-GO              |
| Public/user PDF/DOCX export | LOCKED / INACTIVE  |
| Upload API                  | INACTIVE / BLOCKED |
| Source verification         | INACTIVE           |
| Entitlement Gate            | IMPLEMENTED        |
| Payment Activation          | NOT IMPLEMENTED    |

Founder manual testing is not required before agent verification for this gate.

## Purpose

V8 establishes real product differences between the starter, audit, and premium journal outputs. This CP1 gate prevents that differentiation from being bypassed by sending an Obsidian or Zephyr model identifier directly to the report API before premium access is enabled.

## Implemented Contract

`src/lib/entitlements/modelEntitlements.ts` is the deterministic source of truth for initial model access:

| Model     | Default CP1 access | Required access when locked                    |
| --------- | ------------------ | ---------------------------------------------- |
| Peregrine | Allowed            | None                                           |
| Obsidian  | Locked             | Verified premium entitlement or premium credit |
| Zephyr    | Locked             | Verified premium entitlement or premium credit |

The result shape contains `allowed`, `modelId`, `reason`, `requiredEntitlement`, and `entitlementStatus`. The utility supports a future trusted server-side entitlement or credit decision, but client payloads are not an entitlement source.

## Security Behavior

- `/api/reports/generate` checks the normalized requested model before cost checks or generation work.
- An unentitled direct request for Obsidian or Zephyr returns `403` with `MODEL_ENTITLEMENT_REQUIRED` and safe entitlement metadata.
- The rejection does not return provider details, secrets, internal tokens, payment internals, or a fabricated balance.
- Existing trial NaLI Energy seeding is not treated as premium entitlement. This prevents a starter trial credit from silently unlocking premium model execution.
- Peregrine remains available as the starter model and continues through existing integrity and rate-limit protection.

## UI Behavior

- Peregrine remains the selected starter option.
- Obsidian and Zephyr remain visible for tier comprehension but are disabled and visibly locked without entitlement.
- Both model selectors state that premium access is not active and checkout/payment is not enabled in CP1.
- The disabled premium buttons retain `min-h-[44px]` mobile touch sizing and cannot initiate generation.
- A stale/restored premium selection is also stopped by a client submission check, with the server guard remaining authoritative.

## Readiness Surface

The safe system readiness response now reports:

| Field                          | Value               |
| ------------------------------ | ------------------- |
| `entitlementGate`              | `enabled`           |
| `premiumModelsLockedByDefault` | `true`              |
| `peregrineAvailable`           | `true`              |
| `paymentActivation`            | `disabled`          |
| `midtrans`                     | `deferred_inactive` |
| `publicExport`                 | `locked_inactive`   |

No environment values or secrets are added to the response.

## Regression Coverage

Automated coverage verifies:

- Peregrine is allowed by default.
- Obsidian and Zephyr are denied by default and permit only an explicitly trusted future grant in the deterministic contract.
- A direct API model-selection bypass attempt is rejected server-side.
- Selector configuration marks premium tiers locked and client components render disabled controls with inactive-payment copy.
- Readiness exposes the entitlement gate and inactive payment/export states.
- V8 model output differentiation remains intact, including starter ceilings, audit-only content, premium editorial content, visual tier differences, and external artifact placement.

## Remaining Blockers

- No trusted production entitlement or premium-credit resolver is activated in CP1; therefore Obsidian and Zephyr remain locked by default.
- Human Testing remains paused.
- Payment activation, public document export, upload, and source verification remain inactive.
- V8 QA artifacts remain local in `/Users/macintosh/Downloads/NaLI-QA/` and are not part of this commit.
