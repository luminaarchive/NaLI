# NaLI Production QA, UX, SEO, and Trust Audit Report

Checked at: 2026-06-13
Audited by: Antigravity (Advanced Agentic Coding Pair)
Live Site: https://nalijournal.vercel.app

---

## 1. Summary

A comprehensive production QA, UX, SEO, and Trust audit of the live NaLI website and repository was conducted. The site is a high-contrast open-source evidence journal with an "archive-ink" design system. The audit confirms that the core site is highly functional, responsive, and adheres strictly to its design principles.

No conflicts with Claude Code's ongoing `/jurnal` rebuild have occurred. No files in the forbidden list were modified, and the `/jurnal` routes were excluded from manual inspection to prevent overlapping tasks. All checks have been done in a read-only manner.

---

## 2. Routes Checked

A route smoke test was executed against `https://nalijournal.vercel.app`, verifying that all core public paths return HTTP 200 and behaves as expected.

### Core Routes (Passed 200)
- `/` (Homepage)
- `/articles` (Article Listing)
- `/arsip-sumber` (Source Archive Listing)
- `/seri` (Series List)
- `/metodologi` (Methodology Statement)
- `/pedoman-sumber` (Source Guidelines)
- `/lisensi-foto` (Photo Licensing Registry)
- `/koreksi` (Corrections Policy)
- `/tentang` (About Page)
- `/manifesto` (Manifesto Page)
- `/kontak` (Contact Page)
- `/alam` (Alam Category)
- `/sejarah` (Sejarah Category)
- `/investigasi` (Investigasi Category)
- `/catatan-lapangan` (Field Notes / Catatan Riset)
- `/peta-eksplorasi` (Indeks Eksplorasi)
- `/sitemap.xml` (Dynamic XML Sitemap)
- `/robots.txt` (Robots Directives)

### Gated/Error Routes (Verified Behavior)
- `/admin` -> Returns a gated redirection (HTTP 307/308 or redirect to `/admin/login`) protecting the Supabase dashboard.
- `/this-route-does-not-exist-xyz` -> Returns HTTP 404 with a styled page.

---

## 3. Critical Issues

- **None Found**: The production website successfully handles page requests, renders correct styles, displays dynamic content, and manages light/dark theme toggles perfectly. There are no broken layouts, fatal JS errors, or application crashes.

---

## 4. Article Quality Findings

A sample of 10 articles from `content/articles/` was checked.

### Article Quality Table

| Slug | Visible Visual | Credit Present | Reads Real | Template Prose | Claim Ledger | Source List | Limitations | Main Weakness | Recommended Fix |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|---|
| `harimau-jawa-lazarus-species` | Yes | Yes | Yes | No | Yes | Yes | Yes | Supabase post editor does not support editing/saving Claim Ledgers. | Update the `/admin` editor to support structured arrays for Claim Ledgers. |
| `badak-jawa-benteng-terakhir` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (587 words) is below the 900-word quality floor. | Expand description of Ujung Kulon ecology to reach the 900-word limit. |
| `tambora-1815-iklim-dunia` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (499 words) is below the 900-word quality floor. | Add history of Sumbawa pre-eruption and details on direct casualties. |
| `jakarta-tenggelam-penurunan-tanah` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (539 words) is below the 900-word quality floor. | Detail the hydrological research of H.Z. Abidin (2015) in depth. |
| `anoa-sulawesi-fragmentasi-hutan` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (632 words) is below the 900-word quality floor. | Provide additional data on the conservation impact of Wallacea mining. |
| `api-biru-kawah-ijen` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (637 words) is below the 900-word quality floor. | Expand on the sulfur chemistry and mining history of Ijen. |
| `coelacanth-sulawesi-fosil-hidup-laut-dalam` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (552 words) is below the 900-word quality floor. | Add comparative analysis between Comoros and Indonesian species. |
| `banda-neira-pala-kekerasan-kolonial-arsip` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (574 words) is below the 900-word quality floor. | Elaborate on 17th-century VOC documents and Banda oral history. |
| `samalas-1257-babad-geologi` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (470 words) is below the 900-word quality floor. | Add translated quotes from Babad Lombok to enrich the narrative. |
| `toba-supervolcano-perdebatan-dampak` | Yes | Yes | Yes | No | Yes | Yes | Yes | Word count (491 words) is below the 900-word quality floor. | Deepen the volcanic bottleneck theory discussion. |

### Key Article Quality Observations
1. **Word Count Compliance**: 30 out of 32 articles currently in `content/articles` trigger word-count warnings from the validator script because they fall below the 900-word quality floor (usually between 450–650 words of pure body prose).
2. **Visual Evidence**: Because of strict photo copyright rules, most articles display custom-designed SVG vector diagrams (e.g. `/images/article-diagrams/badak-jawa-benteng-terakhir.svg`) instead of photos. These diagrams are highly clean, fully credited, and render properly in the HTML.
3. **No Fake Fieldwork / Template Prose**: The articles read like objective summaries of secondary scientific and historical data. Banned template statements and first-person fieldwork claims have been completely removed.

---

## 5. Source Archive Findings

A sample of 10 source entries from `content/sources/` was checked.

### Source Archive Table

| Slug | Source Title | URL Visible | DOI/Archive Link | Reliability Note | Limitations | Usage Shown | Main Weakness | Recommended Fix |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|---|
| `harimau-jawa-oryx-2024` | Wirdateti dkk. (2024) | Yes | Yes | Yes | Yes | Yes | Interpretation is disputed. | Ensure rebuttal study is linked. |
| `harimau-jawa-oryx-rebuttal-2024` | No reliable evidence supports the presence of the Javan tiger | Yes | Yes | Yes | Yes | Yes | Rebuttal only criticizes, does not prove absence. | Group with original study in listing. |
| `nagarakretagama-1365` | Nagarakretagama (Desawarnana) - Mpu Prapanca, 1365 | Yes | No | Yes | Yes | Yes | URL is a generic UNESCO page. | Update URL to the specific Memory of the World listing. |
| `babad-diponegoro` | Babad Diponegoro - autobiografi Pangeran Diponegoro | Yes | No | Yes | Yes | Yes | URL is a generic UNESCO page. | Update URL to the specific Diponegoro chronicle listing. |
| `arsip-voc-anri` | Arsip VOC di ANRI | Yes | No | Yes | Yes | Yes | URL is ANRI's homepage, not VOC database search. | Point directly to the Sejarah Nusantara VOC archives subpage. |
| `iucn-red-list-badak-jawa` | IUCN Red List - Rhinoceros sondaicus | Yes | Yes | Yes | Yes | Yes | URL goes to PDF search, not live Red List page. | Update URL to the live Web Red List record. |
| `tarsius-behavior-pmc` | Gursky-Doyen (2010) | Yes | Yes | Yes | Yes | Yes | Focuses on a single species (spectral tarsier). | Note that it may not apply to all tarsiers. |
| `pnas-samalas-1257-lavigne` | Lavigne dkk. (2013) | Yes | Yes | Yes | Yes | Yes | Highly technical geological paper. | Add layperson summary in source body. |
| `jakarta-subsidence-abidin-2015` | Abidin dkk. (2015) | Yes | Yes | Yes | Yes | Yes | Uses data up to 2011; out-of-date telemetry. | Add warning note regarding static nature. |
| `jambeck-plastic-waste-science-2015` | Jambeck dkk. (2015) | Yes | Yes | Yes | Yes | Yes | Uses 2010 models; ranking often misused. | Explicitly warn against misinterpreting ranking. |

### Key Source Archive Observations
1. **Generic URLs**: Historical sources and ancient archives (like `babad-diponegoro` or `nagarakretagama-1365`) link to generic homepages (e.g., `unesco.org` or `anri.go.id`) rather than specific digitized collections or catalog numbers.
2. **Backfilled Metadata**: The deep archive metadata (reliability levels, key claims, check dates) is present and correctly structured for all checked entries.

---

## 6. SEO and Metadata Audit

- **Title Tags**: Clean, uses standard layout templating (`Page Title | NaLI by NatIve`). No duplication or missing title tags found.
- **Meta Descriptions**: Set correctly. Every route has a tailored descriptive text in its page metadata.
- **Canonical URLs**: Canonical links are specified using the Next.js `alternates: { canonical: ... }` API.
- **Open Graph / Twitter Cards**: Configured dynamically. Articles map summaries to OG/Twitter descriptions, and list published time, modified time, author, and tags. Large images are preferred for Twitter.
- **Sitemap.xml**: Auto-generates at `/sitemap.xml` dynamically including articles, sources, and static pages.
- **Robots.txt**: Exposes the sitemap path.
  > [!WARNING]
  > **Robots.txt Security**: Robots.txt lacks `Disallow` rules for `/admin` and `/api/*`. Crawlers should be explicitly barred from indexing the admin dashboard and tracker endpoints.

---

## 7. Performance and Accessibility Audit

- **Performance (LCP, INP)**:
  - Font optimization via `next/font/google` prevents layout shifts (uses `display: 'swap'`).
  - Image loading via `next/image` ensures automatic compression and lazy loading.
  - The homepage uses a dithered WebGL shader (`WaveHero`) which runs efficiently and responds to user prefers-reduced-motion queries.
- **Accessibility**:
  - Semantic HTML (elements like `<header>`, `<main>`, `<footer>`, `<figure>`, `<figcaption>`) is correctly applied.
  - Text alternatives (`alt`) are mandatory for all article visual assets in MDX.
  - Buttons and link tags contain descriptive labels or aria-labels (e.g. `aria-label="Ganti ke mode gelap"`, `aria-label="NaLI by NatIve, beranda"`).
  - High-contrast monochromatic typography of the "archive-ink" theme is clean and readable in both light and dark modes.

---

## 8. Broken Links or Suspected Broken Links

- **Contact Email**: The email `halo@nali.native.id` referenced in `lib/site.ts`, `app/kontak/page.tsx`, and `app/lisensi-foto/page.tsx` is currently a placeholder (the founder has not wired up a live mailbox for this domain).
- **Source detail URLs**: As noted in the Source Archive findings, several primary history sources link to generic root URLs instead of specific catalog items.

---

## 9. No-Conflict Confirmation

- **No files related to `/jurnal` were edited or touched**.
- **No changes to forbidden directories/files were made**.
- All tasks were done through read-only inspection of files and crawling the public production website, guaranteeing zero code interference with Claude Code's ongoing rebuild of the Jurnal features.

---

## 10. Recommended Next Fixes

Once Claude Code completes the `/jurnal` rebuild and merges it into main, the following actions are recommended for the next sprint:

### Priority 1: Admin Editor Fields (High)
Upgrade the `/admin` dashboard editor component (`components/PostEditor.tsx` or similar) to support adding and editing the `claimLedger`, `limitations`, and `evidenceBasis` fields. Currently, these fields are only present in MDX files and are not exposed in the editor UI.

### Priority 2: Robots.txt Disallow (Medium)
Update `app/robots.ts` to block indexing of `/admin` and `/api/*` routes to secure the admin portal and save crawl budget:
```typescript
rules: {
  userAgent: "*",
  allow: "/",
  disallow: ["/admin", "/api"],
}
```

### Priority 3: Article Content Expansion (Medium)
Expand the body text of the 30 articles that fall below the 900-word quality floor to fulfill NaLI's editorial standards and improve search engine rankings.

### Priority 4: Specific Source URLs (Low)
Refine URL mappings for primary archives and historical sources to point to specific database entries rather than root domains.
