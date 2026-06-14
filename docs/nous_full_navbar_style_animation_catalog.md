# Nous Research — Full Nav-Bar Style & Animation Catalog

**Analysis only — every nav destination interacted with and inventoried** (computed CSS, fonts, colors, components, transitions, keyframes, scroll/canvas behavior). Screenshots in `docs/assets/nous-full-catalog/` (+ earlier `docs/assets/nous-benchmark/`). Goal: catalog *everything*, then map to NaLI.

The nav: **Home · Hermes Agent · Nous Portal · Psyche · (Hermes 4) · Releases · Careers · Shop · Blog**. Three are the marketing site (`nousresearch.com`); the rest are separate sub-products.

---

## 0. The system-level finding

**Nous isn't one site — it's a family of properties on a shared skeleton, each with its own accent color, and two very different animation budgets:**

| Property | Type | Accent | Animation budget |
|---|---|---|---|
| Home / Blog / Careers / Releases | marketing (WordPress+Elementor) | **blue** `#0071A9` | near-zero (static) |
| **Psyche** | live dashboard | **green** `#396A3D` on cream | medium (dither, status pulse, live counters) |
| **Hermes Agent** | product microsite | blue + **orange** `#FFAC02` accent | **high** (terminal, marching-ants, blink, toasts) |
| Nous Portal | SaaS dashboard | blue/teal | low (spinner, sidebar) |
| Shop | Shopify store | blue | low (standard Shopify) |

**Shared DNA across all:** Mondwest pixel display + a serif (Times) + a mono (Courier / Geist Mono), dashed/grid lines, square corners, the recurring anime-mascot face logo, generous whitespace.

**The one that matters most for NaLI is Psyche** — it's monochrome **green on cream** (the same family as NaLI's teal-on-paper), nature-adjacent (botanical engraving), and full of "instrument" devices that translate directly.

---

## 1. Per-destination catalog

### HOME (`/`) — editorial, static
- **Layout:** 3 stacked rows, dashed-rule separated; each = `[image | heading + body | OUTPUT 96 / SEED: 357… + monoline icon]`.
- **Type:** Mondwest wordmark ~95px; nav 15px; Times serif titles/bylines (`#00547E`); Courier mono body (`#0071A9`). ~5 sizes total.
- **Motion:** none on content. Nav-link hover = `::after` underline fades in, `0.3s cubic-bezier(0.58,0.3,0.005,1)` (the signature). OUTPUT/SEED = randomized-per-load decorative metadata (not animated).

### BLOG (`/blog`) — dashed cards, static
- 2-col cards: `2px dashed #0071A9`, square, transparent, **no hover effect at all** (0 `:hover` rules). Title + top-right byline + justified mono excerpt. No images, no pagination. (Anti-pattern: 18 `<h1>` per page.)

### RELEASES (`/releases`) — data table
- TablePress **sortable + searchable** table: record-index column, **zebra rows**, pale-cyan header `#E7F5FF`, solid grid borders. Mondwest headers. This is the structured-catalog model NaLI's `/jurnal` table now mirrors.

### CAREERS (`/careers`) — static + a few components
- "CAREERS" pixel title; mission in serif with a **hand-drawn portrait illustration**; **OPEN ROLES** list (small filled **"FULL TIME" tag** + role name `↗` + right-aligned description); **HOW TO APPLY** with a **filled-blue callout box** (white text + ⓘ icon).
- New font sighting: **Geist Mono**. Accordion transition present (`max-height 0.3s, transform 0.3s`). No scroll animation.

### PSYCHE (`psyche.network`) — ⭐ the NaLI cousin
- **Color:** monochrome **sage/forest green** `#396A3D` on **cream** — the closest Nous palette to NaLI's teal-on-paper.
- **Type:** Geist + Geist Mono + custom display **"Soufflet Vert Hybrid"** + **math-italic** run titles (`moe≡10b≡a1b…`). Fraktur wordmark.
- **Theme toggle:** pixel **☼ LIGHT / ☾ DARK** (NaLI already has this exact device).
- **Texture:** **dithered / stippled** progress bars + a **dot-matrix network sphere** (1 canvas + 315 SVGs).
- **Status dots:** grey `#B9BEB6` (paused) · amber `#F6C955` (waiting) · green `#396A3D` (active). The `pulse` keyframe = **radar-ping** (`scale(1)→scale(2)`, `opacity .5→0`) radiating from a live dot.
- **Components:** param **chips** (`10.4b params` etc.), **segmented progress bars** (filled squares), a **leaderboard table** (rank icons + zebra + mono addresses + copy buttons), huge live mono counters in bordered boxes, filter tabs (ALL/ACTIVE/COMPLETED/PAUSED).
- **Decoration:** an **ornamental botanical engraving** (green vines) in the corner — nature-adjacent.
- **Motion:** snappy `0.1–0.2s` transitions incl. SVG `fill 0.2s`; live counters tick up; the radar-ping. Tasteful, not flashy.

### HERMES AGENT (`hermes-agent.nousresearch.com`) — the animated one
- Blue, **retro-terminal / pixel**; Mondwest pixel as *body*; orange `#FFAC02` minor accent; faded duotone background photo.
- **Components:** tabbed **code-install widget** (macOS/Linux · Windows + **Copy** buttons), a **terminal-window mockup** (traffic-light dots + a **blinking cursor █**), grid-divided nav with column separators.
- **Keyframes (rich):** `blink` (cursor), **`march`** (marching-ants moving dashed border), **`gradient-stroke`** (animated gradient border), `toast-in/out`, `spin-slow`, `enter/exit`, `pulse`, `fade-*`, `slide-*`. 9 elements pre-hidden for entrance. 3 canvases.

### NOUS PORTAL (`portal.nousresearch.com`) — dashboard (login-gated)
- **Icon-sidebar nav** (icon + label rows: Hermes Agent / API keys / Usage / Account Settings / Info) with **bottom-anchored bordered action buttons** (API Docs / Help / Log in). Main area = "VERIFYING HUMANITY" + **spinner**. Relevant to NaLI's `/admin`.

### SHOP (`shop.nousresearch.com`) — Shopify
- Standard Shopify theme, Nous-branded: 2-col product grid (large images + name + price), country/currency selector, cart. Least design-distinctive; little to adopt (NaLI isn't e-commerce).

---

## 2. What's applicable to NaLI

NaLI is teal-on-paper, archive/instrument, nature+history+investigation. **Psyche is the donor**; Hermes Agent and Portal contribute a few devices. Everything below uses NaLI's **own teal + dashed + mono** vocabulary — adapting devices, not copying Nous.

### STYLE devices (highest value first)
1. **Dithered / stippled texture** (Psyche) — a teal stipple on progress bars and as a hero/section "data" motif. Distinctive, on-brand for a research instrument, cheap (SVG/CSS).
2. **Status dot + radar-ping** (Psyche) — a small teal dot with a radiating ping for "baru diperbarui / live"; or map dot colors to the existing confidence palette.
3. **Segmented progress bar** (Psyche) — filled-square progress for real NaLI metrics (e.g. "9 / 30 artikel terbit", sprint progress, "X sumber terverifikasi").
4. **Metadata / param chips** (Psyche) — formalize NaLI's badges into one chip component (`No. 001`, `dicek 2026-06-12`, type, year).
5. **Filled callout / note box with icon** (Careers) — for methodology notes, limitations, "belum cukup bukti" disclaimers — a recurring NaLI need.
6. **Data table with row icons + copy buttons** (Psyche/Releases) — add a per-row "copy link / copy citation" button + small type icons to `/jurnal` + `/arsip-sumber` tables.
7. **Terminal-window mockup + blinking cursor** (Hermes) — a "catatan riset / log" device for methodology or the homepage (NaLI had a terminal-log card once; reintroduce tastefully).
8. **Icon-sidebar dashboard nav** (Portal) — apply to NaLI `/admin`.
9. **Ornamental botanical engraving** (Psyche) — a nature engraving flourish for the `/alam` pillar / section headers. Strong identity fit.
10. **Math-italic / special display** for technical labels (Psyche) — minor flourish for DOIs/IDs.

### ANIMATION devices (subtle, reduced-motion-safe — NaLI now has the guard)
1. **Radar-ping pulse** on a live/updated status dot (`scale 1→2`, `opacity .5→0`, ~1.5s loop). Tasteful "alive" signal.
2. **Marching-ants dashed border** (`march`) — *very* sparingly, only for a "processing / live / featured" element. NaLI's dashed borders make this natural, but it distracts if overused.
3. **Blinking cursor** (`blink`) — only inside a terminal/log device.
4. **Animated gradient-stroke border** (Hermes) — for one featured/active card at a time.
5. **Live count-up** on real numbers (totals on `/`, `/arsip-sumber`).
*(Already shipped: underline-fade hover, fade-up/fade-in, drawer slide, prefers-reduced-motion guard.)*

### Do NOT adopt
- Shopify product grid (not e-commerce); Hermes's orange + pixel-body identity (NaLI owns Fraunces); the 18-`<h1>` anti-pattern; over-animating editorial/marketing pages (Home/Blog prove restraint wins there).

---

## 3. Priority for NaLI

| Priority | Items | Why |
|---|---|---|
| **HIGH** | Status-dot + radar-ping · segmented progress (real metrics) · unified metadata chip · filled callout box | Distinctive, on-brand, genuinely useful, low risk |
| **MEDIUM** | Dither texture motif · table row copy/icons · botanical engraving for `/alam` · `/admin` icon-sidebar | Identity + polish; more design work |
| **LOW / careful** | Terminal+blink device · marching-ants · gradient-stroke | Characterful but easy to overdo; gate behind reduced-motion + use once |

**One-line takeaway:** Nous's marketing pages teach *restraint*; its **apps (Psyche above all)** are where the adoptable "instrument" flourishes live — and Psyche's green, dithered, nature-adjacent, status-driven language maps almost one-to-one onto NaLI's teal archive identity.
