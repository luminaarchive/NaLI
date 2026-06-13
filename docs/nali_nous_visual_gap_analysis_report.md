# NaLI x Nous Research Visual Gap Analysis

**Date**: 2026-06-13  
**Auditor**: Antigravity (Advanced Agentic Coding Pair)  
**Reference Site**: [Nous Research](https://nousresearch.com/)  
**NaLI Production URL**: [NaLI by NatIve](https://nalijournal.vercel.app/)  

---

## 1. Executive Summary

This report presents a visual gap analysis comparing the design language of **Nous Research** and **NaLI by NatIve**. The goal is to identify how NaLI can incorporate the premium, structured, "research-lab" atmosphere of Nous Research without compromising NaLI's established identity as an open-source editorial evidence journal. 

No functional files or layouts have been edited. This report is strictly analytical. All suggested improvements are surgical, additive, and designed to protect the core homepage layout, typography, and theme toggle systems.

---

## 2. What Nous Research Does Well

Nous Research projects an authoritative, bleeding-edge "computational lab" atmosphere. Key design highlights include:
- **Terminal Aesthetics**: Uses data tags (e.g., `OUTPUT 96`, `SEED: 3573860127`, `NODES`) that give the layout a live server output or neural network checkpoint feel.
- **Minimalist Grid Spacing**: Separates content blocks with thin, solid divider lines, ensuring high readability and clean visual rhythm.
- **Monospace Dominance**: Leverages `"Geist Mono"` for headings with tight letter-spacing (`-0.05em`) and line-height (`1.1`), yielding a highly serious, technical tone.
- **Arrow Link Indicators**: Uses `→` bullet points for navigation links, mimicking command-line directories.
- **Subtle Branding**: Embeds small, stylized vectors/icons inside cards to identify specific modules (e.g., globe, music, gem) without introducing visual noise.

---

## 3. What NaLI Already Does Well

NaLI by NatIve has successfully carved out its own unique visual signature:
- **"Archive-Ink" Design System**: The paper background (`#FFFFFF` in light, `#0A1411` in dark) combined with deep teal ink (`#0E8268` in light, `#46CFA8` in dark) feels forensic, historical, and highly intentional.
- **Editorial Pacing**: The combination of `Fraunces` serif headings and `IBM Plex Mono` typewriter body text conveys an elegant, old-school editorial gravity.
- **WaveHero WebGL Shader**: The pixelated Bayer-dithering canvas wave on the hero section feels custom, alive, and highly premium, responding dynamically to user interactions.
- **Dashed Borders and Hatch Dividers**: The use of `.hairline` (dashed lines) and diagonal hatching (`.hatch`) successfully reinforces the blueprint, field-journal style.
- **Structured Trust Indicators**: The **Claim Ledger**, **CategoryBadges**, and **ConfidenceBadges** are clearly defined and present evidence in an honest, open-source layout.

---

## 4. What Must Not Be Changed in NaLI

To protect the founder's vision and preserve NaLI's branding, the following elements are designated as **P0: Do Not Touch**:
- **Existing Hero Section**: The WebGL Bayer-dithering shader (`WaveHero`), hero text, and signup module must remain untouched. 
- **Typography Pairing**: The `Fraunces` heading font and `IBM Plex Mono` body font pairing must be preserved. Do not replace Fraunces with a geometric sans or monospace font for titles.
- **"Archive-Ink" Color Palette**: The ink-teal and off-white/dark-teal color scheme must remain the site-wide baseline.
- **Dashed-Border Archetype**: The dashed line aesthetic is central to the field-journal theme and must not be replaced with solid modern borders.
- **Navigation Structure**: The primary navbar pill links (Artikel, Jurnal, Seri, Arsip Sumber, Metodologi, Tentang, Kontak) and the pixel-themed theme toggle are locked.

---

## 5. Visual Gaps Between NaLI and Nous

While NaLI has a strong editorial identity, it feels slightly more like a blog/publishing platform than a high-end "evidence lab". The main visual gaps include:
1. **Metadata Density**: Nous Research displays sparse but highly structured data points (such as seeds and version outputs) to anchor its paragraphs. NaLI's article cards and listings have simple metadata strings that can feel disjointed.
2. **Card Visual Structure**: NaLI's article cards use a dashed border but lack internal modular structure. Nous uses box borders with clear header areas to separate metadata from body text.
3. **Interactive Polish (Hover States)**: Nous Research links and interactive modules have smooth, responsive hover triggers. NaLI's links feel slightly static (underlines and simple color swaps).
4. **Trust Block Styling**: The Claim Ledger and limitations boxes inside articles look like generic text tables rather than modular "verification records".
5. **Atmospheric Detail**: Nous Research uses custom monospace labels that make the page feel like an active terminal database. NaLI's pages rely on plain layout structure without these atmospheric markers.

---

## 6. Safe Improvements for NaLI

These recommendations are additive and surgical, intended to elevate NaLI's premium feel without altering its layout:

### P1: Safe High-Impact Improvements
- **Refine Article Card Hierarchy**: Group card metadata (category, reading time) in a dedicated top sub-row separated by a dashed divider. Add the specific database article number or catalog ID (e.g., `REF NO. 024`) as a terminal-style prefix to make it look like a ledger entry.
- **Add Publisher/Type Chips to Source Archive**: In the `/arsip-sumber` table and source detail cards, introduce small, dashed-border chips indicating the type of publisher (e.g., `JURNAL`, `ARSIP`, `BUKU`) and geographic scope to improve scannability.
- **Refine Trust Block Presentation**: Re-style the **Claim Ledger** and **Limitations** blocks to look like structured data cards. Add subtle background washes (`bg-ink-wash/35`) and place claims in dedicated borders that mimic lab reports.
- **Add Subtle Link Hover Animators**: Introduce a custom CSS rule that places a smooth slide-in or chevron-shift effect on primary buttons and arrows (e.g., `→ Buka sumber asli` or `→ Buka artikel`) without adding heavy libraries.
- **Clean Up Robots.txt**: Update `app/robots.ts` to add crawler restrictions for `/admin` and `/api/*` paths to improve indexing security.

### P2: Nice Improvements Later
- **Subtle Background Noise/Grid Wash**: Add a very faint SVG-based coordinate grid or grain texture to the page backgrounds (`body`) that becomes visible only on high-DPI screens, giving pages a blueprint paper look.
- **Section Spacing Standardization**: Adjust margins globally to guarantee consistent vertical spacing between bento grid modules, aligning them with the grid layout rules of professional research catalogs.

---

## 7. Risky Changes to Avoid

The following actions are designated as **P3: Avoid / Postpone**:
- **Do not introduce neon gradients or glowing shadows**: These would conflict with the flat "archive-ink" typewriter printing press aesthetic.
- **Do not replace dashed lines with solid lines**: Removing the dashed lines would destroy the blueprint/draft journal feeling of NaLI.
- **Do not add heavy page transitions**: Heavy fade or slide animations will slow down page speed and conflict with the performance-first Next.js setup.
- **Do not replace the editorial Fraunces font**: Changing this would turn NaLI into a generic AI-lab clone and strip it of its Indonesian historical/forensic tone.

---

## 8. Page-by-Page Notes

### Homepage (`/`)
- **Preserve**: The dithered WaveHero WebGL canvas, top navbar layout, three pillar cards, and FAQ details.
- **Polish**: The "Tulisan Terbaru" cards can benefit from P1 metadata updates, adding a small typewriter serial number tag (e.g., `N·A·L·I DATA ID: 001`) to the top-right corner.

### Articles Listing (`/articles`)
- **Preserve**: The filter buttons and layout.
- **Polish**: Add category-specific badges that change border color on active states.

### Article Detail (`/articles/[slug]`)
- **Preserve**: The dynamic sitemap metadata, reading minutes, and header titles.
- **Polish**: The **Basis Tulisan** box and **Claim Ledger** should look like a laboratory test certificate, using clean columns and structured borders instead of a raw list.

### Source Detail (`/arsip-sumber/[slug]`)
- **Preserve**: Static routing and fields.
- **Polish**: Enhance the "Klaim yang dapat ditopang" and "Batasan" fields with a side-by-side split layout on desktop to make the page look like a professional research dossier.

---

## 9. Priority Recommendation List

### P0: Do Not Touch (Locked Decisions)
1. Do not replace or modify the `WaveHero` WebGL canvas section on the homepage.
2. Keep `Fraunces` as the title font and `IBM Plex Mono` as the primary body font.
3. Keep the primary monochrome theme toggles (☼ LIGHT / ◑ DARK) on the navbar.
4. Keep the "archive-ink" color system.

### P1: Safe High-Impact (Immediate Implementations)
1. **Article Card serial numbers**: Add typewriter style labels (`REF NO. 00X`) in metadata fields.
2. **Claim Ledger cards**: Restructure Claim Ledgers into modular cards with light background washes.
3. **Robots.txt security**: Restrict `/admin` and `/api/*` in crawler rules.
4. **Source Listing Chips**: Add visual chips to source details indicating publisher type.
5. **Interactive arrows**: Add smooth hover transitions to action links (e.g. changing text color and moving the arrow `→` offset).

---

## 10. Suggested Next Sprint, Report Only

Once the `/jurnal` rebuild is merged, the next sprint should focus solely on polishing metadata representation:
1. **Database Post Field Support**: Add UI fields to `/admin` to save Claim Ledgers, limitations, and evidence basis arrays directly to Supabase.
2. **Surgical Card Styling CSS**: Update the card CSS classes in `globals.css` to add the structured metadata headers.
3. **Robots.txt update**: Modify `app/robots.ts`.

---

## 11. Conflict Risk with Claude Code

- **Zero Risk**: All recommended changes are strictly limited to documentation inside the `docs/` directory. No code in `/jurnal` or any other part of the repository has been modified.

---

## 12. Final Recommendation

NaLI has a very strong and unique visual identity that successfully communicates its "editorial evidence-journal" intent. Rather than cloning Nous Research's futuristic AI-lab styling, NaLI should surgically borrow Nous's **metadata discipline** and **modular research-grid layouts** to make its existing "archive-ink" layout look more structured, premium, and authoritative. 

The existing homepage, hero section, and serif typography should remain fully intact.
