# NaLI Project Structure Audit

Status date: 2026-05-21.

## Current Scope

This audit documents the local workspace organization for NaLI Sprint 0 through Sprint 0.2. It is not a refactor plan. Public visual work is locked, and workspace organization should stay limited to documentation, Codex workflow rules, safe scripts, and obvious temporary artifacts.

## Important Folders

| Path | Purpose | Edit Safety |
| --- | --- | --- |
| `src/app` | Next.js 16 App Router pages and API routes. Public routes include `/`, `/learn-report`, `/create-report`, `/report/[id]`, `/field-intelligence`, and `/pricing`. | Sensitive. Do not move route files or rename public routes unless absolutely necessary and verified. |
| `src/components` | Shared React components. | Edit only for scoped fixes. Do not redesign public components during the visual lock. |
| `src/components/report` | Learn & Report and report-result components. | Sensitive but editable for scoped report bugs. Preserve integrity and persistence guardrails. |
| `src/lib` | Backend/domain logic for reports, integrity policy, payments, Supabase, usage, rate limits, species data, and system readiness. | Sensitive. Prefer tests before and after behavior changes. |
| `src/proxy.ts` | Supabase auth/protected-route proxy. | Sensitive. Avoid casual edits. |
| `public` | Static assets, brand files, ambient media, images, and species visuals. | Sensitive for visual and species-accuracy work. Do not replace public visuals casually. |
| `supabase/migrations` | Database migrations. | Highly sensitive. Additive migrations only, reviewed before production use. Do not move migrations. |
| `scripts` | Operational validation, smoke checks, migration/readiness helpers, and export utilities. | Safe for scoped script additions/fixes. Do not print secrets. |
| `tests` | Node tests, demo tests, report MVP tests, persistence smoke tests, and domain regression suites. | Safe to edit when proving behavior. Keep tests close to the affected feature. |
| `docs` | Project documentation, audits, workflow notes, environment rules, and live QA reports. | Safe for documentation updates. Keep status claims dated and honest. |
| `scratch` | One-off SQL, local probes, and temporary project artifacts. | Safe destination for temporary artifacts. Do not treat scratch files as production source. |
| `data` | Fine-tuning and generated research data artifacts. | Sensitive when outputs could be mistaken for production facts. |
| `.codex/skills` | Local NaLI Codex skills. | Sensitive project-operating context. Do not rewrite casually. |
| `.next`, `node_modules`, `.vercel`, `.playwright-mcp` | Generated, installed, or local tool/cache directories. | Do not edit or commit. |

## Root Files

| File | Purpose | Notes |
| --- | --- | --- |
| `AGENTS.md` | Primary local agent instructions. | Must be read before coding. Update carefully, append instead of replacing. |
| `DESIGN.md` | Design system source of truth. | Public visual lock depends on this. Do not loosen without founder approval. |
| `README.md` | Human project overview. | Safe to update when project setup changes. |
| `package.json` / `package-lock.json` | npm scripts and dependency lock. | Sensitive. Do not remove scripts or churn the lockfile casually. |
| `next.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `components.json` | Framework, lint, TypeScript, CSS, and UI configuration. | Sensitive configuration. Verify after edits. |
| `.gitignore` | Prevents local env, generated output, screenshots, and caches from being committed. | Safe for narrow ignore-rule fixes. |
| `.env*` | Local and production environment files. | Secret-sensitive. Never stage, print, or move casually. |
| `CLAUDE.md` | Points back to `AGENTS.md`. | Leave in place for cross-agent compatibility. |
| `test-eslint.mjs` | Small ESLint config test fixture. | Leave in place unless lint tooling changes. |

## Safe-To-Edit Areas

- `docs` for workflow, status, audit, and runbook updates.
- `tests` for scoped behavior coverage.
- `scripts` for scoped operational commands that avoid secrets.
- `scratch` for temporary local artifacts.
- `src/lib` only when fixing a well-scoped backend/domain bug and tests are run.
- `src/components/report` only when fixing report-workflow bugs without redesign.

## Sensitive Areas

- Public visual routes and components: homepage, hero, colors, typography, nav, pricing, Field Intelligence, and public layout.
- `src/app` route structure and public route names.
- `src/app/api/**/route.ts` server routes.
- `src/lib/config/env.ts`, `src/lib/supabase`, `src/lib/reports`, `src/lib/payments`, `src/lib/usage`, and `src/lib/rateLimit`.
- `supabase/migrations`.
- `.env*`, Vercel env exports, Supabase service role values, Midtrans secrets, access keys, guest session IDs, and hashes.
- `package-lock.json` unless dependency changes are intentional.

## Current Sprint Status

- Sprint 0 feedback persistence is locked and verified.
- Supabase URL variables must use the base URL only, without `/rest/v1`.
- `reports`, `usage_events`, and `report_feedback` are production verified.
- Sprint 0.1 paid export MVP is production verified.
- Unpaid export returns locked/HTTP `402` before payment.
- Pending payment rows are created in production.
- Confirmed payment unlocks markdown export through the `payments` table.
- Midtrans is not configured in production, so manual pending payment mode is active.
- Public visual is locked.
- No big agentic features should be added while first-sale manual payment operations are being stabilized.

## Current Production Verification Status

- Production site: `https://naliai.vercel.app`.
- Feedback persistence is production verified for the Sprint 0 persistence path.
- `reports`, `usage_events`, `report_feedback`, and `payments` have been verified in production.
- Paid export production verification passed for readiness, unpaid export lock, pending payment creation, confirmed payment unlock, and markdown export after confirmation.
- Fallback success must not be treated as production persistence success.
- Persistence and payment bugs require production smoke/readiness checks, not only local tests.

## Root Clutter Review

Obvious temporary/project scratch artifacts found in the root:

- `dev.log`, a tracked local dev server log.
- `nali-*.png`, QA screenshots and issue screenshots from prior visual checks.
- `nali-playwright-console-*.md`, ignored Playwright console output.

Safe cleanup action for this pass:

- Move the temporary QA screenshots and console logs into `scratch/root-qa-artifacts/2026-05-root-artifacts/`.
- Move `dev.log` into `scratch/logs/dev.log`.

Left in place intentionally:

- `.env*` files, because they are secret-sensitive local configuration and already ignored.
- `next-env.d.ts` and `tsconfig.tsbuildinfo`, because they are generated and ignored but expected near the Next/TypeScript root.
- `.DS_Store`, `.next`, `.vercel`, `.playwright-mcp`, `node_modules`, and empty `.tmp_*` directories, because they are generated/local tool artifacts and not part of source organization.
- `ui-ux-pro-max-skill`, because it is ignored local tooling and should not be moved during a no-risk organization pass.

## Guardrails For Future Organization

- Do not move source files unless import paths are updated and tests pass.
- Do not move Next.js route files unless there is no safer option.
- Do not move Supabase migrations.
- If unsure whether a file is temporary, leave it in place and document it before changing anything.
