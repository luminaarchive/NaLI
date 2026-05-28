# NaLI Public Layer: SEO Indexing & Crawl Map

This document maps all public, indexable pages of the NaLI Nature & Evidence Intelligence platform, including metadata standards, robots protocols, and structured schemas to maximize search engine discoverability.

## Indexable Routes Map

The following routes are configured for public indexing:

| Route URI | SEO Priority | Change Frequency | Primary Target Keywords (Indonesian) | JSON-LD Structured Schema |
| :--- | :--- | :--- | :--- | :--- |
| **`/`** | 1.0 (Highest) | Weekly | *laporan observasi, buat laporan lingkungan, nali ai* | `WebSite`, `Organization` |
| **`/learn-report`** | 0.8 | Weekly | *cara membuat laporan observasi, batas bukti laporan, evidence table* | `Article`, `FAQPage` |
| **`/create-report`** | 0.9 | Weekly | *aplikasi pembuat laporan praktikum, draf laporan otomatis* | `SoftwareApplication` |
| **`/pricing`** | 0.5 | Monthly | *harga nali ai, paket laporan observasi* | `Product` |
| **`/field-notes`** | 0.6 | Weekly | *catatan lapangan geografi, laporan kkn lingkungan* | `WebPage` |
| **`/field-intelligence`** | 0.5 | Monthly | *field intelligence data, monitoring spesies* | `WebPage` |

---

## Non-Indexable (Private) Routes

The following patterns are strictly excluded from indexing to protect user data, draft access keys, and tokenized credentials. They are defined in the `noindex` list within `src/lib/seo/siteMetadata.ts` and disallowed in `robots.txt`:

1. **`/report/[id]`** &middot; Private shared draft workspaces. Excluded to prevent search engines from index-caching private study materials or user notes.
2. **`/api/**`** &middot; Backend API interfaces, feedback loops, and checkout gateways.
3. **`/founder`** &middot; Internal operational administration portal. Contains a strict `noindex` robots meta configuration.
4. **`/s/[sessionId]`** &middot; Temporary chat session links.

---

## Technical SEO Rules

1. **Canonical Base URL**: Always resolves strictly to `https://naliai.vercel.app` (fallback defaults strictly protect against outdated domains like `verdantai`).
2. **Dynamic Sitemap & Robots**: Fully functional via Next.js metadata routes:
   - Dynamic Sitemap: [sitemap.xml](file:///Users/macintosh/Documents/NaLI/src/app/sitemap.ts)
   - Dynamic Robots: [robots.txt](file:///Users/macintosh/Documents/NaLI/src/app/robots.ts)
3. **Structured Schemas**: JSON-LD graph generated dynamically at compile-time on `/` homepage using `buildJsonLdGraph()`. Escaped properly to prevent script injection.
4. **Social Sharing Cards**: Edge pre-rendered OG/Twitter images matching the 1200x630 dimension specifications with appropriate ecolological branding.
   - [opengraph-image.tsx](file:///Users/macintosh/Documents/NaLI/src/app/opengraph-image.tsx)
   - [twitter-image.tsx](file:///Users/macintosh/Documents/NaLI/src/app/twitter-image.tsx)
