import type { JournalArticle } from "./journalArticleTemplate";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphs(value: string) {
  return value
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function list(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function resultTable(article: JournalArticle, caption: string) {
  const rows = article.results.comparisonTable
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.object)}</td><td>${escapeHtml(row.shape)}</td><td>${escapeHtml(
          row.margin,
        )}</td><td>${escapeHtml(row.color)}</td><td>${escapeHtml(row.source)}</td><td>${escapeHtml(
          row.evidenceStatus,
        )}</td></tr>`,
    )
    .join("");
  return `<table class="results-table">
    <caption>${escapeHtml(caption)}</caption>
    <thead><tr><th>Object</th><th>Shape</th><th>Margin</th><th>Apparent colour</th><th>Source</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function statsTable(article: JournalArticle, caption: string) {
  const rows = (article.results.statsTable || [])
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.groupName)}</td><td>${row.meanLength.toFixed(2)} cm</td><td>${row.meanWidth.toFixed(2)} cm</td><td>${row.meanPetiole.toFixed(2)} cm</td></tr>`,
    )
    .join("");
  return `<table class="stats-table">
    <caption>${escapeHtml(caption)}</caption>
    <thead><tr><th>Group</th><th>Mean length</th><th>Mean width</th><th>Mean petiole</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function replicateTable(article: JournalArticle) {
  const rows = (article.results.replicatesTable || [])
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.id)}</td><td>${row.lengthCm.toFixed(1)}</td><td>${row.widthCm.toFixed(
          1,
        )}</td><td>${row.petioleLengthCm.toFixed(1)}</td><td>${escapeHtml(row.shape)}</td><td>${escapeHtml(
          row.marginType,
        )}</td></tr>`,
    )
    .join("");
  return `<table class="measurement-table">
    <caption>Table 3. Raw replicate entries supplied as local QA fixture data (not externally verified).</caption>
    <thead><tr><th>ID</th><th>Length</th><th>Width</th><th>Petiole</th><th>Shape</th><th>Margin</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function evidenceTable(article: JournalArticle) {
  const rows = article.annexure.evidenceTable
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.material_type)}</td><td>${escapeHtml(
          row.summary,
        )}</td><td>${escapeHtml(row.verification_status)}</td></tr>`,
    )
    .join("");
  return `<table class="annex-table">
    <caption>Annex Table A1. Evidence inventory and review status (local QA fixture).</caption>
    <thead><tr><th>ID</th><th>Type</th><th>Summary</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function editorialReadinessTable(article: JournalArticle) {
  const rows = article.premium?.reviewerReadinessChecklist
    .map((item) => `<tr><td>${escapeHtml(item)}</td><td>Perlu verifikasi pengguna</td></tr>`)
    .join("");
  return `<table class="editorial-table">
    <caption>Table E1. Premium reviewer-readiness controls before editorial use.</caption>
    <thead><tr><th>Editorial control</th><th>Status</th></tr></thead>
    <tbody>${rows ?? ""}</tbody>
  </table>`;
}

function visualPlate(number: number, caption: string, premium = false) {
  return `<figure class="figure-plate ${premium ? "refined" : ""}">
    <div class="plate-label">synthetic QA placeholder</div>
    <svg viewBox="0 0 720 210" aria-label="Local QA placeholder figure">
      <rect width="720" height="210" fill="${premium ? "#f5f0e6" : "#f1f4ec"}"/>
      ${
        number === 1
          ? `<path d="M90 104C132 36 249 34 295 104C246 176 133 174 90 104Z" fill="#477052"/>
             <path d="M425 104L465 39L475 80L526 51L503 98L553 123L497 128L506 177L468 142L430 171L440 126L394 113Z" fill="#75945c"/>
             <path d="M89 104H294M425 104H529" stroke="#e9efdd" stroke-width="2"/>
             <text x="190" y="194">Daun A - reported oval form</text><text x="465" y="194">Daun B - reported palmate form</text>`
          : number === 2
            ? `<path d="M120 112C180 64 323 64 385 112C324 159 181 159 120 112Z" fill="#d7e1cb" stroke="#477052" stroke-width="2"/>
             <path d="M78 112H120M120 48V176M385 48V176" stroke="#977047" stroke-width="2"/>
             <path d="M120 45H385M258 70V153" stroke="#38668e" stroke-width="2"/>
             <text x="245" y="35">reported length reading</text><text x="271" y="168">reported width</text>`
            : `<rect x="58" y="77" width="150" height="58" rx="8" fill="#f2e5c8" stroke="#977047" stroke-width="2"/>
             <rect x="286" y="77" width="150" height="58" rx="8" fill="#f2e5c8" stroke="#977047" stroke-width="2"/>
             <rect x="514" y="77" width="150" height="58" rx="8" fill="#f2e5c8" stroke="#977047" stroke-width="2"/>
             <path d="M208 106H286M436 106H514" stroke="#38668e" stroke-width="3"/>
             <path d="M276 98L286 106L276 114M504 98L514 106L504 114" fill="none" stroke="#38668e" stroke-width="3"/>
             <text x="96" y="109">evidence</text><text x="332" y="109">limits</text><text x="548" y="109">revision</text>`
      }
    </svg>
    <figcaption>${escapeHtml(caption)}</figcaption>
  </figure>`;
}

function header(article: JournalArticle, badge = article.capabilities.badge) {
  return `<header class="running-header"><span>NaLI Nature &amp; Evidence Journal</span><strong>${escapeHtml(
    badge,
  )}</strong><span>${escapeHtml(article.metadata.publicExportStatus)}</span></header>`;
}

function references(article: JournalArticle) {
  return article.references.map((reference) => `<p class="reference-item">${escapeHtml(reference)}</p>`).join("");
}

function cover(article: JournalArticle) {
  return `<section class="page cover-page ${article.capabilities.visualVariant}">
    <div class="cover-brand">NaLI / Nature / Evidence</div>
    <span class="tier-badge">${escapeHtml(article.capabilities.badge)}</span>
    <p class="cover-series">${escapeHtml(article.cover.editionLine)}</p>
    <h1>${escapeHtml(article.cover.journalTitle)}</h1>
    <p class="cover-category">${escapeHtml(article.metadata.articleCategory)}</p>
    <h2>${escapeHtml(article.metadata.title)}</h2>
    <div class="cover-rule"></div>
    <p class="cover-value">${escapeHtml(article.metadata.editorialNote)}</p>
    <footer><strong>${escapeHtml(article.cover.brandNote)}</strong><br>${escapeHtml(article.cover.truthNote)}</footer>
  </section>`;
}

function starterPages(article: JournalArticle) {
  return `
  <section class="page article-opener starter">
    ${header(article)}
    <p class="kicker">Limited Starter Output</p>
    <h1>${escapeHtml(article.metadata.title)}</h1>
    <div class="starter-callout"><strong>Starter Draft</strong> Output cepat untuk catatan awal dan praktikum dasar; sengaja bukan jurnal panjang atau audit penuh.</div>
    <h2>STARTER ABSTRACT</h2>${paragraphs(article.abstract.text)}
    <h2>1. BACKGROUND FOR PRACTICUM</h2>${paragraphs(article.introduction)}
  </section>
  <section class="page article-body starter">
    ${header(article)}
    <h2>2. SIMPLE MATERIALS AND METHOD</h2>
    <p>${escapeHtml(article.materialsAndMethods.method)}</p>
    <p>${escapeHtml(article.materialsAndMethods.profileEmphasis)}</p>
    <h2>3. STARTER RESULTS</h2>
    ${resultTable(article, "Table 1. Simple visual comparison from user-provided notes (local QA fixture).")}
    ${paragraphs(article.results.narrative)}
    ${visualPlate(1, "Figure 1. Starter visual plate only; illustrative local QA placeholder, not specimen evidence.")}
  </section>
  <section class="page article-body starter">
    ${header(article)}
    <h2>4. SHORT LIMITATION CHECKLIST</h2>${list(article.limitations)}
    <h2>5. NEXT OBSERVATION STEPS</h2>${list(article.futureDataRequired)}
    <h2>CONCLUSION</h2>${paragraphs(article.conclusion)}
    <div class="upgrade-note"><strong>Upgrade path</strong>${escapeHtml(article.upgradeNote || "")}</div>
    <h2>REFERENCES PROVIDED BY USER</h2>${references(article)}
    <p class="integrity-endnote">${escapeHtml(PUBLIC_REPORT_DISCLAIMER)}</p>
  </section>`;
}

function auditPages(article: JournalArticle) {
  const audit = article.audit!;
  return `
  <section class="page article-opener audit">
    ${header(article)}
    <p class="kicker">Evidence Audit Article</p>
    <h1>${escapeHtml(article.metadata.title)}</h1>
    <div class="audit-card"><strong>Evidence Audit</strong>${escapeHtml(audit.evidenceSufficiencyAssessment)}</div>
    <h2>AUDIT ABSTRACT</h2>${paragraphs(article.abstract.text)}
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>1. INTRODUCTION / SCOPE AND CLAIM BOUNDARY</h2>${paragraphs(article.introduction)}
    <h2>2. LITERATURE REVIEW / CITATION BOUNDARY AUDIT</h2>${paragraphs(article.literatureReview)}
    <div class="audit-card">${escapeHtml(audit.citationBoundaryAudit)}</div>
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>3. MATERIALS AND METHODS / AUDIT PROTOCOL</h2>
    <p>${escapeHtml(article.materialsAndMethods.method)}</p>
    <p>${escapeHtml(article.materialsAndMethods.profileEmphasis)}</p>
    <h2>EVIDENCE INVENTORY</h2>${evidenceTable(article)}
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>4. RESULTS AND DISCUSSION / MEASUREMENT TABLES</h2>
    ${resultTable(article, "Table 1. Reported visual characters retained with source boundary.")}
    ${statsTable(article, "Table 2. Descriptive measurement summary from supplied fixture rows.")}
    ${replicateTable(article)}
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>FIGURE PLATES FOR AUDIT TRACEABILITY</h2>
    ${visualPlate(1, "Figure 1. Reported shape comparison; illustrative QA plate only.")}
    ${visualPlate(2, "Figure 2. Measurement traceability guide; illustrative QA plate only.")}
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>EVIDENCE SUFFICIENCY ASSESSMENT</h2><div class="sufficiency-card">${escapeHtml(
      audit.evidenceSufficiencyAssessment,
    )}<p>${escapeHtml(audit.reliabilityScore)}</p></div>
    <h2>CANNOT BE CONCLUDED</h2><div class="cannot-conclude">${escapeHtml(article.cannotBeConcluded)}</div>
    <h2>DATA RISK REGISTER</h2>${list(audit.dataRiskRegister)}
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>METHODOLOGICAL VULNERABILITY</h2>${paragraphs(audit.methodologicalVulnerability)}
    <h2>SOURCE GAP ANALYSIS</h2>${paragraphs(audit.sourceGapAnalysis)}
    <h2>CONCLUSIONS</h2>${paragraphs(article.conclusion)}
    <div class="upgrade-note subtle">${escapeHtml(article.upgradeNote || "")}</div>
  </section>
  <section class="page article-body audit">
    ${header(article)}
    <h2>ANNEXURE</h2>${replicateTable(article)}
    <h2>REFERENCES</h2>${references(article)}
    <p class="integrity-endnote">${escapeHtml(PUBLIC_REPORT_DISCLAIMER)}</p>
  </section>`;
}

function premiumPages(article: JournalArticle) {
  const premium = article.premium!;
  return `
  <section class="page article-opener premium">
    ${header(article)}
    <p class="kicker">Premium Journal Draft</p>
    <h1>${escapeHtml(article.metadata.title)}</h1>
    <div class="editorial-panel"><strong>Executive Editorial Summary</strong>${escapeHtml(
      premium.executiveEditorialSummary,
    )}</div>
    <h2>EDITORIAL ABSTRACT</h2>${paragraphs(article.abstract.text)}
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>1. INTRODUCTION</h2>${paragraphs(article.introduction)}
    <h2>2. INTEGRATED LITERATURE FRAMING</h2>${paragraphs(premium.integratedLiteratureFraming)}
    ${paragraphs(article.literatureReview)}
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>3. MATERIALS AND METHODS</h2>
    <p>${escapeHtml(article.materialsAndMethods.method)}</p>
    <p>${escapeHtml(article.materialsAndMethods.profileEmphasis)}</p>
    <p>${escapeHtml(article.materialsAndMethods.observationDesign)}</p>
    <div class="editorial-panel"><strong>Traceability Boundary</strong>${escapeHtml(
      article.materialsAndMethods.missingDetails,
    )}</div>
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>4. RESULTS</h2>
    ${resultTable(article, premium.refinedTableCaptions[0])}
    ${statsTable(article, premium.refinedTableCaptions[1])}
    ${replicateTable(article)}
  </section>
  <section class="page article-body premium figures">
    ${header(article)}
    <h2>REFINED FIGURE CAPTIONS AND PLATES</h2>
    ${visualPlate(1, premium.refinedFigureCaptions[0], true)}
    ${visualPlate(2, premium.refinedFigureCaptions[1], true)}
  </section>
  <section class="page article-body premium figures">
    ${header(article)}
    <h2>EDITORIAL STRUCTURE HARMONIZATION</h2>
    ${visualPlate(3, premium.refinedFigureCaptions[2], true)}
    <div class="editorial-panel"><strong>Editorial control</strong>The premium structure connects supplied material, declared limits, and revision work without treating editorial organization as verification.</div>
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>5. INTEGRATED DISCUSSION</h2>${paragraphs(article.discussion)}
    <div class="editorial-panel">${escapeHtml(premium.integratedDiscussion)}</div>
    <h2>EDUCATION AND CONSERVATION RELEVANCE</h2>${paragraphs(article.conservationRelevance)}
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>6. EVIDENCE AND SOURCE LIMITS</h2>${list(article.limitations)}
    <div class="cannot-conclude"><strong>Cannot be concluded</strong>${escapeHtml(article.cannotBeConcluded)}</div>
    <h2>7. PREMIUM CONCLUSION</h2>${paragraphs(article.conclusion)}
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>8. PUBLICATION-STYLE REVISION NOTES</h2>${list(premium.publicationStyleRevisionNotes)}
    <h2>9. REVIEWER-READINESS CHECKLIST</h2>${list(premium.reviewerReadinessChecklist)}
    ${editorialReadinessTable(article)}
    <div class="editorial-panel">Advanced structure harmonization: re-check title, abstract, captions, limits, and conclusion after evidence is completed.</div>
  </section>
  <section class="page article-body premium">
    ${header(article)}
    <h2>10. ANNEXURE AND REFERENCES PRESENTATION</h2>${evidenceTable(article)}
    ${replicateTable(article)}
    <h2>REFERENCES</h2>${references(article)}
  </section>
  <section class="page article-body premium finale">
    ${header(article)}
    <p class="kicker">Editorial Integrity Sheet</p>
    <h2>DOCUMENT STATUS</h2>
    <div class="editorial-panel"><strong>Premium draft, not final truth</strong>${escapeHtml(
      article.metadata.sourceVerificationStatus,
    )}. ${escapeHtml(article.metadata.publicExportStatus)}.</div>
    <h2>FINAL RESPONSIBILITY</h2>
    <p>Human review remains final. Tidak ada identifikasi spesies, DOI, ISSN, koordinat, foto, atau bukti verifikasi yang dibuat oleh dokumen ini.</p>
    <p class="integrity-endnote">${escapeHtml(PUBLIC_REPORT_DISCLAIMER)}</p>
  </section>`;
}

export function buildJournalHtml(article: JournalArticle) {
  const pages =
    article.modelId === "peregrine"
      ? starterPages(article)
      : article.modelId === "obsidian"
        ? auditPages(article)
        : premiumPages(article);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.metadata.title)} | ${escapeHtml(article.cover.journalTitle)}</title>
  <style>
    :root { --forest:#10231b; --canopy:#315f45; --moss:#728347; --paper:#fffdf8; --stone:#f2eee4; --line:#cfc6b7; --muted:#59645e; --gold:#ad8438; --audit:#314752; }
    * { box-sizing:border-box; }
    @page { size:A4; margin:0; }
    html, body { margin:0; background:#d9d8d2; color:var(--forest); font-family:Georgia, "Times New Roman", serif; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    .page { background:var(--paper); break-after:page; height:297mm; overflow:hidden; padding:16mm 16mm 17mm; position:relative; width:210mm; }
    .page:last-child { break-after:auto; }
    .cover-page { color:#faf8f0; padding:18mm; }
    .cover-page.starter { background:#244535; }
    .cover-page.audit { background:linear-gradient(125deg,#172831,#344e53); }
    .cover-page.premium { background:linear-gradient(133deg,#0d251c,#1f4e37 55%,#a27c38); }
    .cover-brand { border-bottom:1px solid rgba(255,255,255,.35); font:700 10px Arial,sans-serif; letter-spacing:.18em; padding-bottom:5mm; text-transform:uppercase; }
    .tier-badge { border:1px solid rgba(255,255,255,.5); display:inline-block; font:700 10px Arial,sans-serif; letter-spacing:.13em; margin-top:18mm; padding:3mm 5mm; text-transform:uppercase; }
    .starter .tier-badge { margin-top:28mm; }
    .premium .tier-badge { border-color:#e7cd8b; color:#f4d993; }
    .cover-series { font:10px Arial,sans-serif; letter-spacing:.13em; margin-top:15mm; text-transform:uppercase; }
    .cover-page h1 { font-size:42px; font-weight:400; line-height:1.12; margin:9mm 0 18mm; max-width:160mm; }
    .cover-page.starter h1 { font-size:34px; margin-bottom:28mm; max-width:125mm; }
    .cover-category { color:#dce7d4; font:700 10px Arial,sans-serif; letter-spacing:.15em; text-transform:uppercase; }
    .cover-page h2 { font-size:27px; font-weight:400; line-height:1.25; max-width:154mm; }
    .cover-rule { border-top:2px solid rgba(255,255,255,.45); margin:12mm 0 6mm; width:76mm; }
    .cover-value { color:#e5e2d7; font:12px/1.6 Arial,sans-serif; max-width:135mm; }
    .cover-page footer { bottom:17mm; color:#dbe0d5; font:9px/1.7 Arial,sans-serif; left:18mm; position:absolute; }
    .running-header { align-items:center; border-bottom:1px solid var(--line); color:var(--muted); display:flex; font:8.5px Arial,sans-serif; justify-content:space-between; letter-spacing:.1em; margin-bottom:10mm; padding-bottom:3mm; text-transform:uppercase; }
    .running-header strong { color:var(--canopy); }
    .audit .running-header strong { color:var(--audit); }
    .premium .running-header strong { color:var(--gold); }
    .kicker { color:var(--canopy); font:700 10px Arial,sans-serif; letter-spacing:.17em; margin:0 0 6mm; text-transform:uppercase; }
    .premium .kicker { color:var(--gold); }
    .article-opener h1 { font-size:32px; font-weight:400; line-height:1.18; margin:0 0 8mm; max-width:170mm; }
    h2 { border-top:1px solid var(--line); color:var(--canopy); font:700 12px Arial,sans-serif; letter-spacing:.08em; margin:8mm 0 4mm; padding-top:3mm; text-transform:uppercase; }
    .audit h2 { color:var(--audit); }
    .premium h2 { color:#795b24; }
    p { font-size:10.5px; line-height:1.58; margin:0 0 3mm; text-align:justify; }
    .article-opener > p:not(.kicker), .article-opener h2 ~ p { max-width:168mm; }
    .starter-callout, .audit-card, .editorial-panel, .sufficiency-card, .cannot-conclude, .upgrade-note { border-left:4px solid var(--moss); background:#eff2e8; font:10px/1.58 Arial,sans-serif; margin:5mm 0 7mm; padding:4mm 5mm; }
    .audit-card, .sufficiency-card, .cannot-conclude { background:#edf1f2; border-left-color:var(--audit); }
    .editorial-panel { background:#f4efe5; border-left-color:var(--gold); }
    .upgrade-note { background:#f4f2ea; }
    .upgrade-note.subtle { color:var(--muted); font-size:9.5px; }
    .starter-callout strong, .audit-card strong, .editorial-panel strong, .upgrade-note strong, .cannot-conclude strong { display:block; font-weight:700; letter-spacing:.06em; margin-bottom:2mm; text-transform:uppercase; }
    table { border-collapse:collapse; font:8.6px/1.38 Arial,sans-serif; margin:4mm 0 7mm; width:100%; }
    caption { color:var(--forest); font:bold 9.5px/1.45 Arial,sans-serif; margin-bottom:2mm; text-align:left; }
    th { background:var(--canopy); color:#fffdf8; text-align:left; }
    .audit th { background:var(--audit); }
    .premium th { background:#6b542c; }
    td, th { border:1px solid var(--line); padding:2.2mm; vertical-align:top; }
    tbody tr:nth-child(even) td { background:#f6f3ea; }
    ul { font:10px/1.52 Arial,sans-serif; margin:3mm 0 7mm; padding-left:6mm; }
    li { margin-bottom:2.2mm; }
    .figure-plate { margin:6mm 0 10mm; position:relative; }
    .figure-plate svg { border:1px solid var(--line); display:block; height:62mm; width:100%; }
    .figure-plate text { fill:var(--muted); font:11px Arial,sans-serif; text-anchor:middle; }
    .plate-label { background:white; border:1px solid var(--line); color:var(--muted); font:700 8px Arial,sans-serif; letter-spacing:.12em; padding:2mm 3mm; position:absolute; right:4mm; top:4mm; text-transform:uppercase; z-index:1; }
    figcaption { border-left:3px solid var(--moss); font:9.5px/1.5 Arial,sans-serif; margin-top:3mm; padding-left:4mm; }
    .refined figcaption { border-left-color:var(--gold); }
    .reference-item { font-size:9px; color:var(--muted); }
    .integrity-endnote { border-top:1px solid var(--line); color:var(--muted); font:9px/1.55 Arial,sans-serif; margin-top:9mm; padding-top:4mm; }
    .two-column { column-count:2; column-gap:8mm; }
    @media screen { .page { box-shadow:0 2mm 8mm rgba(0,0,0,.12); margin:8mm auto; } }
    @media print { html, body { background:white; } .page { margin:0; } }
  </style>
</head>
<body data-publication-edition="v8" data-model-tier="${escapeHtml(article.capabilities.tier)}">
  ${cover(article)}
  ${pages}
</body>
</html>`;
}
