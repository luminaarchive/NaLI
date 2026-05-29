# Google Search Console Verification & Setup Guide

This document guides the steps required to verify NaLI on Google Search Console, submit the sitemap, and check search eligibility.

## Setup Instructions

### 1. Add Property in Search Console
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Click **Add property**.
3. Choose **URL prefix** (or Domain if DNS verification is possible):
   - Enter `https://naliai.vercel.app` (or your custom production domain).

### 2. Verify Domain Ownership
If using **URL Prefix**:
1. Google will provide an HTML verification file or an HTML meta tag.
2. If using the meta tag:
   - Provide the tag token to the developer to add to `src/app/layout.tsx`.
   - Do not invent a fake verification token.
3. Click **Verify** in Search Console.

### 3. Submit Sitemap
1. Once verified, select the property.
2. Navigate to **Index** -> **Sitemaps** in the left sidebar.
3. Enter `sitemap.xml` under **Add a new sitemap**.
4. Click **Submit**.
5. Verify that the status shows **Success**.

### 4. Indexation Request (URL Inspection)
1. Use the **URL Inspection** search bar at the top of the Search Console.
2. Enter the homepage URL `https://naliai.vercel.app`.
3. Click **Test Live URL** to confirm there are no crawl blocks.
4. Click **Request Indexing** to queue the homepage for indexing.
5. Repeat for key public landing pages:
   - `/create-report`
   - `/learn-report`
   - `/pricing`
   - `/field-notes`
   - `/field-intelligence`

### 5. Check Brand Indexation
1. Search engines control indexing times.
2. Periodically run the query: `site:naliai.vercel.app` in Google search.
3. Verify that indexed results list the correct titles and descriptions.
