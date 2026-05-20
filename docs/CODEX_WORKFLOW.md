# NaLI Codex Workflow

Status date: 2026-05-21.

## Start Every Codex Session

1. Run `git status` first.
2. Read `AGENTS.md`.
3. Read `docs/PROJECT_STATUS.md`.
4. Check the affected files with `rg` or `rg --files` before editing.
5. Read relevant local Next.js docs in `node_modules/next/dist/docs/` before coding against App Router APIs.
6. Keep changes small, scoped, and verifiable.

## Absolute Safety Rules

- Public visual lock is absolute. Do not redesign homepage, hero, colors, typography, nav, pricing, Field Intelligence, or public layout without explicit founder approval.
- Do not move Next.js route files or rename public routes unless absolutely necessary.
- Do not treat fallback success as production persistence success.
- Persistence and payment bugs require production smoke/readiness checks.
- Never commit secrets.
- Never print raw `guest_session_id`, access keys, token values, hashes, service role values, or Midtrans secrets.
- Do not claim active payment, realtime field intelligence, institutional deployment, or production persistence unless the relevant production verification passed.
- Do not keep guessing after repeated failures.

## Three-Strike Debugging Rule

After 3 failed attempts on the same issue:

1. Stop changing code.
2. Write down the exact failing command, error, and hypothesis.
3. Re-read the relevant source/tests/docs.
4. Diagnose from evidence before trying another fix.

## Safe Scripts

Common local checks:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:demo`
- `node --test tests/reports/report-mvp.test.cjs`
- `node --test tests/reports/persistence-smoke.test.cjs`

Production/readiness checks:

- `npm run smoke:feedback:prod` checks production feedback persistence and must not print secrets.
- `npm run check:readiness:prod` checks the production readiness endpoint.
- `npm run validate:production` is broader and depends on configured production env vars.

Operational notes:

- If Supabase env vars are missing locally, local fallback behavior is expected, but it does not prove production persistence.
- If Midtrans env vars are missing, paid export may be coded but not production verified.
- Use production smoke tests for persistence/payment bugs before calling them fixed.

## Small Verified Feature Loop

1. Confirm scope and public visual lock impact.
2. Inspect only relevant files.
3. Patch narrowly.
4. Run the smallest meaningful test first.
5. Run broader checks when the change touches shared behavior.
6. Commit after a small verified feature or documentation pass.
7. Push only after the commit is verified and the branch target is intentional.

## File Placement Rules

- Keep app routes in `src/app`.
- Keep UI components in `src/components`.
- Keep report-specific components in `src/components/report`.
- Keep backend/domain logic in `src/lib`.
- Keep tests in `tests`.
- Keep operational scripts in `scripts`.
- Keep documentation in `docs`.
- Keep temporary one-off artifacts in `scratch`.
