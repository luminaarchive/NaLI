# Forensic UI/UX Audit, NaLI vs. Nous Research

**Phase: Research & analysis only. No code touched, no commits, no patches.**
This document is the sole deliverable. Implementation begins only on explicit approval.

- **Target:** <https://nousresearch.com/>, home, `/blog/`, post detail, `/releases/`; desktop 1440 · tablet 768 · mobile 390; computed CSS + contrast measured in-browser.
- **Subject:** NaLI live (`nalibynative.vercel.app`), `/`, `/articles`, `/jurnal` (+ detail), `/seri`, `/arsip-sumber`, `/metodologi`, `/tentang`; source read from `main`.
- **Evidence:** 18 screenshots in `docs/assets/nous-benchmark/` (referenced inline). Supersedes/expands the earlier `nali_jurnal_nous_benchmark_ui_ux_report.md`.

---

## 0. The two-sentence verdict

**Nous and NaLI already speak the same visual language, one ink on white paper, monospace body, dashed rules, duotone photos. Nous feels more premium because it applies that language with relentless discipline (≈5 font sizes, one ink, one border per component, even rhythm), while NaLI applies it inconsistently, and `/jurnal` is the single page where NaLI most abandons its own discipline.**

Two facts make this audit unusually actionable:
1. **The fix for `/jurnal` is not "import Nous." It is "be consistent with NaLI's own `/arsip-sumber` and `/seri`,"** which are already restrained, scannable, and premium, and which already match how Nous handles the equivalent content.
2. **`/jurnal` ships a real responsive bug** (459px horizontal overflow at ≥1400px). That has to be fixed regardless of any aesthetic work.

---

## 1. Site Architecture

### Nous
| Page | Pattern | Notes |
|---|---|---|
| Home | 3 stacked editorial rows, dashed-rule separated; each = `[image \| heading+body \| OUTPUT/SEED meta + monoline icon]` | ~1.7 screens tall, enormous whitespace. No hero image/video. |
| Blog `/blog` | Centered `NOUS BLOG` wordmark → **2-col dashed text-cards** (title + byline + excerpt) | No images, no pagination, ~18 posts all rendered. |
| Post detail | Centered serif/pixel title → single duotone hero → single-column body | Body measure too wide (820px). |
| Releases `/releases` | Centered wordmark → **searchable/sortable data table** (record #, project, type, details, date, size) | TablePress; zebra rows; this is the *structured-catalog* model. |
| Mobile nav | Kebab (`···`) → dropdown of 9 links | Only rounded+filled element on the site. |

**Reading flow:** title → content, immediately. Density low, rhythm even. Content hierarchy carried by whitespace, not weight.

### NaLI
| Page | Pattern | Quality |
|---|---|---|
| `/` | Rich SaaS/editorial landing: teal hero → proof strip → "Tulisan terbaru" cards → confidence legend → 3 pillar tier-cards → editorial standards → source callout → FAQ → footer | More *produced* than Nous, more components, busier. |
| `/articles` | Header → category chips + **50+ tag chips** → dashed article cards | Tag wall dominates above content. |
| `/jurnal` | Header → **left filter sidebar + 2-col dense horizontal cards** (cover + ~11 elements) | **The outlier, see §12.** |
| `/seri` | Header → dashed series cards → per-row `title + confidence badge` list | Restrained, premium. |
| `/arsip-sumber` | Header → count + 3 dropdowns → **record-numbered data table**, no images | Restrained, premium, **≈ Nous Releases**. |
| `/metodologi`, `/tentang` | Header → numbered prose sections, ~68ch measure | Restrained, readable. |

**Verdict:** NaLI's architecture is *richer* than Nous everywhere. Its problem is not missing structure; it is **inconsistency between sibling pages** (see §12) concentrated in `/jurnal`.

---

## 2. Typography

### Measured type system

**Nous**, 3 families, ~5 sizes, 4 weights across the entire blog:
| Role | Family | Size / LH | Weight | Transform / Tracking | Color |
|---|---|---|---|---|---|
| Wordmark ("NOUS BLOG") | **Mondwest** (pixel) | ~95px | 700/800 | uppercase | ink `#0071A9` |
| Nav | Mondwest | 15px / 20 | 500 | uppercase | ink |
| Card title (H1) | Mondwest **or** Times | 23px / 23 (1.0) | 700 | uppercase, `-1.15px` | deep `#00547E` |
| Byline | Times serif | 16px | 700 | none | deep `#00547E` |
| Excerpt / body | **Courier** mono | 14px | 400 | justify, `-0.4px` | ink `#0071A9` |
| Detail title | Mondwest | 32px | 400 | none, centered | ink |
| Detail body | Helvetica | 16px / 26.4 (1.65) | 400 | left | ink |
| **Distinct sizes on page** |, | **14 / 15 / 16 / 23 / 95px** | 400/500/700/800 |, |, |

**NaLI**, strong pairing (Fraunces display + IBM Plex Mono + system-sans prose), but `/jurnal` sprawls:
| Surface | Distinct font sizes | Smallest |
|---|---|---|
| `/jurnal` card grid (measured) | **9**, 9.28 / 9.92 / 10.56 / 10.88 / 12.48 / 13.12 / 13.6 / 16 / 18px | **9.28px** |
| Prose pages (`/metodologi`,`/tentang`) | ~3–4, readable | 17px body |

**Findings**
- **Restraint gap:** Nous = 5 sizes site-wide; NaLI `/jurnal` = 9 in the cards alone, four of them **sub-11px**. This is the #1 reason Nous "feels designed" and `/jurnal` "feels like a database."
- **Line-length:** Nous detail body is **820px / ~110ch, too wide** (a genuine Nous flaw). NaLI prose at ~68ch is **better**.
- **Both** lean monospace for body and a display face for titles, same instinct.

**Recommendation:** adopt a fixed **5-step scale** (`11 label · 12 meta · 14 body · 18 card-title · 28–48 Fraunces page-title`), nothing < 11px, two tracking values only. Keep Fraunces + Plex Mono (do **not** import Mondwest/blue).

---

## 3. Spacing System

| Aspect | Nous | NaLI `/jurnal` |
|---|---|---|
| Base rhythm | Loose, consistent; large section gaps; card pad **10px**; col gap generous (~30px) | Ad-hoc: `p-3.5`, `gap-1.5`, `gap-3`, `mt-1/1.5/2.5`, `pt-2`, sidebar `p-5`, header `py-12` |
| Detectable grid | Even 2-col, equal-height rows | 2-col `502px 502px`, **jagged heights** |
| Vertical rhythm | Predictable, even | Irregular (variable covers + content) |
| System | No formal scale, but applied consistently | No scale, applied inconsistently |

**Determination:** **Neither site uses a formal 8/4pt token system.** Nous looks systematic because its *values repeat*; NaLI's don't. NaLI should impose a **4px base scale** (`4/8/12/16/24/32/48`) and one card padding + one inner gap.

---

## 4. Layout System

| | Nous | NaLI |
|---|---|---|
| Container | Wide, ~1424px content of 1440 (small gutters) | `/jurnal` `max-w-[1480px]`; global `max-w-editorial 1240px` (**two maxes, reconcile**) |
| Breakpoints | Elementor stock: 479 / 576 / **767** / 889 / 992 / **1024** / 1300 | Tailwind: 640 / 768 / 1024 / 1280 **+ custom 1400** |
| Blog/list responsive | 2-col held at **tablet 768**, → 1-col at ≤767 | `/jurnal`: 1-col, → **2-col at ≥1400** (the fragile breakpoint) |
| Card width | ~535px, fixed feel | ~502px at the 2-up, too tight for the dense content |
| Image ratios | Duotone, consistent per context; **none in blog list** | Covers `aspect-[3/4]` + `scale-[1.10]` + `object-top` → awkward crops, worse on mobile (portrait→banner) |
| Whitespace | Generous, even | Dense ("high-density list" by design) |

**Key:** Nous collapses to one column *earlier and cleaner*; NaLI's `/jurnal` introduces a 2-up at exactly the width where its cards break (§13.1).

---

## 5. Component Library

| Component | Nous | NaLI | Polish gap |
|---|---|---|---|
| **Card (editorial)** | 2px dashed ink, square, **flat**, 3 slots, hover 0.3–0.4s | `/articles`,`/seri` dashed ✓; **`/jurnal` solid `border-ink/10` + shadow + ~11 slots** | `/jurnal` off-system |
| **Table** | TablePress: record#, sortable, search, zebra, pale-cyan header, solid grid | **`/arsip-sumber` already has this** (record#, dropdowns, type badges, `BACA→`) | NaLI parity/better |
| **Nav** | Centered caps, dashed rule, kebab | Centered serif caps, dashed rule, **+ light/dark toggle**, hamburger | NaLI better |
| **Section header** | Wordmark only | Eyebrow + Fraunces title + mono description + dashed rule (consistent every page) | NaLI better/more |
| **Badges** | None (mono caps inline) | Systematic confidence (teal/amber/orange/red) ✓ **+ stray green "Peer Reviewed" on `/jurnal`** ✗ | `/jurnal` off-system |
| **Filters** | TablePress search box (Releases) | **3 different paradigms**: sidebar checkboxes (`/jurnal`), tag-chip wall (`/articles`), dropdowns (`/arsip-sumber`) | NaLI inconsistent |
| **Buttons** | Ink underlined links | Solid teal + outline; list `px-4 py-1.5` vs detail `px-8 py-3.5` (unstandardized) | Minor |
| **Footer** | ~empty (37px) | Rich multi-column | NaLI better |
| **Empty/Loading** | None | Empty-state + reset, `JurnalSkeleton` (but **rounded** vs square cards) | NaLI better (nit) |
| **Pagination** | None | None | parity |

**Why Nous components feel polished:** every instance of a component is identical (one border, one ink, one motion). NaLI's components are individually good but **drift between pages**, the catalog feels less polished because it doesn't match `/articles`, `/seri`, or `/arsip-sumber`.

---

## 6. Visual Language

| Token | Nous (measured) | NaLI (measured) | Note |
|---|---|---|---|
| Primary ink | `#0071A9` (AA 5.34:1) | `#0E8268` (AA 4.76:1) | both single-ink |
| Deep ink | `#00547E` (AAA 8.17:1) | `#085E4B` (AAA 7.74:1) | **same two-step structure** |
| Wash/tint | header `#E7F5FF` | `ink-wash #E9F6F1` | **near-identical** |
| Body grey | `#33373D` | `--c-gray #33373D` | **identical value** |
| Paper | `#FFFFFF` | `#FFFFFF` | identical |
| Border | **2px dashed ink** (cards) / solid grid (table) | dashed `.hairline` ✓ / **solid `border-ink/10` in `/jurnal`** ✗ | NaLI inconsistent |
| Radius | 0 everywhere (kebab is the lone exception) | 0 (skeleton is the lone exception) | both ~square |
| Shadow | **none** (transitions only) | `hover:shadow-sm`, `shadow-sm`, drawer `shadow-2xl` | NaLI off-system |
| Hover | `transition: background .3s, border .3s, box-shadow .3s, transform .4s` | `transition-all duration-200` (+ shadow) | Nous slower/calmer |
| Photo treatment | duotone (blue) | `.duotone-ink` (teal) | **same idea** |
| Dark mode | **none** (0 `prefers-color-scheme` rules) | **full light/dark** via CSS-var swap | **NaLI better** |
| Token system | 209 vars but all WP/Elementor presets, **no bespoke tokens** | Tailwind config + CSS-var light/dark, **deliberate tokens** | **NaLI foundation better** |

**Crucial reframing:** Nous's premium feel is **editorial discipline layered on WordPress + Elementor + TablePress, not a sophisticated design system.** NaLI's token foundation is *more* modern. NaLI simply needs to *apply* it with Nous-level restraint.

---

## 7. Information Density (per card)

| | Nous blog card | NaLI `/jurnal` card |
|---|---|---|
| Visual elements | **3** (title, byline, excerpt) | **~11** (cover, type badge, green badge, title, authors, journal·year, DOI, 3-line synopsis, Unduh-PDF, Bagikan, Metadata-toggle) |
| Images | 0 | 1 cover each (24 total) |
| Type families in card | 2 (Times + Courier) | 2 (Fraunces + Plex Mono) |
| Type sizes in card | ~2–3 | **9** |
| Decisions supported | read / skip | read / skip, but buried under metadata |
| Whitespace | high | low |

**Finding:** NaLI front-loads *bibliographic* metadata (DOI, volume, license) that belongs on the **detail page** (where it already exists). The list should support one decision, "open this?", on ≤5 signals.

---

## 8. Interaction Design

| | Nous | NaLI `/jurnal` |
|---|---|---|
| Hover | Slow, multi-prop, 0.3–0.4s, whole card | `transition-all 200ms`, shadow+border |
| Focus | Skip-link present; default outlines | **`focus-visible` rings everywhere** (good), focus-trap drawer (good) |
| Expand/collapse | Table sort only | Per-card "Metadata▼" (shifts layout) |
| Sticky | 1 fixed element | Sidebar `lg:sticky top-24` |
| Loading | None | `JurnalSkeleton` (good) |
| Mobile gestures | Kebab dropdown | Filter drawer (scroll-lock + focus-trap, good) |

**NaLI wins on interaction robustness** (focus management, skeleton, accessible drawer). It only loses on *motion calm* (too fast, shadow-based) and the layout-shifting per-card expander.

---

## 9. Accessibility Findings

**Measured contrast (on white):**
| Color | Ratio | WCAG |
|---|---|---|
| Nous ink `#0071A9` | 5.34 | AA ✓ |
| Nous deep `#00547E` | 8.17 | AAA ✓ |
| NaLI ink `#0E8268` | 4.76 | AA ✓ (tight) |
| NaLI deep `#085E4B` | 7.74 | AAA ✓ |
| NaLI body charcoal `#1C1C1C` | 17.0 | AAA ✓ |
| NaLI `gray-light #8E938F` | **3.12** | **FAIL** (normal text) |
| NaLI **`text-ink/60`** | **2.41** | **FAIL** |
| NaLI **`text-ink/50`** | **2.04** | **FAIL** |
| NaLI **`text-ink/45`** | **1.89** | **FAIL** |

- **NaLI CRITICAL a11y issue:** `/jurnal` uses faded-ink (`text-ink/45–60`) for labels, counts, captions, DOI, **1.9–2.4:1, far below the 4.5 AA floor, and often at sub-11px.** Too small *and* too faint. (Fix: never use < `ink` opacity for text; full ink or `ink-deep` for small text.)
- **Nous's own a11y problems (do NOT copy):** **18 `<h1>` per blog page** (every card title is H1; the only H2 is the wordmark, semantically backwards); weak landmarks (multiple `nav`, no `main`/`contentinfo`); justified mono excerpts create word-spacing rivers on mobile.
- **NaLI is semantically better:** single `h1` per page (PageHeader) + `h2` per card; real landmarks; skip patterns; `aria-modal` drawer.

---

## 10. Performance Observations (inferred, no code changed)

| Signal | Nous | NaLI `/jurnal` |
|---|---|---|
| Stack | WordPress + Elementor + TablePress on Vercel (saw "Vercel Security Checkpoint") | Next.js 14 App Router, `force-dynamic` catalog |
| Blog/list images | **0 `<img>`**, text-only cards → tiny payload, **no image CLS/LCP** | **24 `next/image` covers**, heavier; first 2 `priority`, rest lazy |
| LCP risk | Low (text) | Cover images as LCP; the `scale-[1.10]`/`object-top` covers + variable heights raise CLS risk |
| Layout stability | High (fixed text rows) | The **459px overflow** is itself a stability/usability defect at ≥1400px |
| Fonts | Mondwest + Courier + icon fonts (FontAwesome ×, swiper), many icon fonts = waste | Fraunces + Plex Mono (`next/font`, controlled), **leaner** |
| Hydration | jQuery/Elementor heavy | React island (`PublicationCatalog` client) over server data |

**Finding:** NaLI's perf foundation is **better** (Next/`next-font`/`next-image`), but `/jurnal`'s 24 cover images + dynamic rendering cost more than Nous's text-only list. Dropping list covers (or lazy/duotone-unifying them) both calms the design **and** lightens the page.

---

## 11. Design System Determination

- **Nous:** no formal design system; consistency is achieved by *editorial restraint* (one ink, one display face, repeated values) on a WordPress theme. Tokens are framework presets, not intentional.
- **NaLI:** an **intentional** token system (Tailwind `theme.extend`, CSS-var light/dark, named ink/wash/rule/confidence scales, `.label`/`.hairline`/`.container-editorial` utilities). **Architecturally ahead of Nous.**
- **Gap:** NaLI's tokens exist but aren't *enforced*, `/jurnal` reaches past them (`border-solid`, `text-ink/45`, 9 ad-hoc sizes, shadows, green badge). The work is **enforcement + consistency**, not new tokens.

---

## 12. Comparison vs. each NaLI page

| Page | What NaLI does better than Nous | Where NaLI is inconsistent / weaker |
|---|---|---|
| `/` | Far richer landing (hero, pillars, FAQ, legend); engaging | More components = busier than Nous's calm; many semantic colors at once |
| `/articles` | Dashed cards on-system; powerful tags | **Tag-chip wall (50+) dominates**; filter paradigm ≠ `/jurnal` |
| `/jurnal` | Faceted search, facet counts, drawer, skeleton, dark mode | **Solid borders, 9 sizes, faded labels, green badge, mixed covers, overflow bug, sidebar-filter paradigm**, the outlier |
| `/seri` | Clean restrained list; **model of NaLI done right** |, |
| `/arsip-sumber` | **Record-numbered data table = the right catalog pattern** (≈ Nous Releases) | Third filter paradigm (dropdowns) |
| `/metodologi` | Readable numbered prose, good measure |, |
| `/tentang` | Expressive Fraunces headline; good prose |, |

### The internal inconsistencies (NaLI vs NaLI)
1. **Card borders:** `/jurnal` **solid** vs `/articles`+`/seri` **dashed**.
2. **Catalog presentation:** `/jurnal` heavy **cards-with-covers** vs `/arsip-sumber` clean **table**, *for the same kind of content* (catalog of external publications/sources).
3. **Filter paradigm ×3:** sidebar checkboxes (`/jurnal`), tag-chip wall (`/articles`), dropdowns (`/arsip-sumber`).
4. **Text color discipline:** faded `text-ink/45–60` only proliferates in `/jurnal`.

### Where NaLI should **NOT** copy Nous
- **Do not** adopt Nous's blue, Mondwest pixel face, or justified mono body.
- **Do not** copy Nous's **18-H1** heading model or weak landmarks, NaLI's semantics are better.
- **Do not** drop NaLI's **dark mode**, rich footer, or systematic **confidence badges** (those are identity, not noise).
- **Do not** widen the reading measure to Nous's 820px.

---

## 13. Prioritized Recommendations

Each: **Problem · Evidence · Impact · Difficulty · Visual gain · Risk.**

### 🔴 CRITICAL

**C1, Fix the `/jurnal` horizontal-overflow / column-collision bug**
- *Problem:* at ≥1400px the page scrolls sideways and card content collides across columns.
- *Evidence:* `document.scrollWidth = 1899` at 1440 viewport (+459px); grid tracks `502px`, content overflows ≤485px; cause = no `min-w-0` on the flex content column so `truncate`/`line-clamp` can't engage; visible as "MET▲A▼A" / clipped "AKSE…" (`nali-jurnal-desktop-top.jpeg`).
- *Impact:* High (correctness, perceived quality on any wide monitor). *Difficulty:* Low. *Visual gain:* High. *Risk:* Very low.

**C2, Remove sub-11px + sub-AA text**
- *Problem:* metadata is both tiny and too faint.
- *Evidence:* 9 sizes incl. 9.28/9.92/10.56px; `text-ink/45–60` = 1.89–2.41:1 (AA needs 4.5); `gray-light` = 3.12.
- *Impact:* High (a11y + premium). *Difficulty:* Low–Med. *Visual gain:* High. *Risk:* Low.

**C3, Unify borders + retire the green badge**
- *Problem:* `/jurnal` opts out of NaLI's dashed-ink signature and breaks monochrome with a green chip.
- *Evidence:* `border-solid border-ink/10` (cards/sidebar/detail) vs dashed `.hairline`; green `Peer Reviewed` is the only non-system hue.
- *Impact:* High. *Difficulty:* Low. *Visual gain:* High. *Risk:* Low.

### 🟠 HIGH

**H1, Re-present the catalog as NaLI's own `/arsip-sumber` table (or a slim uniform row), not dense cards**
- *Problem:* `/jurnal` uses the wrong model for structured records.
- *Evidence:* `/arsip-sumber` (`nali-arsip-desktop.jpeg`) and Nous Releases (`nous-releases-desktop.jpeg`) both prove the table/row model for catalogs; it removes covers, overflow, and density at once and scales toward the planned 500 entries.
- *Impact:* Very High. *Difficulty:* Med. *Visual gain:* Very High. *Risk:* Med (biggest layout change, gate behind approval; can be offered as a "table view" toggle first).

**H2, Simplify the card to ≤5 signals + one action** (if cards are kept for a "featured" strip)
- *Evidence:* 11 elements today vs Nous's 3; DOI/volume/issue/license/share already live on detail.
- *Impact:* High. *Difficulty:* Med. *Visual gain:* High. *Risk:* Low.

**H3, Resolve covers** (drop from list, or force one `.duotone-ink` + fixed aspect)
- *Evidence:* photos vs grey scans vs fallbacks (`nali-jurnal-desktop-full.jpeg`); mobile portrait→banner crop.
- *Impact:* High. *Difficulty:* Low–Med. *Visual gain:* High. *Risk:* Low.

**H4, One filter paradigm across `/jurnal` + `/articles` + `/arsip-sumber`**
- *Evidence:* three paradigms today.
- *Impact:* Med–High (site coherence). *Difficulty:* Med. *Visual gain:* Med. *Risk:* Med.

**H5, Mobile: one-line header + fixed cover/row**
- *Evidence:* `nali-jurnal-mobile.jpeg`, long header pushes content down; banner crop.
- *Impact:* High (primary channel). *Difficulty:* Low. *Visual gain:* High. *Risk:* Low.

### 🟡 MEDIUM
- **M1** 4px spacing scale across card/sidebar/header. *(Low diff, Med gain, Low risk)*
- **M2** Hover token: 0.3s, specific props, `bg-ink-wash` not shadow; remove archive-surface shadows. *(Low/Med/Low)*
- **M3** Standardize button sizing; restyle sidebar/inputs to the unified border. *(Low/Med/Low)*
- **M4** Reconcile `max-w-[1480px]` vs `max-w-editorial 1240px`; pick one editorial + one reading max. *(Low/Med/Low)*

### 🟢 LOW
- **L1** Square the `JurnalSkeleton`; mirror the final card/row. *(Low/Low/Low)*
- **L2** Standardize inline arrows `↓ ↗ ▲ ▼`. *(Low/Low/Low)*
- **L3** Dark-mode contrast re-check on every restyled token. *(Low/Low/Low)*

---

## 14. Implementation Roadmap (each phase independently shippable; scoped to `/jurnal` + its components only)

> Nothing here runs until you approve. No phase touches routes/components outside `app/jurnal/**`, `PublicationCatalog`, `JurnalSkeleton`, `jurnal-format`, and shared tokens.

**Phase 1, CRITICAL correctness & legibility (no layout redesign).**
C1 (`min-w-0` + drop the fragile ≥1400 2-up → single column), C2 (kill sub-11px / faded-ink text), C3 (dashed-ink borders, remove green badge & shadows).
*Ship test:* no horizontal scroll at 1280/1440/1680/1920; `ul.grid` distinct font-sizes ≤ 5; no `text-ink/<70` on text; one border style; dark-mode spot check.

**Phase 2, Token enforcement.**
Add the 5-step type scale, 4px spacing tokens, `.card-archive` dashed utility, one hover token to `tailwind.config.ts`/`globals.css`; map `/jurnal` onto them (M1, M2, M4, L2).
*Ship test:* catalog uses only scale tokens; one hover token; one editorial + one reading max-width.

**Phase 3, Card/row simplification + covers.**
H2 (≤5 signals, move biblio fields to detail), H3 (cover policy). Update `JurnalSkeleton` to match (L1).
*Ship test:* card ≤5 signals, 1 primary action; covers uniform or absent; skeleton == final shape; detail still exposes all metadata.

**Phase 4, The catalog model decision (gated).**
H1, implement an `/arsip-sumber`-style **table/index view** for `/jurnal` (reusing existing NaLI table styling), optionally as a list/grid toggle. Biggest change → requires explicit sign-off after Phases 1–3 are live.
*Ship test:* table reuses arsip styling; record numbering; sortable/filterable; no images; scales to 500 rows.

**Phase 5, Cross-page coherence + mobile.**
H4 (single filter paradigm across `/jurnal`,`/articles`,`/arsip-sumber`), H5 (mobile header/row), M3 (button/input standardization), L3 (dark-mode contrast sweep).
*Ship test:* identical filter UX across the three catalogs; 390px shows row-1 fast; AA contrast holds in both themes.

**Phase 6, Final forensic QA.**
Re-run every measurement in this report (font-size count, border audit, overflow at 4 widths, contrast on changed tokens), keyboard/focus-trap regression, empty + loading states, light/dark, 375/390/768/1024/1440/1920.

---

## 15. Appendix, evidence index (`docs/assets/nous-benchmark/`)

**Nous:** `nous-home-desktop-{top,full}.jpeg` · `nous-blog-desktop-{top,full}.jpeg` · `nous-blog-tablet.jpeg` · `nous-blog-mobile.jpeg` · `nous-detail-desktop-top.jpeg` · `nous-releases-desktop.jpeg` · `nous-mobile-nav-open.jpeg`
**NaLI:** `nali-home-desktop.jpeg` · `nali-articles-desktop.jpeg` · `nali-jurnal-desktop-{top,full}.jpeg` · `nali-jurnal-mobile.jpeg` · `nali-seri-desktop.jpeg` · `nali-arsip-desktop.jpeg` · `nali-metodologi-desktop.jpeg` · `nali-tentang-desktop.jpeg`

**Hard numbers (measured this session):** Nous ink `#0071A9`/`#00547E`, wash `#E7F5FF`, grey `#33373D`; type 14/15/16/23/95px, weights 400/500/700/800; blog card 2px dashed, square, no shadow, hover .3–.4s; blog list 0 images; 18×H1; no dark mode; Elementor breakpoints 767/1024/1300. NaLI `/jurnal` @1440: `scrollWidth 1899` (+459 overflow), tracks `502px`, 9 font sizes (min 9.28px), content overflow ≤485px (missing `min-w-0`); NaLI contrast ink 4.76 / deep 7.74 / charcoal 17.0 / `ink/60` 2.41 / `ink/45` 1.89 / `gray-light` 3.12; full light/dark via CSS vars; Fraunces + IBM Plex Mono.

*End of report. Awaiting approval before any implementation.*
