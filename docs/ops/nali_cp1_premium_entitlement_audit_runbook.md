# Operations Runbook: CP1 Premium Entitlement Audit Monitoring

## Required State

| Control                      | Required state        |
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

Peregrine remains available as the starter/default model. Obsidian and Zephyr remain publicly locked unless a trusted server-side internal QA entitlement is validated. Founder manual testing is not required before agent verification.

## Event Flow

For a validated premium model request to `/api/reports/generate`:

1. Rate limiting and integrity enforcement run first.
2. The internal premium QA resolver evaluates only trusted server-side authorization.
3. The audit writer records a fixed-field entitlement decision in `report_events`.
4. A denied decision returns `403 MODEL_ENTITLEMENT_REQUIRED`.
5. A valid internal QA decision permits only the existing generation path.

Audit insertion failure is non-fatal for generation but cannot change an access decision. A missing or invalid entitlement remains denied even if audit persistence fails.

## Allowed Decisions

| Decision | Meaning |
| -------- | ------- |
| `denied_missing_entitlement` | No trusted internal QA entitlement reached the resolver. |
| `denied_invalid_entitlement` | Trusted-header material was present but invalid. |
| `denied_public_premium_inactive` | Client-shaped premium claims were submitted; public premium remains inactive. |
| `allowed_internal_qa` | Server-validated internal QA model access only. |

`allowed_internal_qa` is not payment, a purchased balance, subscription status, or public premium activation.

## Secret Safety

Audit handling must never store, print, return, snapshot, or document:

- internal entitlement token values;
- raw authorization headers or cookies;
- raw query strings or URL grant material;
- service-role keys or provider credentials;
- guest/report access identifiers.

The audit model records a normalized path and a short user-agent hash/classification only. IP address data is omitted.

## Founder Visibility

The founder console remains protected and `noindex`. It shows only aggregate counts and the last safe event timestamp for premium entitlement attempts. It must not add public navigation or expose raw event rows. Founder login credentials must be submitted through the protected form route and must never be put in URLs.

## Database Support

Apply the additive CP1 migration that adds `PREMIUM_ENTITLEMENT_ATTEMPT` to the existing service-role-only `report_events` event constraint:

```text
supabase/migrations/20260526090000_cp1_premium_entitlement_audit.sql
```

This migration does not activate Midtrans, checkout, exports, upload, source verification, or public premium access.

## Readiness Check

`/api/system/readiness` may report only the safe entitlement/audit state:

```json
{
  "entitlementGate": "enabled",
  "internalPremiumQaResolver": "configured",
  "premiumEntitlementAudit": "enabled",
  "premiumModelsLockedByDefault": true,
  "publicPremiumActivation": "disabled",
  "paymentActivation": "disabled",
  "midtrans": "deferred_inactive",
  "publicExport": "locked_inactive"
}
```

## Agent Verification

Run from `/Users/macintosh/Documents/NaLI`:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
npm run check:i18n
node --test tests/reports/premium-entitlement-audit.test.cjs tests/reports/internal-premium-entitlement-resolver.test.cjs tests/reports/founder-monitoring.test.cjs
node --test tests/reports/*.test.cjs
```

Perform agent-driven static/mobile smoke QA on `/create-report` at 360px and 430px: confirm readable locked copy, 44px-or-larger premium selector controls, no horizontal overflow, and no payment/checkout CTA. Confirm `/founder` remains internal/noindex and a query parameter cannot authorize it.

## Commit Safety

- Do not stage `.env*`, credential material, tokens, report access secrets, or unrelated scratch files.
- Leave V8 artifacts in `/Users/macintosh/Downloads/NaLI-QA/` and do not commit them.
- No step in this runbook activates payment or any deferred CP1 feature.
