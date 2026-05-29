# Google Search Console Verification & Setup Guide

This document details the manual dashboard steps required to register NaLI on Google Search Console, submit its sitemap, and check indexing eligibility.

## Current Setup Status
`MANUAL GOOGLE SEARCH CONSOLE STEP REQUIRED`

---

## Technical Readiness Verification

NaLI is fully prepared at the application layer for search engine indexing:
- **Canonical URLs**: Mapped to `https://naliai.vercel.app` to prevent duplicate indexation.
- **Dynamic Sitemap**: Dynamic sitemap is located at `/sitemap.xml` and includes all indexable public paths.
- **Robots Directives**: `/robots.txt` points to the sitemap and allows public route crawling while blocking admin and API endpoints.
- **Structured JSON-LD**: Includes Breadcrumbs, Site Search, and Organization schemas.
- **Favicons**: Multi-resolution `favicon.ico`, `icon.svg` vector logo, and Apple touch icons are in place.

---

## Setup Instructions

### 1. Add Property in Search Console
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Click **Add property** in the property selector dropdown.
3. Select **URL prefix**:
   - Enter `https://naliai.vercel.app`.
   - Click **Continue**.

---

### 2. Verify Domain Ownership
Google will provide multiple verification methods. The meta tag method is recommended for Vercel:
1. Select the **HTML tag** option under verification methods.
2. Copy the `<meta name="google-site-verification" content="..." />` tag.
3. Provide the meta content token to the developer to add to the HTML head in `src/app/layout.tsx`.
4. Once deployed, click **Verify** in Search Console.

---

### 3. Submit Sitemap
1. Select the verified property.
2. Navigate to **Index** -> **Sitemaps** in the left navigation sidebar.
3. Enter `sitemap.xml` in the text box under **Add a new sitemap**.
4. Click **Submit**.
5. Refresh the page to confirm that the sitemap status shows **Success**.

---

### 4. URL Inspection & Indexing Request
1. Enter the root URL `https://naliai.vercel.app` in the **URL Inspection** search bar at the top of the dashboard.
2. Click **Test Live URL** to confirm that Googlebot can fetch the page without any crawl or CSS blocks.
3. Click **Request Indexing** to submit the homepage to the crawling queue.
4. Repeat this process for the following public routes:
   - `/create-report`
   - `/learn-report`
   - `/pricing`
   - `/field-notes`
   - `/field-intelligence`

---

### 5. Search Engine Limits Warning
- **Indexing & Crawl Times**: Google controls indexing times and schedules; indexing may take anywhere from a few hours to several days.
- **Search Sitelinks & Appearance**: Google determines whether to display dynamic site search boxes or sitelinks in search results; they cannot be forced programmatically.
- **Rank Placement**: Search ranking positions depend entirely on Google's search algorithms and site content relevance; no immediate search rank is guaranteed.
