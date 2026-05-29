import type { JournalQualityResult } from "./journalQuality";

export interface JournalArticlePreviewModel {
  coverHtml: string;
  articleHtml: string;
  fullHtml: string;
  markdown: string;
}

function escapeHtml(value: string | undefined | null) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderJournalPreview(
  candidate: any,
  quality: JournalQualityResult,
  providerMetadata: any
): JournalArticlePreviewModel {
  const title = escapeHtml(candidate?.title || "Draf Artikel Akademik");
  const author = "Draf bantuan belajar/penulisan berbasis bukti (Pengguna NaLI)";
  const date = escapeHtml(new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }));
  const modelUsed = escapeHtml(providerMetadata?.model_used || "NaLI Preview Engine");
  
  const abstract = escapeHtml(candidate?.abstract || "");
  const keywords = Array.isArray(candidate?.keywords) ? candidate.keywords.join(", ") : "";
  const introduction = escapeHtml(candidate?.introduction || "");
  const literatureReview = escapeHtml(candidate?.literatureReview || candidate?.literature_review || "Belum ada referensi yang disediakan pengguna.");
  const materialsAndMethods = escapeHtml(candidate?.materialsAndMethods || candidate?.methods || "");
  const results = escapeHtml(candidate?.results || "");
  const discussion = escapeHtml(candidate?.discussion || "");
  const conclusion = escapeHtml(candidate?.conclusion || "");
  
  const limitations = Array.isArray(candidate?.limitations) 
    ? candidate.limitations.map((l: string) => `<li>${escapeHtml(l)}</li>`).join("")
    : `<li>${escapeHtml(candidate?.limitations || "")}</li>`;

  const futureResearch = Array.isArray(candidate?.futureResearch || candidate?.future_research)
    ? (candidate.futureResearch || candidate.future_research).map((fr: string) => `<li>${escapeHtml(fr)}</li>`).join("")
    : `<li>${escapeHtml(candidate?.futureResearch || candidate?.future_research || "")}</li>`;

  // References list
  const referencesArray = Array.isArray(candidate?.referencesSuppliedByUser) 
    ? candidate.referencesSuppliedByUser 
    : [candidate?.referencesSuppliedByUser || "Belum ada referensi yang disediakan pengguna."];
  const referencesHtml = referencesArray.map((ref: string) => `<li>${escapeHtml(ref)}</li>`).join("");

  // Evidence Table
  const evidenceRows = Array.isArray(candidate?.evidenceTable) ? candidate.evidenceTable : [];
  const evidenceHtml = evidenceRows.map((row: any, idx: number) => {
    return `<tr>
      <td>${escapeHtml(row.id || row.claim || `EV-${idx}`)}</td>
      <td>${escapeHtml(row.material_type || row.evidenceType || "Catatan")}</td>
      <td>${escapeHtml(row.summary || row.details || row.limitation || "")}</td>
      <td>${escapeHtml(row.verification_status || row.confidence || row.source || "unverified")}</td>
    </tr>`;
  }).join("");

  // Annexure
  const annexureItems = Array.isArray(candidate?.annexure) ? candidate.annexure : [];
  const annexureHtml = annexureItems.map((item: any, idx: number) => {
    const details = Array.isArray(item.details) 
      ? item.details.map((d: string) => `<li>${escapeHtml(d)}</li>`).join("")
      : `<li>${escapeHtml(item.details || "")}</li>`;
    return `<div class="annex-item">
      <h4>${escapeHtml(item.label || `Lampiran ${idx + 1}`)}</h4>
      <ul>${details}</ul>
    </div>`;
  }).join("");

  // 1. Cover HTML (NaLI-neutral conservation layout)
  const coverHtml = `
    <div class="journal-cover" style="font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: #06140e; color: #e2f1ea; border: 2px solid #14261c; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="border-bottom: 2px solid #00ffb3; padding-bottom: 20px; text-align: center;">
        <h1 style="font-size: 28px; margin: 0; color: #00ffb3; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">NaLI Nature & Evidence Journal</h1>
        <p style="font-size: 12px; margin: 5px 0 0 0; color: #8ba297; text-transform: uppercase; letter-spacing: 2px;">Field Intelligence & Conservation Reports</p>
      </div>
      <div style="padding: 60px 0; text-align: center;">
        <h2 style="font-size: 24px; margin: 0 auto; max-width: 600px; line-height: 1.4; color: #ffffff;">${title}</h2>
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #a3c4b5;">${author}</p>
      </div>
      <div style="border-top: 1px solid #14261c; padding-top: 20px; font-size: 11px; color: #8ba297; display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div><strong>Status Dokumen:</strong> Draf Kandidat Jurnal (Bukan Publikasi)</div>
        <div><strong>Waktu Pembuatan:</strong> ${date}</div>
        <div><strong>Mesin Pemroses:</strong> ${modelUsed}</div>
      </div>
      <div style="margin-top: 30px; padding: 15px; border: 1px dashed #ff4e4e; background: rgba(255, 78, 78, 0.05); color: #ffacac; font-size: 11px; text-align: center; border-radius: 6px;">
        ⚠️ <strong>PEMBERITAHUAN INTEGRITAS:</strong> Draf ini dibuat oleh NaLI sebagai kandidat artikel akademik. Belum peer-reviewed, belum diterbitkan, tidak memiliki DOI/ISSN, dan PDF publik belum aktif di CP1.
      </div>
    </div>
  `;

  // 2. Article HTML (Dense Single-Column structure)
  const articleHtml = `
    <article class="journal-article" style="font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1f2937; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); line-height: 1.6;">
      <header style="border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
        <span style="font-size: 12px; font-weight: bold; color: #047857; text-transform: uppercase; font-family: sans-serif;">Draf Kandidat Artikel Akademik</span>
        <h1 style="font-size: 26px; margin: 10px 0 5px 0; color: #111827; line-height: 1.2;">${title}</h1>
        <div style="font-size: 13px; color: #4b5563; font-family: sans-serif;">
          <span>${author}</span> &bull; <span>Dibuat: ${date}</span> &bull; <span>Model: ${modelUsed}</span>
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: #dc2626; font-family: sans-serif; font-weight: bold; padding: 5px; border: 1px solid #fca5a5; background: #fee2e2; border-radius: 4px;">
          Format ini adalah draf akademik, bukan jurnal terbit. PDF jurnal publik belum aktif di CP1.
        </div>
      </header>

      <section class="abstract-section" style="background: #f9fafb; padding: 20px; border-left: 4px solid #047857; margin-bottom: 30px; font-style: italic;">
        <h3 style="margin-top: 0; font-family: sans-serif; font-style: normal; font-size: 15px; color: #111827; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Abstrak</h3>
        <p style="margin-bottom: 10px;">${abstract}</p>
        <p style="margin-bottom: 0; font-family: sans-serif; font-size: 13px; font-style: normal; color: #374151;">
          <strong>Kata Kunci:</strong> ${keywords}
        </p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">1. PENDAHULUAN</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${introduction}</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">2. TINJAUAN PUSTAKA (LITERATURE REVIEW)</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${literatureReview}</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">3. MATERI DAN METODE</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${materialsAndMethods}</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">4. HASIL (RESULTS)</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${results}</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">5. PEMBAHASAN (DISCUSSION)</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${discussion}</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">6. KESIMPULAN</h2>
        <p style="text-indent: 2em; margin-bottom: 1.5em; text-align: justify;">${conclusion}</p>
      </section>

      <section style="margin-bottom: 30px; font-family: sans-serif; font-size: 14px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">7. BATASAN & ARAH PENELITIAN</h2>
        <h3 style="font-size: 15px; margin-top: 15px; color: #334155;">Batasan Penelitian (Limitations)</h3>
        <ul style="padding-left: 20px; line-height: 1.5;">${limitations}</ul>
        <h3 style="font-size: 15px; margin-top: 15px; color: #334155;">Riset Masa Depan (Future Research)</h3>
        <ul style="padding-left: 20px; line-height: 1.5;">${futureResearch}</ul>
      </section>

      ${evidenceHtml ? `
      <section style="margin-bottom: 30px; font-family: sans-serif;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-weight: bold; text-transform: uppercase;">Tabel Bukti Observasi</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Klaim/ID</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Tipe Bukti</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Ringkasan</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0;">Status Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceHtml}
          </tbody>
        </table>
      </section>
      ` : ""}

      ${annexureHtml ? `
      <section style="margin-bottom: 30px; font-family: sans-serif;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-weight: bold; text-transform: uppercase;">Lampiran (Annexure)</h2>
        <div style="margin-top: 15px;">${annexureHtml}</div>
      </section>
      ` : ""}

      <section style="margin-bottom: 30px; font-family: sans-serif; font-size: 14px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a; font-weight: bold; text-transform: uppercase;">Referensi</h2>
        <ul style="padding-left: 20px; line-height: 1.6; list-style-type: decimal;">${referencesHtml}</ul>
      </section>

      <footer style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center; font-family: sans-serif;">
        <p style="margin: 0;">NatIve Field Intelligence Services &bull; NaLI Nature & Evidence Journal</p>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Draf ini dibuat oleh NaLI sebagai kandidat artikel akademik. Belum peer-reviewed, belum diterbitkan, tidak memiliki DOI, dan PDF publik belum aktif di CP1.</p>
      </footer>
    </article>
  `;

  // 3. Markdown Output
  const markdown = `
# ${candidate?.title || "Draf Artikel Akademik"}

**Institusi / Pengarang**: ${author}  
**Tanggal Dibuat**: ${date}  
**Model AI Pemroses**: ${modelUsed}  

> [!WARNING]
> **Pernyataan Kejujuran Akademik:** Format ini adalah draf akademik, bukan jurnal terbit. PDF jurnal publik belum aktif di CP1. NaLI tidak membuat DOI, ISSN, nama jurnal, publisher, atau referensi palsu. Benchmark ini mengikuti disiplin struktur akademik, bukan menyalin identitas jurnal.

---

### Abstrak
${candidate?.abstract || ""}

**Kata Kunci**: ${keywords}

---

## 1. PENDAHULUAN
${introduction}

## 2. TINJAUAN PUSTAKA (LITERATURE REVIEW)
${literatureReview}

## 3. MATERI DAN METODE
${materialsAndMethods}

## 4. HASIL (RESULTS)
${results}

## 5. PEMBAHASAN (DISCUSSION)
${discussion}

## 6. KESIMPULAN
${conclusion}

---

## 7. BATASAN & ARAH PENELITIAN

### Batasan Penelitian (Limitations)
${Array.isArray(candidate?.limitations) 
  ? candidate.limitations.map((l: string) => `- ${l}`).join("\n") 
  : `- ${candidate?.limitations || ""}`}

### Riset Masa Depan (Future Research)
${Array.isArray(candidate?.futureResearch || candidate?.future_research) 
  ? (candidate.futureResearch || candidate.future_research).map((fr: string) => `- ${fr}`).join("\n") 
  : `- ${candidate?.futureResearch || candidate?.future_research || ""}`}

---

${evidenceRows.length > 0 ? `
## Tabel Bukti Observasi
| Klaim/ID | Tipe Bukti | Ringkasan | Status Verifikasi |
|---|---|---|---|
${evidenceRows.map((row: any, idx: number) => `| ${row.id || row.claim || `EV-${idx}`} | ${row.material_type || row.evidenceType || "Catatan"} | ${row.summary || row.details || row.limitation || ""} | ${row.verification_status || row.confidence || row.source || "unverified"} |`).join("\n")}
` : ""}

${annexureItems.length > 0 ? `
## Lampiran (Annexure)
${annexureItems.map((item: any, idx: number) => {
  const detailsStr = Array.isArray(item.details) 
    ? item.details.map((d: string) => `  - ${d}`).join("\n") 
    : `  - ${item.details || ""}`;
  return `### ${item.label || `Lampiran ${idx + 1}`}\n${detailsStr}`;
}).join("\n\n")}
` : ""}

## Referensi
${referencesArray.map((ref: string, idx: number) => `${idx + 1}. ${ref}`).join("\n")}

---
*Draf ini dibuat oleh NaLI sebagai kandidat artikel akademik. Belum peer-reviewed, belum diterbitkan, tidak memiliki DOI, dan PDF publik belum aktif di CP1.*
  `.trim();

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Preview Draf Jurnal</title>
      <style>
        body { background: #f3f4f6; margin: 0; padding: 20px; }
      </style>
    </head>
    <body>
      ${coverHtml}
      ${articleHtml}
    </body>
    </html>
  `;

  return {
    coverHtml,
    articleHtml,
    fullHtml,
    markdown,
  };
}
