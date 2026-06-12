# NaLI Humanized Full Site Copy Report

Checked at: 2026-06-12

## Public pages humanized

- Homepage /
- /articles and article detail pages
- Category pages: /alam, /sejarah, /investigasi
- /seri
- /arsip-sumber and source detail pages
- /metodologi, /koreksi, /pedoman-sumber, /lisensi-foto
- /tentang, /manifesto, /kontak
- /catatan-lapangan, retained route, visible title remains Catatan Riset
- /peta-eksplorasi, visible copy frames it as an index, not expedition tracking
- Admin-facing editor copy touched where visible to founder

## Components touched

- Article detail page
- Footer
- PageHeader
- SourceArchive
- Admin PostEditor
- Shared content types and content loader

## Article work

- Article count checked: 32
- Articles substantially rewritten: 31
- Articles preserved with light cleanup: 1
- Published HOLD articles left: 0
- Source entries humanized: 146

## Checks at report creation

- Em dash removal result: clean in repository text scan
- Banned template phrase removal result: clean in public content scan
- Visual completion result: 3 displayed licensed image records and 31 internal explanatory diagrams
- External visual evidence links retained: 24
- Editorial validation: passed
- Full QA status: passed, lint, typecheck, editorial validation, build, test-if-present, and route smoke checks

## Files changed

- content/articles/*.mdx, 32 article files audited and updated
- content/sources/*.mdx, 146 source note bodies humanized without changing source metadata
- app/articles/[slug]/page.tsx, added internal diagram rendering and removed placeholder dash fallbacks
- lib/types.ts and lib/content.ts, added ArticleDiagram support
- scripts/validate-editorial-content.mjs, stricter editorial, visual, em dash, and quality checks
- app/page.tsx, app/alam/page.tsx, app/catatan-lapangan/page.tsx, app/arsip-sumber/*, app/peta-eksplorasi/page.tsx, public copy cleanup
- components/Footer.tsx, components/PageHeader.tsx, components/SourceArchive.tsx, components/admin/PostEditor.tsx, visible copy and fallback cleanup
- README.md, CLAUDE.md, docs/nali_public_copy_trust_audit.md, stale framing removed
- docs/nali_full_article_quality_audit.md, docs/nali_article_visual_completion_report.md, docs/nali_article_quality_rewrite_report.md, docs/nali_humanized_full_site_copy_report.md, sprint reports

## Visual design preservation note

Visual identity was preserved. The only article UI addition is a restrained Diagram penjelas block using existing dashed borders, mono metadata, ink-wash background, and the current article spacing rhythm. No palette, typography scale, card radius, nav style, footer style, or homepage composition was redesigned.

## Known limitations

- Most new article visuals are internal explanatory diagrams rather than newly sourced public-domain photos. This satisfies the no-unlicensed-image rule while keeping every article visually complete.
- Existing external visual evidence links remain link-only where license terms are unclear.
- The route slug /catatan-lapangan remains for link stability, but the visible label is Catatan Riset.
