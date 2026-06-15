# Nous Research, Motion & Interaction Deep Dive (what NaLI can adopt)

**Analysis only, no code changed.** Element-by-element interaction audit of <https://nousresearch.com/> (home, `/blog`, `/releases`), focused on **styles + animations** worth adapting into NaLI without copying. Computed CSS, `:hover` rules, keyframes, transitions, and scroll behavior were inspected live.

---

## 0. The honest headline

**Nous is almost entirely static. Its "premium" motion is one micro-interaction (a link underline that fades in) plus a handful of smooth, consistent transitions, and it respects reduced-motion. There is no scroll-reveal, no parallax, no entrance animation, and the blog cards don't even react on hover.**

The transferable lesson is therefore **restraint, not animation**: a couple of refined, consistent micro-transitions read as more premium than a pile of effects. NaLI already owns most of the right primitives, the work is to make them *consistent*, fix one dead animation, and add reduced-motion safety.

---

## 1. Motion inventory, what Nous actually animates

| Interaction | What happens | Spec (measured) | Verdict |
|---|---|---|---|
| **Nav / menu link hover** ⭐ | An `::after` underline **fades in** (opacity 0→1) under the link; color shifts to the accent | `opacity` over **`0.3s cubic-bezier(0.58, 0.3, 0.005, 1)`** | **The signature**, refined "snappy-out, gentle-settle" easing |
| **Blog cards hover** | **Nothing**, 0 `:hover` rules match the card or its children | declared `background/border/box-shadow .3s, transform .4s` but never triggered | Maximal restraint |
| **Content on scroll** | **Nothing**, no AOS/GSAP/IntersectionObserver, `opacityZeroCount: 0`, no parallax |, | No reveal-on-scroll at all |
| **Page / section load** | No content entrance animation; only a subtle nav-search `opacity 0→1` (0.2s) | `fadeIn` / `fade-in-nav-search` keyframes (opacity only) | Near-instant |
| **Mobile menu icon** | The kebab `···` morphs to `×` via staggered transitions | `width .1s, height .1s, opacity .1s` with offset delays | Nice, replicable |
| **Accordion / dropdown** | Expand via height/transform | `max-height 0.3s, transform 0.3s` | Standard |
| **Loaders** | Spinners | framework (`eicon-spin`, swiper), not design motion | n/a |
| **Reduced motion** | Honored | **3 `@media (prefers-reduced-motion)` rules** | Accessibility ✓ |

**Custom keyframes on the whole site:** just opacity fades (`fadeIn`, `fade-in-nav-search`). Everything else (`fa-*`, `eicon-spin`, swiper) is framework cruft. **Total designed easing curves: one** (`cubic-bezier(0.58, 0.3, 0.005, 1)`).

---

## 2. Style details worth adapting (beyond the static benchmark)

These are *style* devices (not motion) that give Nous character and that NaLI can echo with its **own** vocabulary:

1. **The "machine-metadata" right rail**, every homepage row carries `OUTPUT 96 / SEED: 3573860127` + a small monoline icon. It's decorative (randomized per load, **not** animated) but it screams "research instrument." **NaLI already owns the equivalent vocabulary** (`No. 001`, `LEMPENG 001`, `dicek <date>`), formalize it as a consistent right-rail/inline metadata chip on cards, table rows, and section headers.
2. **Monoline icon set**, Nous pairs each block with one thin single-weight glyph (globe, gem, note). NaLI uses ad-hoc arrows (`↓ ↗ → ▲`); a small consistent monoline set would lift the same way.
3. **Two-accent ink**, Nous quietly uses a *second* accent (a green `rgb(97,206,112)`) only for the hover underline, distinct from the blue body ink. NaLI is strictly one teal; a single restrained second accent **reserved for one job** (e.g. hover/active only) is a controllable upgrade, optional.
4. (Already shared and confirmed: dashed rules, mono body, duotone photos, square corners, display wordmark, generous whitespace.)

---

## 3. What NaLI already has (so we don't reinvent)

| Primitive | Status in NaLI |
|---|---|
| Entrance fades | `animate-fade-up` (0.7s `cubic-bezier(0.22,1,0.36,1)`) + `animate-fade-in` (1.1s) defined in `tailwind.config.ts`, **barely used** (Nav drawer only) |
| Hover transitions | `transition-colors hover:bg-ink-wash` across ~21 files (cards), `.link-teal` decoration transition, **already tasteful, already beyond Nous's inert cards** |
| FAQ chevron | `.lp-chevron` rotates 180° over `250ms ease`, good |
| Active nav | underline on active item, good |

### Two real gaps found during this audit
- 🐞 **Dead drawer animation:** `PublicationCatalog.tsx` mobile filter drawer uses **`animate-fadeIn` and `animate-slideRight`, which are not defined anywhere** (only `fade-in`/`fade-up` exist). The drawer currently just *pops* in with no animation. (`Nav.tsx` correctly uses the defined `animate-fade-in`.)
- ♿ **No `prefers-reduced-motion`:** NaLI has zero reduced-motion handling; Nous has 3 rules. Any motion we add should be gated.

---

## 4. Recommended adoptions, prioritized

Everything below is **subtle, consistent, and reduced-motion-safe**, in keeping with Nous's restraint. Nothing here is a flashy effect.

### CRITICAL (correctness / a11y, do regardless)
- **A. Fix the dead drawer animation.** Add a `slide-right` (and reuse `fade-in`) keyframe in the config and point the drawer at the real classes, so the mobile filter sheet slides in smoothly. Pure bugfix.
- **B. Add a global `prefers-reduced-motion` guard** in `globals.css` that neutralizes transitions/animations/`scroll-behavior` for users who ask for it. One block, site-wide.

### HIGH (the signature, highest "premium per line")
- **C. Adopt the underline-fade link hover** (Nous's one signature). Give inline links + nav items an `::after` underline that grows/fades in on hover over **~250ms with a single "settle" easing**. Tie it to a shared easing token (either Nous's `cubic-bezier(0.58,0.3,0.005,1)` or NaLI's existing `cubic-bezier(0.22,1,0.36,1)`, pick one and standardize).
- **D. Standardize motion tokens.** Define **one easing** + **three durations** (`120ms` micro / `250ms` hover / `600ms` entrance) and route all transitions through them, so hovers/fades feel like one system instead of the current mix (`150ms` defaults, `250ms` chevron, `300ms`, `700ms`, `1100ms`).

### MEDIUM (tasteful, optional, note these go *beyond* Nous)
- **E. Apply the existing `animate-fade-up`** to page headers / first card row **once on load**, very subtly (≤600ms, small 8–14px rise). NaLI already has the keyframe; it's unused. *Caveat: Nous itself does NOT animate content in, keep this whisper-quiet or skip.*
- **F. Animate the mobile hamburger → ×** morph (Nous-style staggered transition) for menu polish.
- **G. Formalize the right-rail metadata chip** (`No. / REF / dicek`) + a consistent monoline icon set as a reusable component.

### LOW
- **H. Consider one reserved second-accent** used *only* for hover/active states (like Nous's green underline), optional identity flourish.

---

## 5. What NOT to do (the trap)
- **Don't add scroll-reveal / parallax / staggered entrance grids.** Nous deliberately has none; they read as "template," not "instrument."
- **Don't animate the cards' box** (lift/scale/shadow on hover). Nous's cards are inert; NaLI's calm `bg-ink-wash` wash is already the right amount.
- **Don't introduce multiple easings or long durations.** One curve, short times.

---

### Appendix, measured specifics
Nav underline `::after`: bg `rgb(97,206,112)`, `opacity 0→1`, `transition: 0.3s cubic-bezier(0.58, 0.3, 0.005, 1)`. Blog card: `2px dashed rgb(0,113,169)`, transparent, **no `:hover` rule**, transform `none` on hover. Scroll libs: none (AOS/GSAP/Waypoints absent; `IntersectionObserver` animation elems: 0). `prefers-reduced-motion` rules: 3. Custom keyframes: `fadeIn`, `fade-in-nav-search` (opacity only). NaLI config: `fade-up`/`fade-in` defined; `animate-fadeIn`/`animate-slideRight` referenced but **undefined**.
