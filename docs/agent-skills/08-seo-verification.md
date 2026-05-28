# SEO Verification

Guidelines to check SEO tags, metadata, and crawl rules.

## SEO Policy

- **Noindex tags**: Ensure `/login`, `/register`, `/auth/callback`, `/logout`, and `/auth/auth-code-error` pages are configured with `noindex, nofollow` to prevent crawling.
- **Heading hierarchy**: A single `<h1>` tag must be present on every page.
- **Sitemap**: `/sitemap.xml` must map only public routes. Exclude all administrative or callback pages.
- **Robots**: `/robots.txt` must disallow indexing of private or internal URLs.

## Verification Checklist

- **Execute SEO checks**: Run `npm run agent:seo-smoke` to validate sitemaps, robots.txt, canonical links, and noindex headers.
- **Alternate check**: Run the node assertions `node --test tests/reports/seo-og-metadata.test.cjs`.
