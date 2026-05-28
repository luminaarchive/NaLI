# Repository Map

A structural overview of code folders in NaLI.

## File Layout

- **`src/app/`**: Next.js App Router folders.
  - **`src/app/(auth)/`**: Authenticated entry paths (login, register).
  - **`src/app/api/`**: Server-side route handlers.
    - `api/reports/generate/route.ts`: Initial report generation.
    - `api/reports/chat/route.ts`: Thread revision chat.
    - `api/auth/link-guest/route.ts`: Linking guest logs to users.
- **`src/components/`**: Reusable React components.
  - **`src/components/report/`**: Report workspace items.
    - `AgentWorkspace.tsx`: Main workspace view containing the chat interface and results panel.
- **`src/lib/`**: Domain and helper modules.
  - **`src/lib/supabase/`**: DB clients (`client.ts`, `server.ts`, `admin.ts`).
  - **`src/lib/reports/`**: Report persistence logic (`persistence.ts`).
  - **`src/lib/auth/`**: Authentication config flags (`config.ts`).
- **`tests/`**: Test infrastructure.
  - **`tests/reports/`**: Node unit tests.
  - **`tests/e2e/`**: Playwright E2E integration specs.
- **`supabase/`**: Database migrations and configuration schemas.
- **`docs/`**: Operational, QA, and architectural documentation.
- **`scripts/`**: Automation helper scripts.
