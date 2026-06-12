# NaLI Article Expansion Report

Tanggal: 2026-06-12

## Ringkasan

Artikel terbit bertambah dari 9 menjadi 32. Sprint ini menerbitkan 23 artikel baru source-backed. Jumlah ini dipilih karena kualitas dan verifikasi sumber lebih penting daripada memaksa 30 artikel penuh.

## Artikel Baru

- anak-krakatau-2018-runtuhan-tsunami
- anoa-sulawesi-fragmentasi-hutan
- babirusa-evolusi-aneh-wallacea
- banda-neira-pala-kekerasan-kolonial-arsip
- borobudur-arsip-restorasi-batu-air-pelestarian
- cenderawasih-papua-perdagangan-habitat
- coelacanth-sulawesi-fosil-hidup-laut-dalam
- deforestasi-kalimantan-data-terbuka
- dieng-kawah-gas-bahaya-senyap
- gambut-indonesia-karbon-api-kabut
- harimau-bali-kepunahan-arsip
- kelud-danau-kawah-rekayasa-bahaya
- komodo-predator-pulau-tekanan-konservasi
- krakatau-1883-tsunami-arsip-global
- mangrove-indonesia-karbon-biru
- merapi-awan-panas-pemantauan
- orangutan-tapanuli-spesies-baru-habitat-terbatas
- peta-lama-nusantara-kolonial-membaca-pulau-kuasa
- samalas-1257-babad-geologi
- sampah-plastik-laut-indonesia-data-kebijakan
- tarsius-primata-malam-sulawesi
- terumbu-karang-indonesia-iklim
- toba-supervolcano-perdebatan-dampak

## Article Count by Category

- alam: 22
- investigasi: 5
- sejarah: 5

## Trust Blocks

Setiap artikel baru memuat sourceIds, daftar sumber untuk render, evidenceBasis, firstPartyFieldwork: false, limitations, Claim Ledger, dan bukti visual eksternal. Artikel lama diberi sourceIds dan catatan visual aman bila belum punya bukti visual terverifikasi.

## QA Result

Final QA pada branch `deep-archive-article-expansion`:

- `npm run lint` - pass
- `npm run typecheck` - pass
- `npm run check:editorial` - pass (146 sources checked)
- `npm run build` - pass (171 routes; 146 source-detail SSG pages)
- `npm test --if-present` - pass/no-op because package.json has no `test` script
- Local route smoke check - pass for `/`, `/articles`, category pages, `/seri`, `/arsip-sumber`, one source detail page, and one new article detail page with Basis tulisan + Claim Ledger + external visual evidence

## Files Changed

- content/articles/*.mdx
- content/sources/*.mdx
- docs/nali_deep_archive_expansion_report.md
- docs/nali_article_expansion_report.md
- docs/nali_image_license_register.md
- docs/research_backlog_sources_to_verify.md
- docs/rejected_or_unverified_sources.md
- lib/content.ts
- lib/types.ts
- app/articles/[slug]/page.tsx
- scripts/validate-editorial-content.mjs

## Visual Design Preservation

Visual identity preserved. Article pages only gained one fallback note block for cases where no safe visual is available; the block reuses the existing dashed border, mono text, and muted editorial style. No navbar, footer, homepage composition, color palette, typography scale, spacing rhythm, card style, or article layout aesthetics were redesigned.

## Known Limitations

- Published article count reaches the minimum target, not the 30-article stretch, because several recommended history/environment topics still need item-level source verification.
- Most new visuals are external evidence links, not displayed assets, because licenses were not clear enough for redisplay.
