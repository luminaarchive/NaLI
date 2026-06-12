# NaLI — Editorial Trust + Source Archive Sprint: Final Report

_Branch: `editorial-trust-source-archive-30-articles` · 2026-06-12._
_Written to be honest, not flattering. Where a target was not fully met, it says so._

## 1. Summary

The sprint's top priority — **public trust and honest positioning** — is fully done.
NaLI no longer presents itself as first-party fieldwork, no longer carries any
seed/demo/placeholder language in public content, and is reframed throughout as an
**open-source evidence journal**. The trust infrastructure (methodology, corrections,
series, source-quality and photo-license pages), an upgraded source/article schema
(evidence basis, Claim Ledger, limitations, first-party-fieldwork flag, structured
source metadata), a filterable Arsip Sumber, and an automated editorial validator all
ship and pass QA.

The two **quantity** targets were deliberately **not** force-hit: the archive holds
**38 verified sources** (target floor 80) and **9 articles are published to the new
standard** (target 30). Per the sprint's own rule — _"Do not publish thin filler
articles just to hit 30"_ and _"complete the source system, templates, and the first
batch with full quality, then leave continuation instructions"_ — the remaining work
is fully planned and gated, not faked.

## 2. What changed

- **Removed all public demo language.** 5 article seed-disclaimers + 2 field-note
  seed/illustrative disclaimers deleted.
- **Killed fake first-party fieldwork.** Both field notes rewritten from first-person
  ("Pendakian dimulai…") to third-party open-source synthesis; the on-site-voice
  Mangrove article reframed and recategorized; homepage/nav/footer/about/manifesto/
  peta/hero/layout all reframed to "jurnal riset terbuka".
- **New trust vocabulary.** Confidence relabeled to Terverifikasi kuat / Didukung
  sumber / Terbatas / Belum cukup bukti; "Diperdebatkan" expressed per-claim.
- **Schema upgrade.** `Article` gained evidenceBasis, firstPartyFieldwork(false),
  series, claimLedger, limitations, images, updated, locationLabels. `SourceEntry`
  gained reliabilityLevel, topics, geography, language, institution, doi, archiveUrl,
  keyClaims, limitations, checkedAt. `FieldNote` gained evidenceType, limitations,
  sources.
- **Article page** now renders an evidence-basis banner, Claim Ledger table,
  limitations, image credits, series chips, and Article JSON-LD.
- **Arsip Sumber** is now filterable (type/topic/reliability) with per-entry
  reliability, topics, checked date; detail pages show key claims + limitations + DOI.
- **Automated validator** `npm run check:editorial` enforces the trust rules.

## 3. Routes added

`/metodologi`, `/koreksi`, `/seri`, `/pedoman-sumber`, `/lisensi-foto`.
(All in sitemap; nav slimmed to Artikel · Seri · Arsip Sumber · Metodologi · Tentang · Kontak.)

## 4. Routes changed

`/` (home), `/catatan-lapangan` → "Catatan Riset", `/arsip-sumber` (+filters & detail),
`/articles/[slug]` (claim ledger etc.), `/peta-eksplorasi` → "Indeks Eksplorasi",
`/tentang`, `/manifesto`, `/kontak`, layout metadata. Category pages unchanged in code
but fed by reframed content.

## 5. Source archive count by type (38 total)

| Type | Count |
|---|---|
| Laporan (institutional: IUCN, GVP, UNESCO, GFW, BPS…) | 19 |
| Jurnal | 13 |
| Arsip | 4 |
| Buku | 2 |

Reliability: primary 4 · high 32 · medium 2. Started at 25 → **+13 new web-verified**
this session (IUCN badak Jawa/Komodo/orangutan Tapanuli/coelacanth, GVP Toba/Merapi,
PNAS Samalas 1257, Anak Krakatau 2018, Jakarta subsidence, peat-fire ACP & PNAS,
UNESCO Sumatra, Banda 1621) + 25 legacy entries backfilled with structured metadata.

## 6. Article count by category / series (9 published of 30 planned)

| Category | Published |
|---|---|
| Alam | 6 (Harimau Jawa, Badak Jawa, Maleo, Api Biru Ijen, Tambora 1815, Segara Anakan) |
| Investigasi | 2 (Citarum, Jakarta Tenggelam) |
| Sejarah | 1 (Batavia) |

3 are **new this session** (Badak Jawa, Tambora 1815, Jakarta Tenggelam); 6 are the
prior seed articles **rebuilt** to the new standard. Series coverage: spesies-hilang
(2 live), fenomena-alam (2), sungai-pesisir (3), kota-arsip (1), investigasi-terbuka
(2). Full 30-item plan with per-article status in `nali_30_article_editorial_plan.md`.

## 7. Image count and license breakdown

**3 images**, all **public domain** (Wikimedia Commons), all on the Harimau Jawa
article, each with full creator/source/license/alt/caption. 8 other published articles
ship **text-only** by design — no licensed image was sourced yet, and the rules forbid
filler photos. Register: `nali_image_license_register.md`.

## 8. Known limitations

- Source archive is **38, not 80+**. Honest verification was the bottleneck — only
  web-confirmed, traceable sources were added.
- Only **9 of 30** articles are live; the other 21 are planned (sources verified for
  several, more needed for others).
- Only **1 article has images**; 8 are text-only pending licensed visuals.
- Contact email `halo@nali.native.id` is still a **dead placeholder** (centralized in
  `lib/site.ts` as `SITE.email`; founder must wire a real mailbox for `/kontak` + `/koreksi`).
- Confidence enum kept at 4 values (badge) + per-claim "Diperdebatkan"; not a 5-color badge.

## 9. Unverified source backlog

`research_backlog_sources_to_verify.md` — ~50 named candidates across biodiversity,
volcanoes, history, and environment, each needing URL/DOI confirmation before publish.

## 10. Rejected sources and why

`rejected_or_unverified_sources.md` — generic "media reportase" without links, the
"most-polluted-river" ranking (no authoritative source — treated as a claim to debunk),
unlicensed images, social-media sightings; plus high-confidence-but-unverified portals
(MAGMA Indonesia, BRGM, Jalur Rempah) held back until checked.

## 11. QA results

| Gate | Result |
|---|---|
| `npm run lint` | ✓ clean |
| `npm run typecheck` | ✓ clean |
| `npm run check:editorial` | ✓ 38 sources + 9 articles pass |
| `npm run build` | ✓ 63 routes generated |
| Runtime route check (curl) | ✓ 23 routes 200; bogus → 404; /admin → 307 |
| Banned-terms grep (public) | ✓ none in content/app/components/lib |

## 12. Remaining risks

- Publishing investigative articles (28–30) needs careful sourcing + right-of-reply;
  framing scaffolding exists (`/koreksi`) but the pieces themselves are unwritten.
- Text-only articles look sparser than image-rich ones — acceptable but worth filling
  with properly-licensed visuals over time.
- Supabase-backed DB posts bypass MDX frontmatter; the admin editor does **not** yet
  capture claimLedger/evidenceBasis, so DB-authored posts won't show those blocks.
  (Out of sprint scope; flagged for a follow-up.)

## 13. Next recommended sprint

1. Clear 15–20 backlog sources (→ archive ~55–60).
2. Draft the **READY** articles (Coelacanth, Krakatau+Anak Krakatau, Toba, Merapi,
   Samalas, Gambut, Banda, Borobudur) — sources already verified.
3. Source 1–2 PD/CC images per article from Wikimedia/museums.
4. Extend the `/admin` editor to capture evidence basis + claim ledger for DB posts.
5. Wire a real contact mailbox; then enable `/koreksi` workflow end-to-end.

## Acceptance criteria check

1. No misleading first-party fieldwork — **met**.
2. No public seed/dummy/placeholder article — **met**.
3. Substantially more verified sources — **met** (25 → 38, +52%).
4. Every source has metadata + limitations — **met** (validator-enforced).
5. Every article has a Claim Ledger — **met** (9/9 published).
6. Every article has source links — **met**.
7. Photos licensed + attributed — **met** (3/3 PD, credited); most articles image-free by design.
8. `/metodologi`, `/koreksi`, `/seri` exist — **met** (+`/pedoman-sumber`, `/lisensi-foto`).
9. Homepage honestly explains open-source evidence journal — **met**.
10. Build passes — **met**.
11. Editorial validation passes — **met**.
12. Final report exists — **this document**.

**30 articles are NOT complete.** 9 are published to full standard; 21 are planned and
gated. Stated plainly, as instructed.
