# Model Selector Verification Report

This document reports on the implementation, integrity safeguards, and verification tests for the NaLI CP1 Model Selector and processing profiles.

## 1. Locked Gate Status

All gateway parameters are preserved:
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Founder Monitoring**: GO
- **Mobile Composer Optimization**: CONDITIONAL GO
- **Rate Limit/Error UX**: GO
- **Report Quality Memory**: GO
- **Model Selector**: GO

---

## 2. What Changed

### Configuration & Types
- Created **`src/lib/models/naliModels.ts`** defining metadata, safe capabilities, and forbidden claims for `peregrine`, `obsidian`, and `zephyr`.
- Updated validation types in **`src/lib/reports/reportGenerator.ts`** to parse and default `selectedModel` inputs to `peregrine`.

### Prompt Customization
- Integrated profile guidelines inside `buildReportPrompt`:
  - **Peregrine**: Quick first drafts, structure, and conciseness.
  - **Obsidian**: Strict evidence boundaries, claims separation, and uncertainty warnings.
  - **Zephyr**: Safe personalization passes, flow refinement, and academic clarity.

### Backend Routing
- Updated **`/api/reports/generate`** route to resolve incoming model IDs, map them to public NaLI labels (e.g. `NaLI Obsidian`), and record the profile inside the generated report's `model_used` parameter.

### Frontend Composers
- Injected segmented model selector components inside **`CreateReportForm.tsx`** and **`AgentWorkspace.tsx`** directly below the main text area inputs.
- Implemented keyboard navigation, group classes, and 44px+ touch targets compatible with 360-430px mobile screen widths.

---

## 3. Verification Results

We verified these improvements using `tests/reports/model-selector-integrity.test.cjs`:

- **Test 1**: Exposes exactly `peregrine`, `obsidian`, and `zephyr` with safe specifications.
- **Test 2**: Defaults missing or invalid model choices to `peregrine` during API validation.
- **Test 3**: Prompts correctly append profile-specific system guidelines.
- **Test 4**: Forms render selector controls and pass selection state inside payloads.
- **Test 5**: Blacklisted academic cheating terms are absent from all model configs.
- **Test 6**: Safe area margins and mobile touch-target dimensions are preserved.

**Result**: `PASS` (6 of 6 tests passed successfully).

---

## 4. AI-Run Manual Smoke Tests

The AI agent executed simulated generations:
- **Peregrine**: Returned clean, structured, early drafts quickly.
- **Obsidian**: Fenced claims strictly inside the evidence table, outputting explicit warnings for unprovided files.
- **Zephyr**: Localized and adapted tone using academic refinement parameters without cheating/Turnitin evasion claims.
