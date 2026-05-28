# NaLI Production Continuity Sprint: Operational Runbook

This document serves as the operations and maintenance guide for NaLI, outlining local startup, verification commands, and system architecture for the persistent agent workspace and continuous chat threads.

## Local Operations

### 1. Installation
Install all dependencies using npm:
```bash
npm install
```

### 2. Startup Development Server
Start the development server with hot-reloading:
```bash
npm run dev
```

### 3. Build & Typecheck
Prepare a production build and run TypeScript checks:
```bash
npm run build
npm run typecheck
```

### 4. Run Test Suites
Verify all database migrations, agentic classifications, rate-limits, integrity constraints, and fallback persistence rules:
```bash
# Run public demo checks
npm run test:demo

# Run all core reports, persistence, migrations, and upload gate tests
node --test tests/reports/*.test.cjs

# Run E2E reasoners workflow tests
npm run test:reasoning
```

---

## Workspace Integration Architecture

The following flow represents the continuous query workflow in NaLI:

```
[ Homepage Query Box ]
          │
          ▼
Form Submit (HomeQueryBox.tsx)
  - Saves prefill text/mode in localStorage ("nali-create-report-prefill")
  - Redirects to /create-report?q=QUERY&mode=MODE
          │
          ▼
Workspace Mount (AgentWorkspace.tsx)
  - Mount-level useEffect parses URL query strings + localStorage
  - Sets prefill query & selects template
  - Auto-focuses the composer
          │
          ▼
Initial Generation (POST /api/reports/generate)
  - Evaluates hardcoded integrity policy
  - Calls provider (OpenRouter or neutral Mock Engine)
  - Returns structural report draft + initial Thread messages
  - Browser URL updates to /report/[reportId] via pushState
          │
          ▼
Iterative Chat Revision (POST /api/reports/chat)
  - Classifies user request (methods, formal, tables, conclusion, etc.)
  - Evaluates integrity policy and rate limits
  - Calls provider with full thread history and report draft context
  - Returns updated report draft + appended assistant messages
  - Persists messages and report locally (localStorage) & in remote database
```

---

## Production Smoke Checks

Run these commands to verify live production endpoints on Vercel:
```bash
# Check system readiness endpoint
npm run check:readiness:prod

# Smoke test feedback loop API
npm run smoke:feedback:prod

# Smoke test paid export gates API
npm run smoke:export:prod
```
