# SEO & Open Graph Operations Runbook

This operations guide outlines how to maintain search index settings, sitemaps, robots rules, and Open Graph assets in NaLI.

---

## 1. What It Is and What It Is Not

- **It IS**: A set of Next.js static metadata declarations, robots rule exports, and edge-rendered sharing banners.
- **It IS NOT**: An active keyword tracking service or search console rank dashboard.
- **It IS NOT**: A dynamic sharing configuration mapper for custom user-generated reports. Generated reports are kept private by default.

---

## 2. Sitemap Update Procedure

When releasing new public-facing pages:
1. Open `src/lib/seo/siteMetadata.ts`.
2. Add the new route to `siteMetadata.routes` with a designated title and description.
3. Open `src/app/sitemap.ts`.
4. Append the new public URL object inside the returned array:
   ```typescript
   {
     url: `${base}/your-new-route`,
     lastModified,
     changeFrequency: "weekly",
     priority: 0.7,
   }
   ```
5. Do NOT include private pages, user-generated report URLs, or admin console links.

---

## 3. Robots.txt Adjustments

If a newly created page contains user data, private logs, or internal tools:
1. Open `src/lib/seo/siteMetadata.ts`.
2. Add the route prefix to `noindexPatterns` (e.g., `/your-private-prefix`).
3. Verify that the pattern is blocked by running:
   ```bash
   node --test tests/reports/seo-og-metadata.test.cjs
   ```

---

## 4. Verification Checklists

Before pushing commits:
- Run `npm run verify` or specifically:
  ```bash
  node --test tests/reports/seo-og-metadata.test.cjs
  ```
- Ensure no files in `src/app/` (outside `src/app/founder/`) feature links pointing to `/founder`.
- Verify the build logs confirm that `/founder` and `report/[id]` are dynamically rendered and marked `noindex`.
