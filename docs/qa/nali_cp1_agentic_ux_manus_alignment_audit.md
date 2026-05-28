# NaLI CP1 Agentic UX / Manus-like Product Feel Alignment Audit

This audit evaluates the current user experience of the NaLI platform against a modern agentic AI workspace (inspired by Manus) while preserving the core Nature & Evidence Intelligence OS identity, Indonesia-first messaging, and strict CP1 safety constraints.

---

## 1. Route Audit and Checklist

### 1.1. Home `/`
* **Status**: Static landing page with a prompt text area.
* **Purpose**: Launcher for report generation.
* **CTAs**: "Mulai Susun Laporan".
* **Gaps**:
  * Hero feels a bit static and not fully prompt-first.
  * Task chips (shortcutChips) are generic ecological search queries instead of actionable task shortcuts.
  * Missing a clear visual representation of the agent's work plan.
  * Dead attachment trigger lacks clear explanation.
* **CP1 Safety Verification**:
  * Displays "CP1: pembayaran belum aktif", "Upload belum aktif", "Source verification belum aktif".
  * No premium model selectors or fake credits visible.

### 1.2. Workspace `/create-report`
* **Status**: Form-based report generation.
* **Purpose**: Core report building and chat interface.
* **CTAs**: "Mulai Susun Laporan" / "Kirim" / Action chips.
* **Gaps**:
  * Lacks action chips near the composer for refining or directing the agent (e.g. adding location, checking gaps).
  * No live agent planning process timeline visible (simulated steps are basic list format).
  * Missing evidence quality panel / missing evidence indicator in the core workspace layout.
  * Local/autosave history shows skeletons or empty lists without interactive instructions.
* **CP1 Safety Verification**:
  * No model selector visible.
  * Enforces academic integrity consent.
  * Prevents direct premium model generation bypass.

### 1.3. Field Notes `/field-notes`
* **Status**: List of observations.
* **Purpose**: Documenting and analyzing field observations.
* **CTAs**: "Catatan Baru", "Analisis dengan NaLI".
* **Gaps**:
  * Uses infinite skeleton loaders when unauthenticated or database env is missing.
  * Guest mode is unable to save notes (returns 401 on POST `/api/field-notes`).
  * Lacks clear explanation that guest notes are local-only on the active browser.
* **CP1 Safety Verification**:
  * No fake cloud sync claims.

### 1.4. Pricing `/pricing`
* **Status**: Static monthly subscriptions (Seeds, Sapling, Forest Keeper).
* **Purpose**: Monetization pricing information.
* **CTAs**: "Mulai Gratis" (Active), "Belum dapat dibeli" (Disabled).
* **Gaps**:
  * Shows subscription tiers instead of the single report packages (`Basic`, `Pro`, `Pro Bundle`) defined in `REPORT_PACKAGES` and the backend ledger.
  * Missing interest capture CTA ("Saya ingin diberi kabar").
  * Needs clearer copywriting explaining that paid options are locked.
* **CP1 Safety Verification**:
  * Checkout remains disabled.
  * Explains that payments are inactive.

### 1.5. Learn Report `/learn-report`
* **Status**: Conceptual documentation.
* **Purpose**: Educating users on the platform's constraints and features.
* **CTAs**: "Buat Laporan Pertamamu".
* **Gaps**:
  * Overclaims active database, literature, and source verification features.
  * Lacks a structured explanation of the "Evidence Quality Ladder".
  * Lacks a dedicated "What NaLI does not do in CP1" section.
* **CP1 Safety Verification**:
  * Mentions academic integrity and evidence boundaries.

### 1.6. Auth (/login & /register)
* **Status**: Next.js auth pages.
* **Purpose**: Sign in and onboarding.
* **Gaps**:
  * Uses a placeholder "N" tile instead of the official SVG `NaLILogoMark`.
  * Mixed English/Indonesian text.
  * Register roles claim professional/CP5 features.
* **CP1 Safety Verification**:
  * Correctly interfaces with Supabase Auth client.

### 1.7. PWA and PWA Manifest `/manifest.json`
* **Status**: Manifest points to `/dashboard` as `start_url`.
* **Purpose**: App configuration.
* **Gaps**:
  * Points to `/dashboard` which immediately redirects unauthenticated users to `/login`.
  * Claims "Wildlife Field Intelligence" instead of the aligned "Nature & Evidence Intelligence OS" positioning.
* **CP1 Safety Verification**:
  * Background and theme colors match the dark ecological aesthetic.

---

## 2. Manus-Like Gap Checklist

| Feature | Manus-Style Expectation | NaLI CP1 Implementation Plan |
| :--- | :--- | :--- |
| **Prompt-First** | Clean prompt centered, immediate action. | Center prompt hero section, make input field prominent. |
| **Task Chips** | Suggest actions that populate input or start tasks. | Update chips to map to actual CP1 workflows. |
| **Agent Plan** | Clear work steps visible before/during work. | Add `AgentStageTimeline` showing work checklist. |
| **Action Log** | Safe system events showing action progress. | Render system-level process events safely. |
| **Evidence Panel** | Show quality level, missing parts, user input. | Show `EvidenceQualityPanel` and `MissingEvidencePanel`. |
| **Honest States** | Clean empty states for missing info or locks. | Build polished, descriptive empty states for history/notes. |

---

## 3. Implementation Plan

1. **Centralize Feature Flags**: Verify `src/lib/system/readiness.ts` and `src/lib/config/flags.ts` control active capabilities.
2. **Revamp Homepage Hero & Chips**: Replace shortcut chips with the 8 task chips. Clicking a chip populates the composer or routes to `/create-report` with prefill.
3. **Workspace Agent Panels**: Add process timeline, action log, and evidence checklists to the generation page.
4. **Field Notes Local Fallback**: Support local storage notes for guest users.
5. **Pricing Alignment**: Render `Seeds` (Free), `Basic`, `Pro`, and `Pro Bundle` cards. Add "Notify me" button.
6. **Learn Page Updates**: Rewrite copy to detail the Evidence Ladder and CP1 limitations.
7. **Auth Visual Alignment**: Import and display `<NaLILogo variant="light" showWordmark={false} />` instead of the placeholder letter "N". Match roles.
8. **Manifest URL**: Update `start_url` to `/create-report` and name to `NaLI - Nature & Evidence Intelligence OS`.

---

## 4. Post-Fix Verification Checklist

- [ ] All 328 unit tests pass successfully.
- [ ] No fake payment, fake upload, or premium bypass routes active.
- [ ] Mobile composer and layout responsive down to 360px.
- [ ] Indonesian-first copywriting check complete.
