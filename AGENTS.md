<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NaLI v1.5.3 Project Instructions

## Project Purpose

NaLI by NatIve is one brand with two modes:

- Public Mode: NaLI Learn & Report.
- Professional Mode: NaLI Field Intelligence.

The current MVP priority is the Public Layer: Field Note / Source to Report Generator plus Start From Zero guidance. The Professional Layer may be visible as positioning and product information, but must not be presented as a fully live operational system unless the feature is actually implemented and verified.

NaLI v1.5.3 Sprint 0 is a foundation sprint: Guest Mode first, hardcoded integrity filtering, lightweight report persistence, NaLI Energy ledger preparation, and payment/export-gate preparation only. Do not expand into the full Professional Layer during Sprint 0.

## Current MVP Scope

Build the smallest working Learn & Report flow:

- Home page explains the two paths.
- Main CTA: "Mulai Susun Laporan".
- `/learn-report` explains the Public Layer.
- `/create-report` is a command workspace with two modes:
  - `draft_from_materials`: users provide at least one material and receive a structured draft.
  - `start_from_zero`: users provide a topic/request and receive guidance only, not a report draft.
- Server route validates mode-specific input and returns structured JSON.
- Result page distinguishes draft reports from start-from-zero guidance, then shows evidence/checklists, uncertainty/source limits, disclaimers, and simple copy/export.
- `/field-intelligence` is informational only for now.
- `/pricing` is a beta pricing placeholder. Do not claim payment is active.
- Guest Mode report persistence may be used when Supabase server env vars are configured. If not configured, the client must gracefully fall back to local browser storage.

## Local Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Public demo test: `npm run test:demo`
- Full verification, when scope justifies it: `npm run verify`

## Current Architecture Notes

- Framework: Next.js 16 App Router under `src/app`.
- Package manager: npm (`package-lock.json` is present).
- Styling: Tailwind CSS v4 with theme tokens in `src/app/globals.css`.
- Auth: Supabase auth via `src/proxy.ts` and protected `(app)` routes.
- Database: Supabase scaffolding exists. Do not create or modify production schema without a migration.
- Server API routes live under `src/app/api/**/route.ts`.
- Learn & Report AI provider integration uses server-only provider env vars. Public UI must use NaLI processing language, not provider names. If provider keys are missing or all models fail, the report route returns a clearly labeled DEMO/MOCK result.
- Sprint 0 persistence stores guest and report access secrets as SHA-256 hashes only. Raw report access values may be returned to the browser once so `/report/[id]` can load a persisted report.
- Sprint 0 report workflow statuses must use only: `pending_upload`, `verifying`, `pending_payment`, `processing`, `export_ready`, `failed`.
- NaLI Energy balance must be computed from `SUM(amount)` in `energy_ledger`; do not create a separate balance table.
- `rate_limits` must use the composite primary key `(key_hash, action_type)`.
- Read relevant local Next.js docs in `node_modules/next/dist/docs/` before coding against App Router APIs.

## NaLI Integrity Rules

- Reject empty prompt/material on both client and server.
- Draft mode requires at least one user-provided material: text note, URL, location, file description, practicum result, field note, or data summary.
- Start-from-zero mode requires a topic, assignment intent, or question and must only return guidance. It must say: "Panduan awal — belum menjadi draft laporan berbasis bukti."
- Require the academic integrity checkbox before report generation/export.
- Every draft output must say: "Draft bantuan belajar/penulisan berbasis bukti."
- Every output must include the required Public Layer disclaimer:

  "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya AI sebagai karya final tanpa revisi."

- Start-from-zero guidance must include the required guidance disclaimer:

  "Panduan ini belum menjadi draft laporan berbasis bukti karena bahan observasi atau sumber belum tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih dahulu sebelum NaLI dapat menyusun draft laporan."

- Do not fabricate citations, DOI, statistics, observation data, authors, publishers, timestamps, coordinates, or references.
- User-provided URLs must be labeled as provided by user and not yet verified unless real verification is implemented.
- If Crossref/NCBI verification is not implemented, label it clearly: "Source verification belum aktif di MVP ini."
- Evidence hash, if shown, is only a "digital integrity marker", never legal proof or academic validation.
- Human review is final. NaLI output is draft/support, not final truth.
- Hardcoded server-side integrity policy must run before the model/provider call. Prompt instructions alone are not enough.
- Processing classes `Peregrine`, `Obsidian`, and `Zephyr` are internal routing classes, not public products.

## Do Not Rules

- Do not use or add academic-cheating wording: final-assignment generation, finished-thesis promises, doing a user's work, detection-evasion claims, plagiarism guarantees, automatic paper/thesis claims, or guaranteed-safety claims.
- Do not call NaLI a generic AI wrapper, homework cheating tool, fake citation generator, fake data generator, fake scientific claim generator, or fake realtime field intelligence product.
- Do not claim realtime field data, active payment, institutional deployments, legal admissibility, or verified professional integrations unless backed by working implementation and verification.
- Do not expose server secrets with `NEXT_PUBLIC_`.
- Do not expose `OPENROUTER_API_KEY` or any AI provider key to the browser.
- Do not expose provider names as public product branding in marketing or report UI. Use NaLI processing language.
- Do not call user-facing usage units by provider-cost terms. Use "NaLI Energy" when the concept is shown.
- Do not commit `.env.local` or print secrets.
- Do not run destructive SQL or modify production Supabase schema without an explicit migration file and review.
- Do not duplicate payment order IDs into `reports`; payment truth belongs in `payments` joined by `report_id`.
- Do not overbuild v1.5.3 deferred features in the MVP: full review queue, patrol planner, realtime alerts, H3/PostGIS, BirdNET, Neo4j, full Darwin Core institutional export, recurring subscription, SOS system, or enterprise dashboard.

## PUBLIC VISUAL LOCK

- Do not redesign public UI without explicit founder approval.
- Only bugfixes, overlap fixes, copy typo fixes, and backend work are allowed.

## Sprint 0.5 Payment Activation Notes

- Latest controlling guideline: `NaLI Guidelines v1.5.3 COMPLETE.pdf`.
- CP1 / BUILD NOW requires one-time Midtrans automatic payment for paid export.
- Manual payment confirmation is fallback only, not the primary June payment flow.
- Payment truth remains in `payments` joined by `report_id`; do not duplicate payment order ids, expiry, paid state, or banking transaction data into `reports`.
- Export unlock must depend on confirmed payment status from `payments`, not preview state, session state, or fallback/local success.
- Midtrans webhook success means only `settlement` or `capture` with `fraud_status = accept`.
- Deny, cancel, expire, failure, pending, and challenge states must not unlock markdown or PDF export.
- Do not expose Midtrans secrets, service role keys, access keys, guest session ids, hashes, provider/model names, or payment secrets in public UI/logs.

## Sprint 0.7 Final CP1 Guideline Notes

- Treat `NaLI Guidelines v1.5.3 COMPLETE.pdf` as final unless the founder explicitly announces a new update.
- CP1 active flow is Text/Form Report Flow only.
- Upload pipeline remains dormant/future and must not be hard-wired into CP1.
- CP1 operational schema should center on `reports`, `payments`, `report_events`, and `api_usage_logs`.
- Midtrans automatic payment is code-ready only until Vercel server-only env is configured and production smoke verifies checkout.
- Manual payment remains fallback only and must never be described as automatic checkout.
- Evidence Ladder is allowed only in simplified CP1-safe form: labels, evidence summary, missing evidence checklist, AI inference notice, and a simple integrity sheet. Do not build a full Evidence Graph.
- Do not build CP2/CP3/CP4/CP5+ features, DOCX, subscription, NaLI Energy UI, Literature Matrix automation, source resolvers, upload pipeline, NASA/GFW, Darwin Core, Official Observation Hash, SOS, PostGIS/H3, Professional Dashboard, or full F1-F11 until explicit trigger.

## NaLI Local Workspace Safety Rules

- Public visual lock is absolute.
- Keep app routes in `src/app`.
- Keep UI components in `src/components`.
- Keep report-specific components in `src/components/report`.
- Keep backend/domain logic in `src/lib`.
- Keep test files in `tests`.
- Keep operational scripts in `scripts`.
- Keep docs in `docs`.
- Keep temporary one-off artifacts in `scratch`.
- Do not move files unless import paths are updated and tests pass.
- Never commit secrets.
- Never print raw `guest_session_id`, access keys, hashes, service role, or Midtrans secrets.

## Definition Of Done

- Home page clearly shows Learn & Report and Field Intelligence.
- Public CTA leads to `/create-report`.
- Report form validates at least one material for draft mode, topic/request for start-from-zero mode, and required academic integrity consent.
- API route validates the same guardrails server-side.
- Server-side integrity policy blocks unsafe academic-cheating, fake citation, fake data, fake statistics, fake coordinate, and plagiarism-evasion requests before provider calls.
- Draft output is labeled as a draft and includes the required disclaimer.
- Start-from-zero output is labeled as guidance, not a draft report, and includes the required guidance disclaimer.
- Evidence table or guidance checklists, uncertainty/source limits, and next user steps are visible.
- Copy/export works in a simple format.
- Supabase Sprint 0 migrations are additive and safe; if they are not applied or env vars are missing, the app falls back instead of crashing.
- Forbidden academic-cheating wording is absent from UI.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass, or failures are reported with exact causes.

## Sprint 0.8 Agent Reliability & Verification Workflow

- **Targeted Verification First**: Always run targeted test suites or scripts (e.g. `npm run agent:verify-fast`) before triggering a full verification (`npm run verify`).
- **Token-Saving Policy**: Use `grep_search` (`rg`) to locate lines of code before opening files. Specify line ranges via `view_file` to keep prompts lightweight and prevent context window exhaustion.
- **MCP & Local Tooling**: Leverage standard local validation scripts (`scripts/agent/*`) and registered npm commands. Avoid installing external executable binaries.
- **Commit Index Maintenance**: Stage all features in small micro-commits. Ensure `git status` remains clean and HEAD matches the origin branch.
- **No Blocking Poll Loops**: Never poll task statuses continuously. Trigger a run, then yield control to the reactive agent system.
