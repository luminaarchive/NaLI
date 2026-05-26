# NaLI CP1 Premium Entitlement Audit Report

## Decision Status

| Area                         | Status                |
| ---------------------------- | --------------------- |
| Human Testing                | PAUSED                |
| Midtrans                     | DEFERRED              |
| Paid Launch                  | NO-GO                 |
| Public/user PDF/DOCX export  | LOCKED / INACTIVE     |
| Upload API                   | INACTIVE / BLOCKED    |
| Source verification          | INACTIVE              |
| Entitlement Gate             | IMPLEMENTED / GO      |
| Internal Premium QA Resolver | IMPLEMENTED / GO      |
| Premium Entitlement Audit    | IMPLEMENTED           |
| Payment Activation           | NOT IMPLEMENTED       |
| Public Premium Activation    | NOT IMPLEMENTED       |

Founder manual testing is not required before agent verification.

## Purpose

Obsidian and Zephyr are premium processing tiers that remain publicly locked in CP1. The internal QA resolver permits trusted server-side testing, so its allow and deny decisions now require a safe operational audit trail. This implementation records entitlement decisions for abuse monitoring without creating paid users, purchased credit, subscriptions, or public premium access.

## Implemented Contract

- Peregrine remains available as the default starter model and is not logged on ordinary access to avoid unnecessary audit noise.
- Obsidian and Zephyr remain locked publicly by default.
- Premium requests that reach entitlement validation are audited as `PREMIUM_ENTITLEMENT_ATTEMPT`.
- A valid internal QA unlock is logged as `allowed_internal_qa`, never as paid user access.
- An invalid credential attempt is logged as `denied_invalid_entitlement`.
- Missing trusted entitlement is logged as `denied_missing_entitlement`.
- Client-supplied premium claims are ignored for access and logged as `denied_public_premium_inactive`.

## Stored Safe Fields

The audit event stores only fixed operational fields:

| Field | Purpose |
| ----- | ------- |
| `timestamp` | Event time |
| `model_id` / `requested_tier` | Requested NaLI tier |
| `decision` | Safe entitlement outcome |
| `route_source` / `normalized_path` / `method` | Normalized request origin |
| `user_agent_class` / short `user_agent_hash` | Limited abuse correlation signal |
| `rate_status` / `integrity_status` | Already-evaluated guard state |

The audit writer never reads or stores entitlement token values, raw authorization headers, raw cookies, raw query strings, guest identifiers, or IP addresses.

## Founder Monitoring

The existing protected, noindex founder console now exposes only aggregated premium entitlement monitoring:

- count of missing entitlement denials;
- count of invalid entitlement denials;
- count of valid internal QA unlocks;
- count of rejected client/public premium claims;
- blocked attempts by Obsidian and Zephyr;
- last safe audit event timestamp.

Raw audit event metadata is not returned through the founder aggregation. URL-query founder credentials were removed; console authentication uses the existing server action and HTTP-only cookie path.

## Readiness Surface

Safe readiness now includes:

| Field | Value |
| ----- | ----- |
| `entitlementGate` | `enabled` |
| `internalPremiumQaResolver` | `configured` / `unconfigured` |
| `premiumEntitlementAudit` | `enabled` |
| `premiumModelsLockedByDefault` | `true` |
| `publicPremiumActivation` | `disabled` |
| `paymentActivation` | `disabled` |
| `midtrans` | `deferred_inactive` |
| `publicExport` | `locked_inactive` |

No internal entitlement grant material is returned in readiness data.

## QA Result

Automated coverage confirms:

- Obsidian and Zephyr requests without entitlement receive `403` and safe missing-entitlement audit events.
- Invalid trusted-header attempts receive `403` and invalid-entitlement audit events.
- Valid server-validated internal QA access proceeds through generation and records `allowed_internal_qa`.
- Fake body, browser-storage-like, and query claims cannot unlock premium and do not enter stored event fields.
- Audit storage failures neither unlock denied requests nor crash approved internal QA generation.
- Rate limiting and integrity policy still run before premium model access.
- Public export remains separately locked.
- Founder monitoring returns aggregate counts only.

## Remaining Blockers

- Public premium activation and payment activation are intentionally not implemented.
- Public/user PDF and DOCX export remains locked and inactive.
- Upload API and source verification remain inactive.
- Human Testing remains paused.
- V8 reference artifacts remain outside the repository in `/Users/macintosh/Downloads/NaLI-QA/`.
