# NaLI CP1 Agentic UX Operations Runbook

## 1. Overview
This runbook explains how to manage, verify, and monitor the CP1 "Agentic UX / Manus-like Product Feel" interface, its local storage fallbacks, interest captures, and safety policies.

## 2. Interface Management & Feature Flags
All CP1 feature gates are centralized in the backend and config parameters.
* **Midtrans/Checkout**: `paymentActivation` must remain `"disabled"`.
* **File Uploads**: `uploadPrepared` is true but file uploads in public UI remain inactive/disabled.
* **Source Verification**: Crawler routes are disabled.

## 3. Local-Only Storage Layer
When Supabase environment variables are missing or unauthenticated users access the site:
* **Field Notes**: Stored under `localStorage` key `nali-local-notes`.
* **Pricing Signups**: Stored under `localStorage` key `nali-pricing-interest`.
* **Report Access**: Stored under `localStorage` key `nali-report-access:[reportId]`.

### Verification of Local Fallbacks
To inspect stored local state in the browser developer tools console:
1. **List local notes**: `JSON.parse(localStorage.getItem("nali-local-notes") || "[]")`
2. **List interest signups**: `JSON.parse(localStorage.getItem("nali-pricing-interest") || "[]")`

## 4. Maintenance & Purge Procedures
If test data or local storage caches need to be purged:
* **Purge local browser cache**: Clear site data in browser settings or run `localStorage.clear()` in developer console.
* **Server-side cleanup**: Execute the database maintenance purge endpoint `POST /api/maintenance/purge` (token-gated).

## 5. Verification Commands
Run these commands in order to confirm the platform is correct and stable:
```bash
# 1. Install dependencies
npm install

# 2. Run static validation (Linter and TypeScript compiler)
npm run lint
npm run typecheck

# 3. Compile next.js bundle
npm run build

# 4. Check i18n localization keys coverage
npm run check:i18n

# 5. Run automated test suite
npm run test:demo
node --test tests/reports/*.test.cjs

# 6. Run comprehensive verification checks
npm run verify
```

## 6. Safety & Academic Integrity Checklist
When introducing new routes, components, or updating copywriting, verify the following are strictly adhered to:
* No model engine profiles (`Peregrine`, `Obsidian`, `Zephyr`) or provider names (`OpenRouter`, `Gemini`, `Claude`) can leak in public UI.
* Do not mention academic cheating helper copy (`Turnitin bypass`, `detector bypass`, `joki`, `humanizer`).
* Every report preview must contain the default public disclaimer warning about evidence limits.
