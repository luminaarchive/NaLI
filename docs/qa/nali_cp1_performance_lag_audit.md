# NaLI CP1 Performance & Lag Audit

This document audits the suspected rendering and visual performance hotspots in NaLI CP1 (Sprint 0.7) and describes the optimization fixes applied.

---

## Suspected Performance Hotspots & Applied Fixes

### 1. Animated Glow Blobs Layer Overload on Mobile
* **Files**:
  - [CodexMagicBackground.tsx](file:///Users/macintosh/Documents/NaLI/src/components/ui/CodexMagicBackground.tsx)
  - [FluidVideoBackground.tsx](file:///Users/macintosh/Documents/NaLI/src/components/ui/FluidVideoBackground.tsx)
* **Suspended Cause**: These background wrappers render 4 to 5 large overlapping blur elements with active GPU-accelerated transform, rotate, and breathing keyframe animations. On mobile browsers (such as iOS Safari or mobile Chrome), animating large layers with heavy backdrop blur filters and high opacity results in high compositor overhead, causing frame drops (jank) and laggy text input typing.
* **Severity**: **P1**
* **Applied Fix**:
  - Hided all secondary animated blobs on screen widths smaller than 768px (using Tailwind's `hidden md:block` responsive class).
  - Scaled down the size of the primary bottom bloom element on mobile to restrict the active drawing area.
  - Keeps the desktop visual fidelity 100% intact while drastically lowering mobile rendering pressure.

### 2. Plain Render Function Re-creation and Missing Dependencies
* **Files**:
  - [CreateReportForm.tsx](file:///Users/macintosh/Documents/NaLI/src/components/report/CreateReportForm.tsx)
* **Suspended Cause**: The `loadSnapshots` helper read `localStorage` using `listGuestReportRecoveries()` but was defined as a plain arrow function recreated on every single render cycle. It was invoked inside the debounced autosave timeout (which runs 2 seconds after typing ceases) without being specified as an effect dependency. This could lead to stale closure bugs or unnecessary re-running of timer setups.
* **Severity**: **P2**
* **Applied Fix**:
  - Wrapped `loadSnapshots` in `useCallback` to memoize the function instance.
  - Added `loadSnapshots` to the dependency arrays of the mount effect and the debounced autosave effect in `CreateReportForm.tsx`.

---

## Static Audit Summary & Operational Safeguards

* **localStorage calls in Render Body**: All `localStorage` read/write calls are contained within client-side callback functions (e.g. form handlers) or memoized effects. No direct raw `localStorage` calls are placed inside the active render body.
* **Console logs**: Verified that no raw `console.log` debug spams are present in production client-side components.
* **Cleanups**: Checked that all countdown `setInterval` and autosave `setTimeout` instances correctly return their respective `clearInterval` and `clearTimeout` cleanup handlers.
* **No public links to /founder**: Checked both `SiteNav.tsx` and `CodexNav.tsx` to verify that no navigation link references the private `/founder` portal.
* **Midtrans/Payments status**: Verified that all payment-related configurations remain deferred and inactive.
