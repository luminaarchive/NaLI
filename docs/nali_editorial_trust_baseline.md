# NaLI, Editorial Trust Sprint: Baseline (Phase 1)

_Internal note. Branch `editorial-trust-source-archive-30-articles` (already checked out at sprint start)._
_Run: 2026-06-12._

## Baseline checks (before any edits)

| Check | Command | Result |
|---|---|---|
| Install | `npm install` | up to date (node_modules present) |
| Lint | `npm run lint` | ✓ No ESLint warnings or errors |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | ✓ exit 0 |
| Build | `npm run build` | ✓ 45 routes generated, incl. 25 SSG `/arsip-sumber/[slug]` pages |
| Tests | `npm test` | **No `test` script defined** in `package.json` |

**No pre-existing failures.** The tree is green at baseline.

## Environment

- Node v24.14.1 / npm 11.11.0.
- `.env.local` present: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (build reads them; Supabase merge is graceful when DB empty/unreachable).

## Decisions carried into the sprint

1. **Keep the MDX-file content architecture** (do not migrate to a TS data model). Extend frontmatter schema with optional fields, backward-compatible, no break to existing parser/pages.
2. **Confidence label mapping.** Keep the existing 4-value enum (`high|medium|low|needs-verification`) that drives `ConfidenceBadge`, but relabel its display text to the sprint's vocabulary and add the 5th concept via a separate `evidenceBasis` field rather than fracturing the badge component:
   - `high` → **Terverifikasi kuat**
   - `medium` → **Didukung sumber**
   - `low` → **Terbatas**
   - `needs-verification` → **Belum cukup bukti**
   - "Diperdebatkan" is expressed per-claim in the Claim Ledger (status field) rather than as a top-level badge color.
3. **No `npm test`.** Editorial validation is added as `npm run check:editorial` (Phase 13) and becomes the QA gate alongside lint/typecheck/build.

## Verification log appended in final report

See `nali_editorial_trust_source_archive_sprint_report.md` for post-change lint/typecheck/build + `check:editorial` results.
