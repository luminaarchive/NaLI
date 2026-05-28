# NaLI CP1 Agentic UX / Manus-like Product Feel Alignment Report

## 1. Summary of Changes
This sprint aligned NaLI's user experience with the category feel of a modern agentic AI workspace (Manus-like) while preserving its core Indonesia-first identity and strict CP1 safety constraints.

## 2. Route-by-Route Before/After Comparison

| Route | Before State | After State (Manus-like / Aligned) |
| :--- | :--- | :--- |
| **Home `/`** | Static hero layout, generic search chips, no workflow overview. | Prompt-first ecological layout, 8 interactive task chips, and an 8-step agent work plan card. |
| **Workspace `/create-report`** | Standard form-based generator, basic loader list. | App-shell centered composer, quick action chips, live `AgentPlanPanel` showing active processing stages, empty history states, and visible status labels. |
| **Field Notes `/field-notes`** | Infinite skeletons when unauthenticated, crash on save in guest mode. | Stateful `isGuest` checks. Unauthenticated logs fallback to local browser storage (`nali-local-notes`). Displays local guest banner warning. |
| **Pricing `/pricing`** | Monthly subscription tiers (Seeds, Sapling, Forest Keeper). | Report-based packages (`Basic`, `Pro`, `Pro Bundle`) mapped via `PricingCards`. Integrates a client-side interest capture form with stateful validation and toast. |
| **Learn `/learn-report`** | Claims active database and citation crawler. | Described "Evidence Quality Ladder" (Levels 1-5) and detailed "Yang NaLI tidak lakukan" limitations. |
| **Auth (`/login` & `/register`)** | Generic "N" tile logo, mixed languages, overclaiming roles. | Renders SVG `NaLILogo`, clean Indonesian-first copy, simplified registration roles (Mahasiswa, Peneliti, Ranger / Tim Lapangan, Umum) safely mapped to database enums. |
| **PWA Manifest** | Start URL `/dashboard` (triggers login redirect), generic name. | Start URL `/create-report` (direct to workspace), name updated to `NaLI - Nature & Evidence Intelligence OS`. |

## 3. UI/UX & Backend Truth Fixes
* **Local Notes Fallback**: Added stateful `isGuest` storage layer in `src/app/field-notes/page.tsx` so unauthenticated users can write and analyze local observations.
* **Pricing Interest Capture**: Created `src/components/report/PricingInterestCapture.tsx` client component.
* **Centralized Feature Flags**: Preserved all system readiness gates. All premium model selections, automated verification, persistent file upload, and active payment checkouts remain locked.

## 4. CP1 Safety Confirmation
* **No fake payment**: Midtrans checkout and billing routes remain disabled.
* **No fake upload**: File uploads are disabled.
* **No fake source verification**: GBIF/IUCN/Crossref/NCBI crawlers are disabled.
* **No fake expert review**: Unverified states remain labeled as such.
* **No public model selector**: AI routing remains internal, using NaLI processing terminology.
* **No premium bypass**: Client-supplied engine attributes are ignored on public generation endpoint.
* **No cheating wording**: Removed all prohibited terms (`turnitin`, `humanizer`, `undetectable`, etc.) from SEO and metadata routes.

## 5. Verification Results
* **Linting (`npm run lint`)**: Passed successfully.
* **Typechecking (`npm run typecheck`)**: Passed successfully.
* **Build (`npm run build`)**: Passed successfully.
* **Automated Tests**:
  * `npm run test:demo` (5/5 passed)
  * `node --test tests/reports/*.test.cjs` (64/64 passed)
  * `npm run verify` (All verification tests passed)

## 6. Git Details
* **Commit hash**: `8644cb600c38c73a81775170dace9ae4ab251595`
* **Branch**: `main`
* **Push status**: Successfully pushed to `origin/main`

## 7. Remaining Risks
* **LocalStorage Clears**: Since guest report access tokens and notes rely on browser local storage, clearing browser cache will erase them.
* **Static Metadata Lints**: Prohibited keywords are blocked in server files but could be introduced during copy updates if not checked.
