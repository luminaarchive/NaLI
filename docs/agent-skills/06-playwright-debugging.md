# Playwright E2E Debugging

Guidelines to configure, run, and debug Playwright integration tests.

## Running Tests

- Run all E2E specs: `npx playwright test`
- Run a specific test spec: `npx playwright test tests/e2e/nali-auth-persistence.spec.ts`
- Run in UI Mode: `npx playwright test --ui`

## Debugging Failures

1. **Check strictness violations**: If a selector resolves to multiple elements (e.g. `locator('button:has(svg)')`), refine the query with attributes, text matching, or input adjacent siblings.
2. **Inspect traces**: Playwright is configured to save traces on first retry or failure. View traces under `test-results/`.
3. **Capture logs**: Capture dev server outputs. Search for `fetch failed` or database connectivity issues in logs.
4. **Dev Server conflicts**: Reuse existing servers if already running using the `reuseExistingServer: true` flag inside `playwright.config.ts`.
