# `/jurnal` UI/UX Benchmark vs. Nous Research

**Phase 1 — Research & Analysis only. No code changed.**
Reference: <https://nousresearch.com/> (home, `/blog/`, post detail) · desktop 1440px + mobile 390px, computed-CSS inspected.
Subject: NaLI `/jurnal` catalog + `/jurnal/[slug]` detail (live `nalibynative.vercel.app/jurnal`, matching current `main`).
Evidence screenshots: `docs/assets/nous-benchmark/`.

---

## The one-sentence finding

**Nous and NaLI already speak the same design language — single-ink monochrome on white paper, monospace type, dashed rules, duotone photos — so NaLI does not need a redesign. It needs the discipline that makes Nous read as premium: a tiny type scale, one ink, one border system, and a calmer rhythm. The gap is execution and consistency, not concept.**

This is the most important framing in the report. We are not importing a foreign aesthetic. We are tightening a system NaLI already owns.

---

## Executive Summary

### Overall comparison

| Dimension | Nous `/blog` | NaLI `/jurnal` | Verdict |
|---|---|---|---|
| **Core language** | Mono, single ink `#0071A9`, dashed rules, duotone photos | Mono (IBM Plex), single ink teal `#0E8268`, dashed rules, `.duotone-ink` | **Shared DNA** |
| **Type sizes on the page** | ~3 (13 / 15 / 16px) + rare 23/32px display | **9 distinct sizes in the card grid alone** (9.28 → 18px) | Nous: restraint |
| **Card anatomy** | Title + byline + excerpt (3 elements) | Cover + 2 badges + title + authors + journal + DOI + 3-line synopsis + 3 buttons + metadata toggle (~11 elements) | Nous: focus |
| **Border system** | One rule: `2px dashed` ink, square, flat | Mixed: `solid border-ink/10` cards, dashed page rules, `rounded` skeleton | Nous: consistency |
| **Ink discipline** | Strictly one ink + grey | Teal **+ a green "Peer Reviewed" badge** that breaks monochrome | Nous: cohesion |
| **Density / whitespace** | Airy, equal-height cards, big gaps | High-density "database dump", jagged heights | Nous: rhythm |
| **Responsive ≥1400px** | Clean 2-up | **Broken: 459px horizontal overflow, cross-column text collision** | Nous: robust |
| **Reading measure (detail)** | 820px (~110ch — too wide) | `68ch` prose | **NaLI better here** |
| **Footer / nav depth** | Minimal footer, 8 top links | Rich multi-column footer, full nav, **light/dark toggle** | **NaLI better here** |
| **Filter / search** | None | Faceted sidebar, live counts, sort, mobile drawer with focus-trap | **NaLI more capable** |

### Why Nous feels premium (the transferable principles)

1. **Extreme type-scale restraint.** The entire homepage runs on 13/15/16px. The eye never has to re-calibrate. Premium reads as *calm*, and calm comes from a 3–5 step scale, not 9+ ad-hoc sizes.
2. **One ink, no exceptions.** Everything — headings, body, links, icons, borders — is the same blue plus one grey. The monochrome is never "rescued" by a semantic color. It looks deliberate because it is total.
3. **One border, one shape.** `2px dashed` ink, square corners, no shadows, transparent fills. Every card is the same object. The repetition *is* the design.
4. **Cards carry less.** Title, who wrote it, one-paragraph teaser. Decisions (read it / don't) are made on three signals, not eleven. Whitespace does the ranking.
5. **Generous, even rhythm.** Equal-height cards, consistent gaps, large margins around the page title. Nothing is crammed; the grid breathes on a predictable beat.
6. **A signature motif used consistently.** The `OUTPUT 96 / SEED: …` machine-metadata block + small monoline icon appears in every homepage row. One repeated idea = identity.

### NaLI's biggest weaknesses (what to fix)

1. **A real, shipping responsive bug** — `/jurnal` overflows the page by ~459px and collides text across columns at ≥1400px (see Production Quality §1). This alone undercuts any "premium" claim on a wide monitor.
2. **Type-scale sprawl** — 9 sizes in the cards, four of them sub-11px (down to **9.28px**), which is both un-premium and an accessibility problem.
3. **Self-inconsistent design system** — the catalog opts out of NaLI's own dashed-rule signature (uses thin solid borders), introduces a green badge that breaks the single-ink rule, and the skeleton uses rounded corners the cards don't.
4. **Cover thumbnails fight each other** — full-color photos, grey document-scans, and text fallbacks sit side by side, turning the left rail into visual noise.
5. **Density without hierarchy** — every card shows everything at once, so nothing leads. The page reads as a data export, not a curated archive.

### What NaLI already does *better* than Nous (keep these)

- **Reading measure** on the detail page (`68ch` vs Nous's ~110px-wide 820px line — Nous is genuinely too wide / harder to read).
- **Functional depth**: real faceted search, live facet counts, sort, accessible mobile filter drawer (focus trap + scroll lock), empty state with reset, loading skeleton. Nous's blog has none of this.
- **A rich footer + full nav + working light/dark theme.** Nous is light-only with a near-empty footer.

> Net: this is **not** "NaLI is bad, Nous is good." NaLI is *more capable* and in places *more readable*. Nous is *more disciplined*, and discipline is what photographs as "premium." Adopt the discipline; keep the capability.

---

## Component-by-component comparison

For each: **Nous → NaLI → Why Nous feels better → Recommendation → Impact.**

### 1. Page header / hero
- **Nous:** One element — `NOUS BLOG` in the Mondwest pixel-display face, centered, ink-blue, big margins above/below. No eyebrow, no description. Straight into cards.
- **NaLI:** `PageHeader` = mono eyebrow ("KATALOG JURNAL DAN PUBLIKASI ILMIAH TERBUKA") + huge Fraunces `JURNAL` + a **4-line mono paragraph** + dashed rule. On mobile the description runs ~6 lines and pushes the first card far below the fold.
- **Why Nous feels better:** The title is the hero; nothing competes. NaLI's intro paragraph is editorially valuable but visually heavy and delays the content.
- **Recommendation:** Keep the big Fraunces `JURNAL` and eyebrow. **Shorten the description to one line** (move the "NaLI doesn't rewrite, only summarizes" caveat into a small note or the methodology link). Tighten header vertical padding on mobile.
- **Impact:** Medium. Faster path to content, stronger focal point, much better mobile first-impression.

### 2. Navigation
- **Nous:** Centered caps links, dashed rule beneath, 8 items, kebab on mobile. Active state is subtle.
- **NaLI:** Centered serif-caps links, dashed rule beneath, active item underlined, **plus a working light/dark toggle**, hamburger on mobile. Structurally *the same pattern, executed at parity or better.*
- **Why Nous feels better:** It mostly doesn't — this is a draw. NaLI's nav is arguably richer.
- **Recommendation:** No change needed. Confirm the active-underline has enough contrast in dark mode.
- **Impact:** Low. Already good.

### 3. Card — the central component
- **Nous:** `2px dashed` ink border, square, transparent, **no shadow**, ~10px padding. Three slots: uppercase ink **title**, top-right **byline** ("by Nous Research"), justified mono **excerpt** ending in "…". Equal height per row. Whole card is the link. Hover transitions `background / border / box-shadow / transform` over **0.3–0.4s**.
- **NaLI:** Horizontal layout — portrait cover (90–130px) on the left, content on the right: 2 badges (one **green**), title (Fraunces 18px), authors (mono, `truncate`), journal·year, DOI, 3-line synopsis, then an action bar (**Unduh PDF / Bagikan / Metadata▼**) and an expandable metadata panel. `border-solid border-ink/10`, `hover:shadow-sm hover:border-ink/30`, `transition-all duration-200`.
- **Why Nous feels better:** One object, three signals, one border, one ink, slow confident motion. NaLI's card asks the eye to parse ~11 things, in two type families, across 9 sizes, behind a border that contradicts the site's dashed signature, with a color that breaks the monochrome — and it's the card that overflows at ≥1400px.
- **Recommendation:**
  - Switch card borders to the **house dashed-ink rule** (align with `.hairline` / Nous), square, **drop the shadow** (use a border-color/`bg-ink-wash` hover instead).
  - **Demote the cover** to optional and uniform (see §6) or remove it from the list and show it only on detail.
  - **Cut the card to 4–5 signals**: badge (type), title, authors + journal·year, one-line synopsis, single primary action. Move DOI / volume / issue / license / "Bagikan" entirely into the detail page (they already live there).
  - Recolor the "Peer Reviewed" badge into the ink/grey system (e.g. an outlined ink chip), not green.
  - Add `min-w-0` to the flex content column (this also fixes the overflow bug — §Production §1).
  - Slow the hover to ~0.3s and make it a border/wash change, not a shadow.
- **Impact:** **Critical.** This single component defines the page; fixing it delivers most of the perceived-quality gain.

### 4. Grid / layout
- **Nous:** Even 2-column, equal-height cards, ~30px gaps, comfortable page margins. Calm, scannable.
- **NaLI:** `lg:grid-cols-[320px_1fr]` (sidebar + results), results `grid-cols-1` then `grid-cols-2` at **≥1400px**. At 1400–1480px the two horizontal cards are only ~502px each — too narrow for the dense content, so it **breaks** (§Production §1). Card heights are jagged because content length and cover presence vary.
- **Why Nous feels better:** Equal heights + uniform cards = predictable rhythm. NaLI's variable cards on a tight 2-up = arrhythmia and breakage.
- **Recommendation:** Either (a) keep a **single-column list** of slimmer, uniform horizontal cards at all widths (best for a scholarly catalog and avoids the 2-up breakpoint entirely), or (b) if 2-up is desired, switch to **vertical cards** (cover top / text below, like a real card grid) with `min-w-0` and equal heights via the grid. Do **not** keep dense horizontal cards in a 2-up.
- **Impact:** High. Removes the breakage and gives the page a steady beat.

### 5. Typography
- **Nous:** Mono workhorse (Courier / Courier Prime), Mondwest pixel face for display, ~3 sizes total. Tracking and sizes are consistent everywhere.
- **NaLI:** Fraunces display + IBM Plex Mono — a strong, characterful pairing — but the catalog uses **9 sizes** (`0.58 / 0.62 / 0.66 / 0.68 / 0.78 / 0.82 / 0.85 / 1rem / 1.125rem`) and ~five `tracking-*` values, several texts under 11px.
- **Why Nous feels better:** Fewer sizes = visual order. The reader's eye locks onto a rhythm instead of re-measuring every line.
- **Recommendation:** Define a **5-step type scale** (e.g. `11 / 12 / 14 / 18 / 28px` → label / meta / body / card-title / page-title) and map every catalog element onto it. **Nothing below 11px.** Pick two tracking values (tight for display, `0.14em` label for mono caps) and stop there.
- **Impact:** High. Cheapest, highest-leverage premium signal.

### 6. Cover images
- **Nous:** No per-card thumbnail on the blog. When images appear (home/detail) they get a single consistent duotone treatment.
- **NaLI:** Per-card covers are a **mix** of full-color photos, grey academic-PDF first-page scans, and text fallbacks — three visual registers in one rail. The `aspect-[3/4]` + `object-top` + `scale-[1.10]` also crops awkwardly, badly so on mobile (portrait box → wide banner).
- **Why Nous feels better:** Consistency. A blank dashed box repeated 24× looks more intentional than 24 mismatched thumbnails.
- **Recommendation:** Pick one policy: **(A)** drop covers from the *list* (show them only on detail) — simplest, most Nous-like, instantly calmer; or **(B)** force every cover through `.duotone-ink` so photos and scans share one tonal world, with a uniform aspect and a single typographic fallback. Avoid the current mixed-register rail.
- **Impact:** High. Removes the dominant source of visual noise.

### 7. Buttons / actions
- **Nous:** Effectively none in the list — the card *is* the action. Links are ink, underlined.
- **NaLI:** Up to three controls per card (`Unduh PDF` solid teal, `Bagikan`, `Metadata▼`) plus a 4-CTA cluster on detail. The solid teal button is fine; three controls per card is a lot of competing weight.
- **Why Nous feels better:** Zero in-card chrome → the content ranks itself. NaLI's triple-control bar adds weight and is where the layout crushes at 2-up.
- **Recommendation:** **One** primary action per card (open detail, or Unduh PDF). Move "Bagikan" and "Metadata" to the detail page. Keep button styling, just reduce count. Standardize button padding/height to one token.
- **Impact:** Medium-high. Less noise, fixes crowding, clearer affordance.

### 8. Forms (search / filter / sort)
- **Nous:** None on the blog.
- **NaLI:** Real faceted sidebar — search across 10 fields, live facet counts, sort, language/year/topic/publisher accordions, mobile drawer with focus-trap + scroll-lock. **Genuinely better and worth keeping.**
- **Why Nous feels better:** It doesn't. NaLI wins on capability.
- **Recommendation:** Keep the functionality; align the *styling* (input borders to dashed-ink, single control height, the 0.66–0.7rem label sizes onto the new scale). Make sure the sidebar's solid borders move to the unified border system.
- **Impact:** Medium (polish, not function).

### 9. Sidebar
- **Nous:** No sidebar.
- **NaLI:** Sticky filter sidebar (`320px`, `lg:sticky top-24`, bordered box). Useful, but its `border-solid border-ink/10 bg-ink-wash/10` is part of the border-system drift.
- **Recommendation:** Keep it; restyle to the unified dashed-ink border + consistent inner spacing scale. Consider letting the results area use the full width on very wide screens instead of forcing the fragile 2-up.
- **Impact:** Medium.

### 10. Detail page (`/jurnal/[slug]`)
- **Nous:** Centered serif/Mondwest title, single duotone hero, then readable single-column body. (Flaw: 820px-wide line length is too long.)
- **NaLI:** Centered cover + title + badges + authors + dominant download CTA cluster + bibliography table + synopsis / why-it-matters / topics / related — thorough and well-organized, with a tighter `68ch`-ish measure.
- **Why Nous feels better:** Mostly it doesn't; NaLI's detail page is information-rich and better-measured. Nous wins only on *restraint of the hero* and on consistent type sizing.
- **Recommendation:** Apply the same type-scale + border unification here; otherwise this page is in good shape. Trim the 4-button CTA cluster to a clear primary + secondary.
- **Impact:** Low-medium. Already strong.

### 11. Mobile
- **Nous:** Kebab menu, two-line pixel title, single-column full-width dashed cards, byline drops below title. Reaches content fast.
- **NaLI:** Logo + LIGHT toggle + hamburger, **long header description** before content, single-column cards with cover-banner-on-top (awkward crop) + dense content + filter drawer trigger.
- **Why Nous feels better:** Less header weight, simpler cards, faster to content.
- **Recommendation:** One-line header on mobile; fix cover aspect for the stacked layout (or drop list covers per §6); ensure the simplified card (§3) carries to mobile.
- **Impact:** High (mobile is the dominant channel for X/IG/TikTok referrals).

### 12. Footer
- **Nous:** Minimal / near-absent.
- **NaLI:** Rich multi-column mono footer. **Better for navigation and SEO.**
- **Recommendation:** Keep. No change.
- **Impact:** Low (already a strength).

### 13. Hover / micro-interactions
- **Nous:** Slow, confident `0.3–0.4s` transitions on border/background/shadow/transform.
- **NaLI:** `transition-all duration-200` → shadow + border. Faster, lighter, `transition-all` is broad.
- **Recommendation:** Move to ~`0.3s`, transition specific properties (border-color, background) not `all`, and prefer a `bg-ink-wash`/border change over a shadow (shadows are off-system for the archive look).
- **Impact:** Low-medium (subtle but real polish).

### 14. Empty / loading states
- **Nous:** None observed.
- **NaLI:** Has both — empty state with reset CTA, and `JurnalSkeleton`. **A real strength.** One nit: the skeleton uses `rounded` corners while the live cards are square — a small consistency miss.
- **Recommendation:** Keep both; make the skeleton square to match cards, and have it reflect the *final* simplified card shape.
- **Impact:** Low.

---

## Production Quality Review

### 1. ⚠️ CRITICAL responsive bug — horizontal overflow + cross-column collision (≥1400px)
- **Measured:** at 1440px viewport, `document.scrollWidth = 1899px` (page overflows by **459px**, horizontal scrollbar appears). The 2-up grid tracks are `502px 502px`, but card content (long author strings, DOIs, titles) overflows its track by up to **485px**.
- **Root cause:** the flex content column (`flex-1 flex flex-col p-3.5`) has **no `min-w-0`**, so `truncate` / `line-clamp` cannot engage; min-content of unbreakable tokens (e.g. `10.62476/abes.103460`) forces the card wider than its column.
- **Symptom seen on screen:** the right-column card's action row renders as a collided "MET▲A▼A…" and the access label "AKSE…" is clipped (see `nali-jurnal-desktop-top.jpeg`).
- **Fix direction:** add `min-w-0` to the flex content column (and any flex children that must truncate); reconsider the 2-up at this width (§Grid). This is the top priority.

### 2. Inconsistent typography
- 9 distinct font sizes in the card grid (`9.28 / 9.92 / 10.56 / 10.88 / 12.48 / 13.12 / 13.6 / 16 / 18px`); 4 are **sub-11px**. Multiple `tracking-*` values. No shared scale.

### 3. Inconsistent borders
- Catalog cards + sidebar use `border-solid border-ink/10`; the site signature (and Nous) is **dashed ink**. Page rules use `.hairline` (dashed). Detail uses `border-ink/10` solid. → three border treatments where there should be one.

### 4. Inconsistent radius
- Cards/inputs/checkboxes are square (`rounded-none`); `JurnalSkeleton` placeholders use `rounded`. Pick one (square, per the archive language).

### 5. Inconsistent spacing / padding
- Card padding `p-3.5`, action gaps `gap-3`, badge gaps `gap-1.5`, many `mt-1 / mt-1.5 / mt-2.5 / pt-2` ad-hoc values. No 4/8px rhythm. Sidebar `p-5`, header `py-12`, container `py-12` — unrelated.

### 6. Inconsistent component sizing
- Buttons differ in padding between list (`px-4 py-1.5`) and detail (`px-8 py-3.5`, `px-5 py-3.5`); cover widths step through 4 arbitrary values (`90/110/120/130px`); badge text 0.58rem vs 0.6rem vs 0.62rem.

### 7. Interaction issues
- Three controls per card compete for the primary action; `Metadata▼` expansion shifts layout; `transition-all` is broad; hover relies on a shadow that's off-system.

### 8. Accessibility issues
- **Sub-11px text** (down to 9.28px) fails comfortable-reading guidance and likely contrast-at-size.
- **Green "Peer Reviewed" badge** — verify contrast and note it's the only non-system hue (also a colorblind-reliance smell).
- Justified mono excerpts on mobile create loose word-spacing rivers (readability).
- *Positives:* focus-visible rings, focus-trap + scroll-lock drawer, `aria-modal`, skip patterns — these are good and should be preserved.

### 9. Responsive issues
- The ≥1400px overflow (§1); mobile cover aspect/crop; verbose mobile header delaying content.

### 10. Visual rhythm issues
- Jagged card heights (variable covers + content), mixed cover registers, no consistent vertical beat → "database dump" feel vs Nous's even cadence.

---

## Design System Improvements

All within NaLI's existing **archive-ink teal** system — no new brand colors, no copying Nous's blue.

- **Spacing scale.** Adopt a strict 4px base: `4 / 8 / 12 / 16 / 24 / 32 / 48`. Replace `p-3.5`, `mt-2.5`, `gap-1.5`, `py-12`-everywhere with tokens. One card padding (e.g. 16px), one inner gap (8 or 12px).
- **Typography scale.** 5 steps, nothing < 11px: `label 11` · `meta 12` · `body 14` · `card-title 18` · `page-title 28–48 (Fraunces)`. Two tracking values only. Apply identically across list, sidebar, detail.
- **Color hierarchy.** One ink (teal) + one grey + paper. **Retire the green badge** into an ink/outline chip. Keep the 4-color *confidence* palette only where confidence is the semantic point (articles), not in the jurnal card chrome. Verify dark-mode parity for every token.
- **Border system.** **One rule:** `1–2px dashed ink` (tie to a `.card-archive` utility), square, used by cards, sidebar, inputs, and detail boxes alike. Kill `border-solid border-ink/10` in the catalog.
- **Elevation / shadows.** Remove shadows from the archive surfaces (`hover:shadow-sm`, detail `shadow-sm`). Keep a shadow only for the true overlay (mobile drawer). Elevation = border/wash change, not shadow.
- **Hover system.** One token: `transition-[border-color,background-color] 0.3s ease`; hover = `border-ink` + `bg-ink-wash/40`. No `transition-all`, no shadow.
- **Icon usage.** Standardize the inline arrows (`↓ ↗ ▲ ▼`) to one set/size; consider a single monoline icon style à la Nous's row icons if any icons are added.
- **Layout containers.** Reconcile `max-w-[1480px]` (jurnal) with the global `max-w-editorial (1240px)`; pick one editorial max-width and one reading max-width (`68ch`) and use them everywhere.
- **Responsive breakpoints.** Drop the fragile `min-width:1400px` 2-up for dense horizontal cards. Either single-column at all widths, or a real vertical-card 2-up. Add `min-w-0` wherever flex + truncate coexist.
- **Component reuse.** Extract one `PublicationCard` shape shared by list + skeleton (so the skeleton always matches), one `FilterChip`, one `ArchiveButton`. Today the skeleton and card drift independently.

---

## Priority Matrix

### CRITICAL (do first — correctness & perceived quality floor)
1. Fix the **≥1400px horizontal overflow / cross-column collision** (`min-w-0` + reconsider 2-up). *Shipping bug.*
2. Establish the **5-step type scale**, remove all sub-11px text, map the card onto it.
3. **Unify the border system** to one dashed-ink rule; remove the green badge from card chrome.

### HIGH (defines premium feel)
4. **Simplify the card** to 4–5 signals + one primary action (move DOI/volume/license/Bagikan/Metadata to detail).
5. **Resolve covers** — drop from list *or* force one duotone+aspect policy.
6. Fix the **grid** (single-column, or vertical 2-up with equal heights).
7. **Mobile**: one-line header, fix cover crop, carry the simplified card.

### MEDIUM (polish & rhythm)
8. Spacing scale (4px base) across card/sidebar/header.
9. Hover/motion token (0.3s, specific props, wash not shadow).
10. Button sizing/standardization; sidebar + input restyle to the unified system.
11. Shorten/relocate the header description; reconcile container max-widths.

### LOW (consistency nits)
12. Square the skeleton; make it mirror the final card.
13. Standardize inline-arrow icons.
14. Verify dark-mode contrast on every restyled token; check active-nav contrast.

---

## Implementation Roadmap (sequential, scoped to `/jurnal` only — **do not implement yet**)

Each phase is independently shippable and verifiable; nothing here touches routes/components outside `/jurnal`, `PublicationCatalog`, `JurnalSkeleton`, `jurnal-format`, and `/jurnal/[slug]`.

**Phase 0 — Tokens (no visual change yet).**
Add to `tailwind.config.ts` / `globals.css`: the 5-step type scale, a `.card-archive` dashed-ink utility, one hover token, confirm spacing tokens. Pure additions; nothing consumes them yet. *Verify: build/lint clean, page unchanged.*

**Phase 1 — CRITICAL bug fix (smallest possible diff).**
Add `min-w-0` to the flex content column (+ truncating children). Decide the wide-screen layout: simplest safe move is single-column list at all widths (delete the `min-width:1400px` 2-up). *Verify: at 1440/1680/1920px no horizontal scroll, no clipped labels, `scrollWidth ≤ innerWidth`.*

**Phase 2 — Type + color discipline.**
Map every catalog text onto the scale; delete sub-11px sizes; convert the green badge to an ink/outline chip; collapse tracking to two values. *Verify: count distinct font-sizes in `ul.grid` ≤ 5; no green in card chrome; dark-mode spot check.*

**Phase 3 — Border + elevation unification.**
Swap catalog/sidebar/detail solid borders to the dashed-ink rule; remove archive-surface shadows; apply the hover token. *Verify: one border style across list/sidebar/detail; no `shadow-*` except the drawer.*

**Phase 4 — Card simplification.**
Reduce to badge(type) + title + authors·journal·year + one-line synopsis + one primary action. Move DOI/volume/issue/license/share/metadata-toggle to detail (data already present there). *Verify: card shows ≤5 signals; one CTA; detail still exposes everything.*

**Phase 5 — Covers + grid rhythm.**
Apply the chosen cover policy (drop-from-list or uniform duotone+aspect); equalize card heights. Update `JurnalSkeleton` to match the final card (square, same shape). *Verify: left rail tonally uniform; even vertical rhythm; skeleton == card.*

**Phase 6 — Header + mobile.**
One-line header (relocate the caveat); reduce mobile header padding; fix stacked-cover aspect. *Verify at 390px: card-1 visible with minimal scroll; cover crop acceptable; simplified card intact.*

**Phase 7 — Final QA sweep.**
Re-run the computed-CSS checks (font-size count, border audit, overflow at 4 widths), light/dark, 375/390/768/1024/1440/1920, keyboard/focus-trap regression, empty + loading states. *Verify against this report's metrics.*

---

### Appendix — evidence captured
`docs/assets/nous-benchmark/`: `nous-home-desktop-{top,full}.jpeg`, `nous-blog-desktop-{top,full}.jpeg`, `nous-detail-desktop-top.jpeg`, `nous-blog-mobile.jpeg`, `nali-jurnal-desktop-{top,full}.jpeg`, `nali-jurnal-mobile.jpeg`.
Key measured facts: Nous ink `#0071A9` + `#00547E`, grey `#33373D` (same as NaLI `--c-gray`); Nous type sizes 13/15/16 + 23/32; blog card `2px dashed #0071A9`, square, no shadow, hover `0.3–0.4s`; detail body Helvetica 16/26.4 @820px. NaLI `/jurnal` @1440: `scrollWidth 1899`, grid `502px 502px`, 9 font sizes (min 9.28px), card content overflow ≤485px from missing `min-w-0`.
