# QA Audit: NaLI MCP & Toolchain Audit

This audit evaluates MCP servers and command-line tools for local NaLI development, focusing on security risks, token conservation benefits, and installation status.

## Toolchain Evaluation

| Tool Target | Source | Trusted? | Purpose for NaLI | Secrets Required | Security Risk | Token Saving Benefit | Install Now? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GitHub CLI (`gh`)** | Official GitHub | Yes | Inspect PRs, issues, commits, and workflow runs directly in command output. | `GITHUB_TOKEN` | Low. Official tool. | High. Avoids manual logs and website loading. | **No** (Deferred: standard git CLI is fully sufficient for MVP). |
| **Supabase CLI** | Official Supabase | Yes | Inspect local DB instances, run migrations, and test RLS rules. | Supabase API Token | Low. | High. Enables schema diffing locally without web dashboard. | **Yes** (Installed in workspace context). |
| **Vercel CLI** | Official Vercel | Yes | Check Vercel deployments, inspect server logs, and monitor build statuses. | Vercel Token | Low. | High. Verifies build failures immediately without opening dashboard. | **No** (Deferred: Vercel env is fully configured on remote Vercel system). |
| **Playwright E2E** | Microsoft Playwright | Yes | Execute automated E2E specifications, captures screenshots, and monitors network. | None | Low. | High. Simulates 3-message guest-use and authentication sequence automatically. | **Yes** (Configured and verified). |
| **Environment Check Script** | Custom Repo Script | Yes | Safely audits env variables for Supabase/OAuth keys without exposing secrets. | None | Zero. Local logic only. | High. Fails fast if keys are missing before running tests. | **Yes** (Created). |
| **Production Route Smoke** | Custom Repo Script | Yes | Checks status codes and content types of live endpoints on Vercel. | None | Zero. | High. Confirms public route health in 2 seconds. | **Yes** (Created). |
| **SEO Validator Script** | Custom Repo Script | Yes | Validates robots.txt, canonical links, noindex tags, and sitemaps. | None | Zero. | High. Audits page indexing health locally. | **Yes** (Created). |

---

## Environmental Limitations

1. **GitHub MCP Server**: The sandboxed sandbox context has direct terminal access. Running standard `git` and local scripts is more target-specific and consumes fewer tokens than interacting with an intermediate GitHub MCP server.
2. **Supabase Production Migrations**: Production database migrations should only be executed using standard migrations. Direct remote DB write-access from raw agent prompts is disabled to protect transactional data integrity.
3. **No Third-Party Executable Curl Installers**: Arbitrary packages or unverified MCP servers from GitHub are strictly rejected to avoid security exploits.
