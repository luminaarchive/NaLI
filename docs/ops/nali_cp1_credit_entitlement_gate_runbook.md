# Operations Runbook: CP1 Credit Entitlement Gate

## Operational State

| Control                     | Required state     |
| --------------------------- | ------------------ |
| Human Testing               | PAUSED             |
| Midtrans                    | DEFERRED           |
| Paid Launch                 | NO-GO              |
| Public/user PDF/DOCX export | LOCKED / INACTIVE  |
| Upload API                  | INACTIVE / BLOCKED |
| Source verification         | INACTIVE           |
| Entitlement Gate            | IMPLEMENTED        |
| Payment Activation          | NOT IMPLEMENTED    |

Peregrine remains the available starter model. Obsidian and Zephyr must remain locked by default unless a future trusted server-side entitlement or premium-credit resolver explicitly grants access. Founder manual testing is not required before agent verification.

## Runtime Contract

The model access contract lives in `src/lib/entitlements/modelEntitlements.ts`.

- Call `evaluateModelEntitlement(modelId)` with no trusted access context for current CP1 behavior.
- Treat `verifiedPremiumEntitlement` and `verifiedPremiumCredit` as server-only future integration inputs.
- Never populate trusted access inputs from request body fields, browser storage, UI state, automatically seeded trial credits, or payment intent state.
- Never return balances, tokens, payment references, provider details, or secrets in a model lock response.

The report generation route must reject locked premium model requests before provider generation or balance consumption proceeds:

```json
{
  "code": "MODEL_ENTITLEMENT_REQUIRED",
  "entitlement": {
    "allowed": false,
    "modelId": "obsidian",
    "requiredEntitlement": "premium_model_entitlement_or_credit",
    "entitlementStatus": "locked_by_default"
  }
}
```

The exact safe `reason` and user-facing error may also be present. Do not add payment activation instructions or purchase links to this response.

## UI Checks

At both model selectors:

- Peregrine is selectable and initially selected.
- Obsidian and Zephyr show a lock icon and disabled button state.
- The lock explanation says premium access is not active and checkout/payment is not enabled in CP1.
- Each model button keeps a minimum 44px touch target.
- A restored legacy selection for a premium model cannot submit a report; the server still enforces the lock.

Mobile smoke widths for agent verification are 360px and 430px. Confirm wrapping remains readable and the locked explanation does not overlap the composer or submit control.

## Readiness Check

The safe readiness endpoint is `/api/system/readiness`. For this gate confirm only non-secret state values:

```json
{
  "entitlementGate": "enabled",
  "premiumModelsLockedByDefault": true,
  "peregrineAvailable": true,
  "paymentActivation": "disabled",
  "midtrans": "deferred_inactive",
  "publicExport": "locked_inactive"
}
```

Do not inspect, print, or store environment values, guest session identifiers, access keys, hashes, or payment secrets during this check.

## Verification

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
npm run check:i18n
node --test tests/reports/model-entitlement-gate.test.cjs tests/reports/model-generation-routing.test.cjs tests/reports/model-selector-integrity.test.cjs
node --test tests/reports/*.test.cjs
```

Also complete a local mobile-oriented visual smoke check at 360px and 430px for the model selector locked states. This is agent QA and does not change the Human Testing status.

## Artifact And Commit Safety

- Leave V8 outputs in `/Users/macintosh/Downloads/NaLI-QA/`; never stage HTML, Markdown, text, PDF, or DOCX QA artifacts.
- Do not stage `.env*`, access values, guest session values, tokens, payment payloads, or unrelated scratch files.
- This gate must not configure Midtrans, activate checkout, enable paid launch, unlock PDF/DOCX export, enable upload, or enable source verification.
