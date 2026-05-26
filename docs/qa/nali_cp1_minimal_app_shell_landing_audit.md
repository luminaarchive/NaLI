# NaLI CP1 Minimal App-Shell Landing Audit

## Current Status

| Control                           | State              |
| --------------------------------- | ------------------ |
| Human Testing                     | PAUSED             |
| Midtrans                          | DEFERRED           |
| Paid Launch                       | NO-GO              |
| Public/user PDF/DOCX export       | LOCKED / INACTIVE  |
| Upload API                        | INACTIVE / BLOCKED |
| Source verification               | INACTIVE           |
| Single Report Product             | IMPLEMENTED / GO   |
| Report Balance Architecture       | IMPLEMENTED / GO   |
| Report Balance Ledger Persistence | IMPLEMENTED        |
| Minimal App-Shell Landing Refresh | IMPLEMENTED        |
| Payment Activation                | NOT IMPLEMENTED    |
| Public Premium Activation         | NOT IMPLEMENTED    |
| User-facing model selector        | REMOVED / HIDDEN   |

## Why The Landing Was Simplified

The previous homepage composed multiple promotional and preview sections before the primary task. The public CP1
product is now one action: start a report. The refreshed page makes that action immediate and keeps honesty signals
nearby without requiring a beginner to understand internal processing tiers or inactive infrastructure.

## UX Principle

NaLI uses a minimal task-launcher principle: simple navigation, a centered question, one prominent action module, short
intent chips, compact trust/status copy, and a readable footer. NaLI does not copy Manus branding, wording, layout,
typography, footer, or visual identity; its implementation uses NaLI's own green, field-note, and evidence-boundary
language.

## Homepage Structure

- Lightweight public navigation: `Buat Laporan`, `Harga`, `Panduan`, and status entry.
- Headline: `Mau bikin laporan apa?`
- Subhead: draft assistance for observation, practicum, and KKN with clear evidence boundaries.
- Large launcher card that safely routes into the existing `/create-report` validation flow.
- Quick chips for `Laporan Observasi`, `Praktikum Biologi`, `Laporan KKN`, and `Cek Batas Bukti`.
- Compact truth strip stating payment, upload, and source verification are not active.
- Three short examples, three short work steps, and an explicit no-fake-evidence/no-fake-citation reminder.
- Inactive package glimpse using the public `Laporan` unit only.

## Footer Structure

The shared public footer keeps three compact groups:

- Produk: report creation, pricing, and guidance.
- NaLI: evidence boundary, academic integrity, and existing privacy entry.
- Status CP1: payment, upload, and source verification remain inactive.

It contains no public model selector, fake purchase history, fake balance, or fake social proof.

## Mobile Behavior

- Navigation, launcher CTA, quick chips, workspace menu controls, and footer links use at least 44px touch height.
- Chips use a wrapping flex layout for 360px and 430px widths.
- Status labels wrap without becoming an overlapping banner.
- Pricing buttons remain disabled and readable.
- The report workspace keeps its existing mobile composer, integrity control, and starter/free truth copy.

Rendered smoke QA passed for `/`, `/create-report`, and `/pricing` at both 360px and 430px. All six captures showed
no horizontal overflow, no internal model selector or model name, no fake balance, no checkout link, and key action
targets of at least 44px. Screenshots were generated only in `/tmp/nali-qa/`, outside the repository.

## Performance Notes

- The homepage no longer mounts the former video background, product preview, or large feature showcase composition.
- The new page remains static/server-rendered except for the existing safe query-to-workspace launcher interaction.
- No animation library or heavy frontend dependency was added.

## Dormant Feature Truth Audit

- Payment and checkout: inactive.
- Midtrans: deferred.
- Public paid generation: inactive.
- Public PDF/DOCX export: locked.
- Upload API: inactive/blocked.
- Source verification: inactive.
- Paid balance: never fabricated; persistence starts at zero.
- Public model selector: remains removed.

Founder manual testing is not required before agent verification.
