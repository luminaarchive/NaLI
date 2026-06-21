---
name: NaLI by NatIve
description: Open research journal about Indonesian nature, history, and investigations.
colors:
  paper: "#ffffff"
  ink: "#0e8268"
  ink-deep: "#085e4b"
  ink-wash: "#e9f6f1"
  ink-black: "#0a0a0a"
  ink-charcoal: "#1c1c1c"
  gray: "#33373d"
  gray-light: "#8e938f"
  rule: "#9ecdbf"
  paper-dark: "#0a1411"
  ink-dark: "#46cfa8"
  ink-deep-dark: "#9ae9d0"
  ink-wash-dark: "#11241e"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "0.01em"
  body:
    fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace"
    fontWeight: 400
    lineHeight: "1.625"
  label:
    fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, monospace"
    fontWeight: 500
    letterSpacing: "0.18em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "24px"
---

# Design System: NaLI by NatIve

## 1. Overview

**Creative North Star: "The Archive Ink Field-Journal"**

NaLI by NatIve's design system evokes the tactile, rigorous feel of a physical archival folder, open-science field report, or academic journal printed with high-quality green-teal ink on raw white paper. The layout emphasizes structure, documentation, and high credibility.

The aesthetic rejects typical SaaS clutter (such as soft drop-shadow ghost cards, rounded card/input boundaries, and decorative blurs) in favor of strict flat grids, dashed separators, and monospaced typography. Spacing is rhythmic and generous to make dense research highly readable.

**Key Characteristics:**
- **Flat & Sharp:** Absolute omission of rounded corners (`border-radius: 0`) and box-shadows.
- **Teal Monoculture:** Primary colors are strictly derived from the teal ink spectrum, contrasting against pure paper backgrounds.
- **Archive Taxonomy:** Uses structural indicators like dashed borders, index numbering (e.g., `No. 001`), and confidence labels to present articles as verified research files.

## 2. Colors

The colors recreate the experience of reading dark teal ink printed on high-contrast paper plates.

### Primary
- **Archive Teal Ink** (`#0e8268`): The main brand voice. Used for branding elements, links, active navigation items, and primary buttons.
- **Deep Teal** (`#085e4b`): A darker shade of the primary ink for hover states and high-contrast text accents.

### Neutral
- **Paper Background** (`#ffffff`): The primary surface background in light mode, simulating clean paper.
- **Ink Charcoal** (`#1c1c1c`): The body text color. Softened slightly from pure black to avoid optical strain while maintaining contrast.
- **Ink Wash** (`#e9f6f1`): A tinted paper background fill for container highlights, table headers, and active card hover overlays.
- **Rule Green** (`#9ecdbf`): Used for dashed hairlines and borders.
- **Dark Paper** (`#0a1411`): The base background in dark mode, reflecting a deep-forest dark tone.
- **Ink Neon Teal** (`#46cfa8`): The lightened ink color for readability in dark mode.

### Named Rules
**The Single Accent Rule.** Only one accent color family (Teal) is allowed. Accent colors outside this ramp (except for standard validation indicators) are prohibited.
**The Ink-Wash Contrast Rule.** Highlight layers must use a transparency of the primary ink (Ink Wash) or a direct background shade. Gray-scale hover backgrounds on tinted paper are prohibited.

## 3. Typography

**Display Font:** Fraunces (serif)
**Body Font:** IBM Plex Mono (monospace)
**Label/Mono Font:** IBM Plex Mono (monospace)

### Hierarchy
- **Display** (Bold (700), `clamp(1.75rem, 5vw, 3rem)`, `1.2`): Used for main page headers, H1s, and article titles. Always uppercase when used for listings.
- **Headline** (Bold (700), `1.25rem`, `1.3`): Used for section headings and cards.
- **Body** (Regular (400), `0.875rem`, `1.625`): Used for all body prose. Monospaced to convey raw scientific documentation. Line length is capped at `68ch`.
- **Label** (Medium (500), `0.7rem`, `0.18em`): Used for eyebrows, metadata tags, and small table cells.

### Named Rules
**The Monospace Prose Rule.** All body copy and prose must be set in monospace (`IBM Plex Mono`) to emphasize the research-journal character. Proportional sans-serif body copy is forbidden.

## 4. Elevation

The design system is entirely flat. It avoids drop shadows to match the print-media aesthetic.

### Named Rules
**The Flat Print Rule.** All cards, dropdowns, and components must lie flat on the paper surface. Depth is represented using borders (`border-dashed`), background tints (`bg-ink-wash`), or horizontal lines (`.hairline`), never with shadows or blurs.

## 5. Components

### Buttons
- **Shape:** Sharp (`0px` radius)
- **Primary:** Background color Archive Teal Ink (`#0e8268`) with Paper (`#ffffff`) text. Padding is `8px 16px` (`py-2 px-4`).
- **Hover:** Deep Teal (`#085e4b`) background with smooth transition.

### Cards (ArticleCard)
- **Corner Style:** Sharp (`0px`)
- **Background:** Paper (`#ffffff`)
- **Border:** Dashed rule (`border border-dashed border-ink/70`)
- **Hover State:** Background fills with Ink Wash (`bg-ink-wash`) and the title undergoes underlining.

### Confidence Badges
- **Style:** Small inline-flex badge with a dashed border (`border-dashed`), monospaced label, and a `1.5` w/h (`6px`) solid square status indicator.
- **State Colors:** High (Teal), Medium (Amber), Low (Orange), Needs Verification (Red).

## 6. Do's and Don'ts

### Do:
- **Do** use dashed borders (`border-dashed` or `.hairline`) for borders and section dividers.
- **Do** set all interactive buttons and cards to a sharp `0px` border-radius.
- **Do** preserve body text length within `68ch` to maintain high readability.
- **Do** apply a duotone teal filter (`.duotone-ink`) on photography to maintain a cohesive editorial visual style.

### Don't:
- **Don't** use card drop shadows (`box-shadow`) or blurred glassmorphism.
- **Don't** use proportional sans-serif fonts for body prose.
- **Don't** use decorative side-stripe border accents on cards or alerts.
- **Don't** use tiny uppercase tracked eyebrows as generic kickers on every single section. Only use metadata subtitles when they convey literal taxonomy (e.g. `No. 001`).
