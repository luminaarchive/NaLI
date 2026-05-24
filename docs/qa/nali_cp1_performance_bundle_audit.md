# NaLI CP1 Route-Level Bundle & Lazy Loading Audit

This document audits the route-level client-side bundle boundaries and component loading overhead for NaLI CP1 (Sprint 0.7).

---

## 1. Route Chunk Analysis (Baseline)

* **Public Routes**:
  - `/` (prerendered as static HTML, client footprint < 80kB first load JS).
  - `/learn-report` (server component container with static SEO layout, client footprint ~85kB first load JS).
  - `/pricing` (server component container with static SEO layout, client footprint ~85kB first load JS).
  - `/field-intelligence` (server component container with static SEO layout, client footprint ~85kB first load JS).
* **Workspace Route**:
  - `/create-report` (dynamic page containing `AgentWorkspace.tsx`, first load JS is ~140kB).
* **Private Admin Route**:
  - `/founder` (dynamic page containing monitoring modules, first load JS is ~150kB).

---

## 2. Suspected Bundle & Render Hotspots

1. **Eager Component Mounting**:
   - Component: `UpgradeModal.tsx` in `AgentWorkspace.tsx`.
   - Issue: The `UpgradeModal` component was mounted eagerly during the initial render block of `AgentWorkspace.tsx` even though `isUpgradeOpen` is false by default. This added unnecessary DOM nodes and component tracking overhead on page load.
2. **Re-rendering Child Panel**:
   - Component: `LocalHistoryPanel` in both `AgentWorkspace.tsx` and `CreateReportForm.tsx`.
   - Issue: The history panel was re-rendered on every parent component render (such as every keystroke entered in the composer input area) because event handler callbacks passed from the parent were recreated on every render cycle.
3. **Module Isolation**:
   - Check if founder-only statistics and telemetry libraries leak into public routes.

---

## 3. Bundle & Render Optimizations Applied

* **Conditional Mounting for Modals**:
   - Wrapped `UpgradeModal` in a conditional expression `{isUpgradeOpen && <UpgradeModal ... />}`. The modal is now mounted only on-demand when the user activates it.
* **Component Memoization (`React.memo`)**:
   - Memoized the `LocalHistoryPanel` in both `CreateReportForm.tsx` and `AgentWorkspace.tsx` using `React.memo` to skip re-renders if its properties (snapshots list and handlers) do not change.
* **Stable Event Handlers (`useCallback`)**:
   - Memoized `handleRestoreSnapshot`, `handleRenameSnapshot`, `handleDeleteSnapshot`, and `handleClearAllSnapshots` using `useCallback`.
   - Used a `useRef` tracker (`formRef` and `queryRef`) for form/query states so that these event callbacks maintain stable references and do not get re-created when typing.

---

## 4. Recommendations for Future Sprints

1. **Lazy Loading Code Splitting**:
   - Use Next.js dynamic imports (`next/dynamic`) to lazy load the `/report` markdown rendering libraries if they expand in CP2.
2. **Deferred State Initialisation**:
   - Keep localStorage reads sandboxed inside `useEffect` to ensure optimal page hydration speeds.
