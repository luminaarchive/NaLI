# Operations Runbook: Document Engineering QA

This procedure is for NaLI CP1 founder/admin local QA artifacts only. It must not be connected to public downloads, paid export, upload, payment checkout, or source verification.

## Active V8 Generator

From the repository root:

```bash
npm install
node scratch/generate_reference_journal_v8.cjs
ls -lah ~/Downloads/NaLI-QA
```

The V8 script generates `peregrine`, `obsidian`, and `zephyr` outputs in `.html`, `.md`, `.txt`, `.pdf`, and `.docx` formats. It writes only to `~/Downloads/NaLI-QA/`, with `/tmp/nali-qa/` as fallback. Generated documents must never be staged.

If Chromium is absent on a QA machine, install only Playwright's local rendering browser runtime:

```bash
npx playwright install chromium
```

## Rendering Boundary

- PDF uses `src/lib/reports/journalHtmlTemplate.ts` with local Playwright rendering in `src/lib/reports/journalHtmlPdfRenderer.ts`.
- Playwright remains local QA tooling and must not be imported by public routes or client components.
- DOCX uses `src/lib/reports/journalDocxRenderer.ts` and structured article data rather than a markdown dump.
- The hard capability registry is `src/lib/reports/journalModelCapabilities.ts`.
- Public/user PDF and DOCX export remains locked regardless of local founder/admin artifact generation.

## V8 Model Gap Gate

| Tier      | Required PDF page target | Required visible capabilities                                                                                                                            |
| --------- | -----------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Peregrine | 4-5 for the rich fixture | Starter badge, compact sections, one main table and one figure plate, short limitations, upgrade nudge; no audit or premium editorial sections           |
| Obsidian  |                     7-10 | Evidence Audit badge, measurement tables, evidence sufficiency, cannot-conclude, data risk register, methodological vulnerability, subtle Zephyr note    |
| Zephyr    |                    10-14 | Premium badge/opener, integrated discussion, refined captions, exclusive editorial figure/table, revision notes, reviewer-readiness checklist, no upsell |

The DOCX design targets are 4-6 pages for Peregrine, 9-12 for Obsidian, and 12-16 for Zephyr. Confirm DOCX layout visually only when a compatible office renderer is available; automated tests still verify structured content and tier ownership.

## Integrity Inspection

For every output:

- Confirm the badge and section set correspond to its tier.
- Confirm fixture text, tables, and figures remain labeled as supplied/local QA and not externally verified.
- Confirm no fabricated DOI, ISSN, species identity, coordinates, photo, or verified evidence is claimed.
- Confirm source verification remains inactive and public export remains locked.
- Confirm upgrade notes communicate real capabilities without payment activation, scarcity, or deceptive pressure.
- Confirm requests carrying guest identifiers do not place them in URLs or ordinary request logs; the balance endpoint uses a POST body for this reason.

## V7 Historical Note

V7 remains a historical local document-engineering checkpoint. Its 6-page Peregrine and two 8-page paid-tier PDFs did not meet monetization differentiation requirements; use V8 for current tier QA.

## Safety Gates

- Human Testing remains `PAUSED`.
- Midtrans remains `DEFERRED`; do not activate payment here.
- Paid Launch remains `NO-GO`.
- Public/user PDF and DOCX export remains `LOCKED / INACTIVE`.
- Upload and source verification remain inactive.
- Never stage QA artifacts, temporary previews, `.env.local`, service keys, payment secrets, access values, hashes, or guest session values.

## Verification

Before committing document differentiation work, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
node --test tests/reports/*.test.cjs
```
