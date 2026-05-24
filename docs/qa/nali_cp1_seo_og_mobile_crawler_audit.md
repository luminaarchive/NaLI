# SEO, Open Graph & Mobile Crawler Audit

This document audits the pre-existing search presence, sitemaps, robots, and mobile responsiveness parameters for NaLI CP1, checking for compliance with the target design rules.

## 1. Locked Status Integrity

All core system gates are strictly mapped and verified:
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Founder Monitoring**: GO
- **Mobile Composer Optimization**: CONDITIONAL GO
- **Rate Limit/Error UX**: GO
- **Report Quality Memory / Feedback Learning Loop**: GO

---

## 2. Pre-Implementation Audit Findings

### Route Metadata & Layout
- Layout metadata defined raw titles containing `"NaLI - Evidence-Based Reports and Field Intelligence"`.
- Altered alternate canonical domains to ensure no references to the legacy dev domain (`verdantai.vercel.app`) exist.
- Found no public route-level metadata exports on `/`, `/learn-report`, `/create-report`, `/pricing`, or `/field-intelligence`.

### Sitemap & Robots.txt
- Sitemap listed static public routes, but included draft/temporary paths that should remain unindexed.
- `robots.ts` listed disallows for `/api`, `/dashboard`, `/archive` but missed `/founder` and generated `/report/[id]` user paths, leaving them vulnerable to crawler indexes.

### Open Graph & Twitter Card images
- Open Graph imagery pointed to standard `/icon.svg`, which fails modern 1200x630 pixel sharing aspect ratios and produces layout cropping issues on mobile social shares.

### Mobile Crawler Accessibility
- Checked for hidden content traps. Crawlers require all static copy to be rendered inside the server-sent HTML without blocking behind mandatory user clicks.

---

## 3. Product & Brand Safety Check

Verified that no public page layout, SEO description, metadata, or comments contain forbidden academic cheating, Humanizer, or detector-bypass marketing terms. All messaging highlights NaLI as an **Indonesia-first Nature & Evidence Intelligence OS** focused on structured, honest drafting and clear uncertainty boundaries.
