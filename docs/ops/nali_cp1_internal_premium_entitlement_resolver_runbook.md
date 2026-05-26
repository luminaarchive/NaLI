# Operations Runbook: CP1 Internal Premium Entitlement Resolver

## Required State

| Control                      | Required state     |
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

Peregrine remains available as the starter model. Obsidian and Zephyr remain publicly locked by default. Founder manual testing is not required before agent verification.

## Resolver Operation

The resolver is server-only:

- `src/lib/system/founderAuthorization.ts` gives the resolver and monitoring utility a timing-safe founder credential check.
- `src/lib/entitlements/internalEntitlementResolver.ts` converts a validated founder QA request into model-only access.
- `/api/reports/generate` reads internal QA grant material only from the dedicated internal request header and only on the server.

An authorized internal QA caller may submit a premium model request with the trusted founder credential in the `x-nali-internal-premium-qa-token` request header. Never place that credential in a URL, query string, browser local storage, generated document, log message, screenshot, or committed file.

Do not send internal QA entitlement through the public model selector. The public selector intentionally remains locked for Obsidian and Zephyr.

## Allowed Scope

A validated internal QA decision permits only report generation routing to Obsidian or Zephyr. It must not be interpreted as:

- paid status, purchased credit, subscription state, or a public entitlement;
- permission to export PDF or DOCX for users;
- permission to initiate checkout, configure Midtrans, or accept payment results;
- permission to upload material or verify sources.

Rate limits, academic integrity checks, report output safety, and V8 model differentiation remain mandatory.

## Denial Contract

Without valid internal QA authority, premium generation remains safely denied:

```json
{
  "code": "MODEL_ENTITLEMENT_REQUIRED",
  "entitlement": {
    "allowed": false,
    "modelId": "obsidian",
    "entitlementStatus": "locked_by_default",
    "requiredEntitlement": "premium_model_entitlement_or_credit"
  },
  "internalPremiumQaStatus": "missing"
}
```

The safe status may be `unconfigured`, `missing`, or `invalid`. Do not return credential values, provider identifiers, balances, payment internals, or session material.

## Readiness Check

The safe `/api/system/readiness` surface may report:

```json
{
  "entitlementGate": "enabled",
  "internalPremiumQaResolver": "configured",
  "premiumModelsLockedByDefault": true,
  "peregrineAvailable": true,
  "publicPremiumActivation": "disabled",
  "paymentActivation": "disabled",
  "midtrans": "deferred_inactive",
  "publicExport": "locked_inactive"
}
```

`internalPremiumQaResolver` communicates configuration only. It must never reveal a credential, header value, user/session identifier, or grant.

## Verification

Run from `/Users/macintosh/Documents/NaLI`:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
npm run check:i18n
node --test tests/reports/internal-premium-entitlement-resolver.test.cjs tests/reports/model-entitlement-gate.test.cjs tests/reports/model-generation-routing.test.cjs
node --test tests/reports/*.test.cjs
```

For agent mobile smoke QA, inspect the public locked selector at 360px and 430px and confirm readable copy, at least 44px button targets, no horizontal overflow, and no checkout/payment activation.

## Commit Safety

- Do not stage `.env*`, credential material, access keys, report secrets, payment payloads, or unrelated scratch files.
- Leave V8 local artifacts in `/Users/macintosh/Downloads/NaLI-QA/`; they are evidence files outside the repository and are not committed.
- No environment configuration step in this runbook activates payment, public export, upload, or source verification.
