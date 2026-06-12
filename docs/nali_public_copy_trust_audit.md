# NaLI, Public Copy Trust Audit (Phase 2 & 3)

_Internal note. What public-facing demo/fieldwork language existed, how it was classified, and what it became._

## Method

```
grep -RniE "[demo markers and first-person fieldwork phrases]" .
```

Note: bare **"contoh"** is ordinary Indonesian for "example" and is allowed in prose
(e.g. "contoh klasik"). Only the demo marker **"contoh (seed)"** and the other terms
are treated as banned. Likewise HTML `placeholder=` attributes in components are
legitimate code, not public copy.

## Classification of matches

| Match location | Class | Action |
|---|---|---|
| 5 articles: `> _Artikel contoh (seed)…_` disclaimers | Public content | **Removed**; replaced with evidence-basis frontmatter + claim ledger |
| 2 field notes: old demo-style field note disclaimer | Public content | **Removed**; notes rewritten as third-party research notes |
| 2 field notes: first-person field voice ("Pendakian dimulai…", "yang terlihat dari pinggir") | Public content | **Rewritten** to third-person open-source synthesis |
| `app/page.tsx`: old real-location field-note wording | Public UI | **Reframed** → "Catatan riset dari laporan dan observasi pihak ketiga" |
| `app/page.tsx`, FAQ + Arsip callout: old daily-publication wording | Public UI | **Softened** → "Menuju publikasi rutin" / "Setiap klaim bersumber" |
| Sources/articles prose: "contoh klasik/nyata/bagus" | Public content | **Kept**, ordinary Indonesian "example", not demo language |
| `components/NewsletterSignup.tsx`, `PostEditor.tsx`: `placeholder=` | Code attribute | **Kept**, legitimate HTML |
| `app/admin/page.tsx`: "(Artikel contoh masih tampil…)" | Admin-only (gated) | **Reworded** → "(Artikel dari file MDX bawaan…)" |
| `CLAUDE.md`, `NALI_MASTER_DOCUMENT*.md`, `README.md` | Internal docs | **Left as-is** (not public UI) |

## Before / after examples

**Field note (subuh-di-kawah-ijen)**
- Before: old demo disclaimer plus first-person field voice.
- After: third-person research synthesis from reports, researcher documentation, and traceable public references.

**Article (api-biru-kawah-ijen)**
- Before: _"Artikel contoh (seed) untuk mendemonstrasikan sistem NaLI…"_
- After: disclaimer removed; added `evidenceBasis: jurnal ilmiah`, `firstPartyFieldwork: false`, a 3-row Claim Ledger, and explicit `limitations`.

**Homepage hero subcopy**
- Before: old field-journal positioning.
- After: _"Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia. Kami membaca jurnal, arsip, laporan lembaga, dataset, dan dokumentasi lapangan pihak ketiga…"_

**FAQ, new honest item added**
- _"Apakah NaLI turun langsung ke lapangan? Belum. Untuk saat ini NaLI bekerja dari sumber terbuka… Kami tidak mengklaim observasi lapangan pribadi kecuali bukti lapangan pertama tersedia dan ditampilkan jelas."_

## Catatan Riset reframe (Phase 3)

Chose **Option B** (keep the `/catatan-lapangan` route to avoid breaking links) +
explicit scope. Page is now titled **"Catatan Riset"** with a banner:
_"Bukan klaim observasi pribadi NaLI. Halaman ini merangkum bukti lapangan dari
peneliti, lembaga, arsip, foto berlisensi, dan sumber publik yang dapat ditelusuri."_
Notes now carry `evidenceType`, `limitations`, and traceable `sources`.

## Verification

`grep` over `content/` after edits → zero `(seed)/dummy/ilustratif/observasi kami/...`
matches. `npm run check:editorial` → pass.
