# QA Audit: NaLI Agent Termination Root Cause Analysis

This audit reviews recent agent executions, identifying common reasons for execution terminations, token waste, and process timeouts, and establishes preventive rules.

## Root Cause Matrix

| Failure Mode | Evidence / Symptom | Likely Cause | Fix / Mitigation | Prevention Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Command Timeout** | Execution terminates during test run or server compilation | Starting long-running commands (e.g. `npx playwright test`, `npm run build`) synchronously or waiting indefinitely for async processes. | Use `WaitMsBeforeAsync` properly, yield control, and let the system wakeup reactively instead of polling. | Do not run blocking commands >10s without yielding control. Never poll task status. |
| **Context Bloat** | Prompt token limit reached or sluggish generation | Repeatedly reading the entire `AgentWorkspace.tsx` (102KB) or package-lock files. | Use targeted tools like `grep_search` (`rg`) or read narrow line ranges via `view_file` start/end parameters. | Never view files >100 lines unless strictly required. Use `grep_search` first. |
| **Unstable Playwright Tests** | Strict mode violations, page timeouts | Broad CSS selectors (e.g. `button:has(svg)`) resolving to multiple items; next-dev-tools button overlay collisions. | Use highly specific locators like `aria-label`, input adjacent siblings, or custom data-testids. | Validate selectors locally. Run targeted spec files only (`npx playwright test <spec-path>`). |
| **Database Connection Hangs** | Database queries hang during smoke tests | Local tests trying to connect to a remote Supabase instance when credentials or internet access is limited/timeout. | Build local mock fallbacks (`mockDb`) that activate gracefully when config is missing. | Test connectivity using simple check-env scripts before running full DB operations. |
| **Parallel File Modification Collisions** | Merge conflicts, parse errors, duplicate functions | Running multiple overlapping replacement calls on the same file without intermediate compiles/lints. | Execute a single targeted compile/typecheck after every discrete file replacement. | Do not bundle multiple unrelated edits in a single turn. |
| **Uncommitted State Divergence** | Working on dirty tree without checking index | Making extensive changes and losing track of modified files after a crash. | Perform small, micro-commits with descriptive messages. | Keep the git working directory clean. Stage completed steps. |

---

## Preventative Action Protocol

To prevent sudden agent shutdowns and context depletion:

1. ** Targeted Search First**: Before opening any file, use `grep_search` to find exact occurrences and line numbers.
2. **Read Narrow Windows**: When viewing files, always restrict reading to the exact region of interest (e.g., `StartLine` to `EndLine`).
3. **Reactive Wait (No Polling)**: After triggering a long-running process (like Playwright E2E or verification), stop calling tools and yield control. The system will wake up automatically upon completion.
4. **Fast Verification**: Utilize targeted script runs (e.g., compile only, or run a single unit test) before performing a full-verify.
5. **No Blind Deploy Claims**: Never claim a deploy or route is healthy unless verified by a local or remote check-production script.
