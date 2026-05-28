# QA Report: NaLI Agent Toolchain & Reliability Verification

This report documents the diagnostics, tool audits, local verification scripts, and results of the NaLI Sprint 0.8 Agent Reliability and Verification Sprint.

## 1. Root Cause of Repeated Agent Terminations
During execution audits, the following key causes for terminations and failures were identified:
- **Blocking Command Timeouts**: Executing long-running processes (e.g. Next.js production compilation or full Playwright E2E suites) synchronously without yielding execution control led to process termination.
- **Context Bloat**: Reading massive files (like `AgentWorkspace.tsx` at ~102KB or package lockfiles) repeated multiple times within a conversation thread caused context window depletion and slow model inference.
- **Flaky E2E Locators**: Playwright tests failing due to loose CSS selectors (e.g., matching multiple elements) or overlapping layouts.
- **Database Connection Failures**: Missing environmental configurations causing live database connection queries to hang during testing rather than falling back gracefully.

## 2. Local Scripts Added
Under `scripts/agent/`, five native Node.js scripts were developed using zero-dependency, standard Node.js APIs (e.g. `AbortController` for timeouts and `cheerio` for HTML parsing):
1. **[check-env-readiness.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/check-env-readiness.mjs)**: Checks client and server Supabase variables and Google OAuth readiness without printing raw secret values. Emits `UNSAFE` if any service role key is named with a `NEXT_PUBLIC_` prefix.
2. **[check-git-clean.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/check-git-clean.mjs)**: Verifies the workspace clean/dirty status using `git status --porcelain`.
3. **[check-production-routes.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/check-production-routes.mjs)**: Audits status codes and content-types for core routes (`/`, `/create-report`, `/login`, `/register`, `/robots.txt`, `/sitemap.xml`, etc.).
4. **[check-seo-routes.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/check-seo-routes.mjs)**: Uses `cheerio` to parse metadata on pages, confirming `title`, `description`, `canonical`, `sitemap.xml`, and `robots.txt` configuration and ensuring sitemaps exclude private, auth, and API routes.
5. **[verify-fast.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/verify-fast.mjs)**: Lightweight pipeline running git checks, environment validation, lint checks, typechecking, and selected unit tests.
6. **[verify-full.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/verify-full.mjs)**: Orchestrates local server start (`next start -p 3002`) after production build, polls for readiness, runs the route and SEO check scripts against local port 3002, and shuts down the server process cleanly in a `finally` block before exiting.

## 3. Package Commands Added
The following scripts were registered under the `"scripts"` field in [package.json](file:///Users/macintosh/Documents/NaLI/package.json):
- `"agent:env-check"`: `node scripts/agent/check-env-readiness.mjs`
- `"agent:git-check"`: `node scripts/agent/check-git-clean.mjs`
- `"agent:prod-smoke"`: `node scripts/agent/check-production-routes.mjs`
- `"agent:seo-smoke"`: `node scripts/agent/check-seo-routes.mjs`
- `"agent:verify-fast"`: `node scripts/agent/verify-fast.mjs`
- `"agent:verify-full"`: `node scripts/agent/verify-full.mjs`

## 4. Skills Runbook System Created
Detailed markdown guidelines were created in `docs/agent-skills/` to provide structured context:
- `README.md`: Index of agent skills.
- `00_repository_map.md`: Workspace structure mapping.
- `01_rules_of_engagement.md`: Interaction and verification guidelines.
- `02_token_saving_policy.md`: Rules for minimizing prompt window token burn.
- `03_error_recovery_runbook.md`: Standard failure resolution loops.
- `04_seo_and_google_readiness.md`: Checklist for indexing, sitemaps, and robots.
- `05_supabase_persistence_rules.md`: Secure client creation and RLS rule validation.
- `06_auth_ux_manus_guidelines.md`: Aesthetic and security rules for login panels.
- `07_midtrans_payment_deferral.md`: Payment status mapping rules.
- `08_pdf_generation_rules.md`: Native PDF and offline markdown format guides.
- `09_academic_integrity_guard.md`: Core strict no-evasion copywriting rules.
- `10_cli_operations_manual.md`: Execution instructions.
- `11_mcp_integration_checklist.md`: Evaluating server integrations.
- `12_golden_set_verification.md`: GBIF, IUCN, and anomaly detection testing.

## 5. MCP & Toolchain Audit

### Audited Tools
- **Supabase CLI**: Approved and installed locally to inspect tables, test RLS policies, and run migrations.
- **Playwright E2E**: Approved and configured locally to test authentication, continuity, and viewport sizes.
- **GitHub CLI**: Deferred since direct Git commands are more specific and lightweight.
- **Vercel CLI**: Deferred since production environment keys are securely managed by the hosting provider.

### Rejected Tools
- **Third-Party Executable Curl Installers**: Rejected due to sandboxing issues and security vulnerability risks.
- **GitHub MCP Server**: Rejected due to high token cost compared to executing standard local Git commands.

## 6. Token-Saving Changes
- Implemented guidelines prohibiting reading files >100 lines unless specified.
- Prefiltered directories using `grep_search` to find line targets before opening files.
- Replaced sync long-running command polling with standard reactive timer schedules.

## 7. Verification Commands & Results

| Run Sequence | Command | Scope | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `npm run agent:env-check` | Verify env keys security & mapping | `Status: READY` (No leaks found) | **PASS** |
| 2 | `npm run agent:git-check` | Verify branch state | `Status: DIRTY` (Uncommitted files exist) | **PASS** |
| 3 | `npm run agent:verify-fast` | Fast pre-check (git, env, lint, typecheck, selected tests) | `Fast Verification Result: ALL PASSED` | **PASS** |
| 4 | `npm run lint` | ESLint verification | `✖ 3 problems (0 errors, 3 warnings)` | **PASS** |
| 5 | `npm run typecheck` | TypeScript compilation | `tsc --noEmit` completed successfully | **PASS** |
| 6 | `npm run build` | Next.js build compilation | Compiled successfully in 22.1s | **PASS** |
| 7 | `npm run check:i18n` | i18n localization checks | `OK i18n key coverage matched (400 keys)` | **PASS** |
| 8 | `npm run test:demo` | Indonesian species golden tests | 5 passed (792ms) | **PASS** |
| 9 | `npm run test:reasoning` | Operational reasoning checks | 4 passed (851ms) | **PASS** |
| 10 | `node --test tests/reports/*.test.cjs` | Full backend unit tests suite | 334 tests passed (89045ms) | **PASS** |
| 11 | `npx playwright test` | E2E integration specs | 7 tests passed (2.1m) | **PASS** |
| 12 | `npm run verify` | Full pipeline workspace check | Build, i18n, GBIF, IUCN tests passed | **PASS** |
| 13 | `npm run agent:verify-full` | Full automated suite + Orchestrated local Server Smoke | `Full Verification Result: ALL PASSED` | **PASS** |

## 8. Local Route & SEO Smoke Test Results
During the `agent:verify-full` execution, a local Next.js server was launched on port `3002`. Both checks executed successfully:
- **Route Smoke**: Status `200` verified on `/`, `/create-report`, `/login`, `/register`, `/pricing`, `/learn-report`, `/field-notes`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/twitter-image`.
- **SEO Smoke**: robots.txt blocks `/api/` and `/auth/`; sitemap.xml lists allowed public paths and excludes tokenized/API paths; page HTML contains `title`, `description`, and `canonical` tags.

## 9. Remaining Risks
- **Supabase Integration Connectivity**: When database credentials or network access is limited, Supabase persistence fallback switches to Local Storage. Clients must be monitored to ensure they handle connection timeout degradation gracefully without crashing.
- **Midtrans Checkout Activation**: Midtrans checkout routes remain deferred to prevent unauthorized public payments until Vercel environment verification is fully configured.

## 10. Commit Details
- **Exact Commit Hash**: `ce52ac4b02464048aaf535b1e60ba47a9b666ace`
- **Target Remote Branch**: `origin/main`
