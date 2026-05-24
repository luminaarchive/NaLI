# NaLI CP1 Rate Limit & Error UX v2 Hardening — QA Report

**Date**: 2026-05-24
**Sprint**: CP1 Sprint 0.7 Hardening Pass
**Build**: Rate Limit & Error UX v2 (Actions, Focus Recovery, and Countdown Badges)

---

## Status Summary

| Area | Status |
|------|--------|
| Human Testing | **PAUSED** |
| Midtrans | **DEFERRED** |
| Paid Launch | **NO-GO** |
| Founder Monitoring | **GO** |
| Rate Limit & Error UX v2 | **GO** |

---

## Improvements & Hardening Implemented

### 1. Countdown Badge & Visual Clarity (`NaliAlert.tsx`)
- Added `retryAfterSeconds` property to `NaliAlertProps`.
- Rendered a glowing/pulsing amber countdown badge next to the title when `retryAfterSeconds > 0`.
- Ensured a polished, premium aesthetic that updates dynamically.

### 2. Submit Button Disabling
- In both `CreateReportForm.tsx` and `AgentWorkspace.tsx`, disabled the submit/send buttons when a rate limit countdown is active (`retryAfterSeconds > 0`).
- Prevents users from spamming requests while blocked.

### 3. Composer Disable States
- In `AgentWorkspace.tsx`, disabled the input `<textarea>` during rate limiting and changed the placeholder text to inform the user: `"Batas percobaan tercapai. Silakan tunggu..."`.

### 4. Inline Action Buttons on Error Alerts
- Added primary action buttons inside error `NaliAlert` components based on the error category:
  - **RATE_LIMIT** (when countdown expires): shows `"Coba Lagi"` to resubmit form/message.
  - **NETWORK_OR_SERVER**: shows `"Coba Lagi"` immediately.
  - **INTEGRITY_BLOCK**: shows `"Ubah Materi"`, which clears the error and refocuses the main text editor.
  - **WEAK_INPUT**: shows `"Tambah Detail"`, which clears the error and refocuses the main text editor.

### 5. Input Safety and Recovery
- Integrated a `lastAttemptedQuery` state in `AgentWorkspace.tsx` to preserve user queries during follow-ups if an error occurs, allowing the `"Coba Lagi"` action to correctly retry the message.

---

## Verification Results

- **Unit Tests (`rate-limit-error-ux.test.cjs`)**: ✅ PASS (Verifies `retryAfterSeconds` support and countdown badge presence).
- **Demo Tests (`test:demo`)**: ✅ PASS.
- **Linting (`eslint`)**: ✅ PASS (0 errors, 0 warnings).
- **TypeScript (`typecheck`)**: ✅ PASS (No compilation errors).
- **Production Build (`build`)**: ✅ PASS.

---

## Compliance Check

- [x] Human Testing remains paused.
- [x] Midtrans integration remains deferred.
- [x] No credit card or active payment claims made.
- [x] No provider/model names leaked.
- [x] Visual Lock preserved.
