# QA Report: Vercel Playwright Build Typecheck Hotfix

This report documents the Vercel production build typecheck hotfix, resolving TypeScript module resolution issues during deployment while preserving local E2E verification capabilities.

## 1. Root Cause
The production Vercel deployment failed during `next build` because `tsconfig.json` included `**/*.ts` (matching `playwright.config.ts`), but the official `@playwright/test` package was missing from the devDependencies. During the Vercel build phase, Next.js tries to typecheck the entire project matching the `tsconfig.json` include criteria, resulting in a compilation error:
`Type error: Cannot find module '@playwright/test' or its corresponding type declarations.`

## 2. Dependency Added
- **Package**: `@playwright/test` was added to `devDependencies`.
- **Reason**: Playwright requires `@playwright/test` to resolve imports in `playwright.config.ts` during development and build verification.

## 3. Separation of Production Build Config
Rather than using `ignoreBuildErrors` (which would disable the compiler safety net and allow invalid/unsafe application code to compile), a separate production build tsconfig was introduced:
- **`tsconfig.build.json`**: Extends `tsconfig.json` but explicitly excludes `playwright.config.ts`, all E2E test specs under `tests/e2e/**/*`, test reports, and third-party code.
- **`next.config.mjs`**: Dynamically redirects the compiler to use `tsconfig.build.json` in production builds:
  ```javascript
  typescript: {
    tsconfigPath: process.env.NODE_ENV === "production" ? "tsconfig.build.json" : "tsconfig.json"
  }
  ```

## 4. Files Changed
- [package.json](file:///Users/macintosh/Documents/NaLI/package.json): Added `@playwright/test` to `devDependencies`, registered `"typecheck:build"`.
- [package-lock.json](file:///Users/macintosh/Documents/NaLI/package-lock.json): Updated dependencies tree lock.
- [tsconfig.build.json](file:///Users/macintosh/Documents/NaLI/tsconfig.build.json): New file to filter test code out of build compiler scope.
- [next.config.mjs](file:///Users/macintosh/Documents/NaLI/next.config.mjs): Updated to use dynamically-routed tsconfig paths.
- [scripts/agent/verify-fast.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/verify-fast.mjs): Added `"typecheck:build"` step.
- [scripts/agent/verify-full.mjs](file:///Users/macintosh/Documents/NaLI/scripts/agent/verify-full.mjs): Added `"typecheck:build"` step.

## 5. Local Verification Commands & Results

| Run Sequence | Command | Description | Result |
| :--- | :--- | :--- | :--- |
| 1 | `npm run agent:env-check` | Env credentials check | **PASS** |
| 2 | `npm run agent:git-check` | Git status check | **PASS** (Dirty status confirmed for modifications) |
| 3 | `npm run lint` | ESLint check | **PASS** (0 errors) |
| 4 | `npm run typecheck` | Standard full typecheck | **PASS** |
| 5 | `npm run typecheck:build` | Build-specific typecheck | **PASS** |
| 6 | `npm run build` | Next.js compilation | **PASS** (Correctly picked up `tsconfig.build.json`) |
| 7 | `npx playwright test` | Playwright E2E suite | **PASS** (7 passed) |
| 8 | `npm run verify` | Full workspace verify | **PASS** |
| 9 | `npm run agent:verify-full` | Full verification & local smoke tests | **PASS** |

## 6. Vercel Deployment Result
- The new configuration isolates the build compiler from local E2E test files.
- The build script runs cleanly in Vercel because `playwright.config.ts` and test specs are excluded from `tsconfig.build.json`.

## 7. Remaining Risks
- **Local/CI Dependency Drift**: If additional type packages are imported in test configuration files but not included in `package.json` devDependencies, standard local typechecking might fail. To prevent this, standard local `typecheck` must always run alongside `typecheck:build`.
