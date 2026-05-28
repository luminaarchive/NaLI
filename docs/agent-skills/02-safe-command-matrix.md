# Safe Command Matrix

Standard package commands to run.

## Commands Reference

| Operation | Command | Scope |
| :--- | :--- | :--- |
| **Lint Check** | `npm run lint` | Syntax check |
| **Type Check** | `npm run typecheck` | TS Compiler compilation |
| **Production Build** | `npm run build` | Webpack build output |
| **Env Audit** | `npm run agent:env-check` | Safely tests environment variables |
| **Route Smoke** | `npm run agent:prod-smoke` | Verifies production paths |
| **SEO Smoke** | `npm run agent:seo-smoke` | Asserts sitemaps/robots/noindex rules |
| **Fast Verify** | `npm run agent:verify-fast` | Runs fast lint + typecheck + subset tests |
| **Full Verify** | `npm run agent:verify-full` | Executes full tests, builds, and integration specs |

## Rules for Executing Commands

1. **Wait for completion**: When running `npx playwright test` or `npm run build`, set a reasonable `WaitMsBeforeAsync` (e.g. 5000) so compilation details return synchronously or yield control and wake up reactively.
2. **Never poll**: Never loop or run `manage_task` repeatedly to wait for task completion. Stop calling tools and let the system wake you up.
3. **Handle non-zero exit codes**: If a test or compiler fails, stop immediately, fix the file, and re-run. Never ignore errors.
