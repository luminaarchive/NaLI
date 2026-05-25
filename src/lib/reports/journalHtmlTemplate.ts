import type { JournalArticle } from "./journalArticleTemplate";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";

function escapeHtml(value: string) {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraphs(value: string) {
  if (!value) return "";
  return value
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderList(items: string[]) {
  if (!items) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function buildJournalHtml(article: JournalArticle) {
  const isExpandedModel = article.metadata.modelLabel.includes("Obsidian") || article.metadata.modelLabel.includes("Zephyr");
  
  // Conditional page break helper
  const breakResults = isExpandedModel ? 'style="break-before: page;"' : '';
  const breakFigures = isExpandedModel ? 'style="break-before: page;"' : '';
  const breakAnnex = isExpandedModel ? 'style="break-before: page;"' : '';
  const breakReferences = isExpandedModel ? 'style="break-before: page;"' : '';

  const resultRows = article.results.comparisonTable
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.object)}</td>
        <td>${escapeHtml(row.shape)}</td>
        <td>${escapeHtml(row.margin)}</td>
        <td>${escapeHtml(row.color)}</td>
        <td>${escapeHtml(row.source)}</td>
        <td>${escapeHtml(row.evidenceStatus)}</td>
      </tr>`,
    )
    .join("");

  const statsRows = (article.results.statsTable || [])
    .map(
      (row) => `<tr>
        <td><strong>${escapeHtml(row.groupName)}</strong></td>
        <td>${row.meanLength.toFixed(2)} cm</td>
        <td>${row.meanWidth.toFixed(2)} cm</td>
        <td>${row.meanPetiole.toFixed(2)} cm</td>
      </tr>`
    )
    .join("");

  const replicateRows = (article.results.replicatesTable || [])
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${row.id.startsWith("A") ? "Daun A" : "Daun B"}</td>
        <td>${row.lengthCm.toFixed(1)} cm</td>
        <td>${row.widthCm.toFixed(1)} cm</td>
        <td>${row.petioleLengthCm.toFixed(1)} cm</td>
        <td>${escapeHtml(row.shape)}</td>
        <td>${escapeHtml(row.marginType)}</td>
      </tr>`
    )
    .join("");

  const evidenceRows = article.annexure.evidenceTable
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${escapeHtml(row.material_type)}</td>
        <td>${escapeHtml(row.summary)}</td>
        <td>${escapeHtml(row.verification_status)}</td>
      </tr>`,
    )
    .join("");

  const referencesListHtml = article.references
    .map(
      (ref) => `<div class="reference-item">${escapeHtml(ref)}</div>`
    )
    .join("");

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.metadata.title)} | ${escapeHtml(article.cover.journalTitle)}</title>
  <style>
    :root {
      --forest: #10231b;
      --canopy: #315f45;
      --canopy-bright: #177043;
      --moss: #728347;
      --leaf: #b4ce70;
      --mist: #e8eee0;
      --paper: #fffdf8;
      --stone: #f2eee4;
      --line: #cfc6b7;
      --muted: #59645e;
    }
    * { box-sizing: border-box; }
    @page cover { size: A4; margin: 0; }
    @page article { size: A4; margin: 16mm 15mm 18mm; }
    html, body {
      margin: 0;
      padding: 0;
      background: #dad8d0;
      color: var(--forest);
      font-family: Georgia, "Times New Roman", serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    p { orphans: 3; widows: 3; }
    .cover-page {
      page: cover;
      background: linear-gradient(133deg, #0f5d37 0%, #167745 52%, #0e492c 100%);
      break-after: page;
      color: #fffdf8;
      height: 297mm;
      overflow: hidden;
      padding: 17mm 17mm 0;
      position: relative;
      width: 210mm;
    }
    .cover-page::after {
      background: linear-gradient(90deg, rgba(12, 47, 29, .16), rgba(12, 47, 29, .64));
      bottom: 0;
      content: "";
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 1;
    }
    .cover-top, .cover-heading, .volume-issue-block, .cover-article, .publisher-band {
      position: relative;
      z-index: 3;
    }
    .cover-top {
      align-items: center;
      border-bottom: 1px solid rgba(247, 245, 238, .42);
      display: flex;
      font: 700 9px/1.45 Arial, sans-serif;
      justify-content: space-between;
      letter-spacing: .16em;
      padding-bottom: 5mm;
      text-transform: uppercase;
    }
    .brand-lockup { align-items: center; display: flex; gap: 3.5mm; }
    .brand-leaf {
      border: 1px solid rgba(247, 245, 238, .62);
      border-radius: 50%;
      display: block;
      height: 13mm;
      padding: 2mm;
      width: 13mm;
    }
    .edition-note {
      color: rgba(248, 247, 240, .78);
      font-size: 8px;
      letter-spacing: .12em;
    }
    .cover-heading {
      margin-top: 19mm;
      max-width: 133mm;
    }
    .cover-kicker {
      color: #e4edd3;
      font: 700 9.5px/1 Arial, sans-serif;
      letter-spacing: .2em;
      margin: 0 0 6mm;
      text-transform: uppercase;
    }
    .cover-heading h1 {
      font-family: Arial, sans-serif;
      font-size: 40px;
      font-weight: 700;
      letter-spacing: -.035em;
      line-height: 1.03;
      margin: 0;
    }
    .cover-heading h1 span {
      display: block;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 44px;
      font-weight: 400;
      letter-spacing: -.025em;
      margin-top: 2mm;
    }
    .volume-issue-block {
      background: #f7f5ee;
      color: var(--forest);
      display: grid;
      font-family: Arial, sans-serif;
      grid-template-columns: 33mm 39mm 1fr;
      margin-top: 16mm;
      max-width: 129mm;
      min-height: 22mm;
    }
    .volume-issue-block div {
      border-right: 1px solid #ddd6c9;
      padding: 4mm 4mm 3.5mm;
    }
    .volume-issue-block div:last-child { border-right: 0; }
    .volume-issue-block strong {
      color: var(--canopy);
      display: block;
      font-size: 17px;
      line-height: 1.05;
    }
    .volume-issue-block span {
      color: var(--muted);
      display: block;
      font-size: 8px;
      letter-spacing: .12em;
      margin-bottom: 1.5mm;
      text-transform: uppercase;
    }
    .cover-landscape {
      bottom: 34mm;
      height: 142mm;
      left: 0;
      position: absolute;
      width: 210mm;
      z-index: 2;
    }
    .cover-article {
      bottom: 59mm;
      left: 18mm;
      max-width: 117mm;
      position: absolute;
    }
    .cover-article .category {
      color: #e2eecc;
      font: 700 9px/1, sans-serif;
      letter-spacing: .16em;
      margin-bottom: 3.2mm;
      text-transform: uppercase;
    }
    .cover-article h2 {
      font-size: 22px;
      font-weight: 400;
      line-height: 1.24;
      margin: 0;
    }
    .publisher-band {
      align-items: center;
      background: rgba(9, 35, 23, .82);
      bottom: 10mm;
      display: flex;
      font-family: Arial, sans-serif;
      justify-content: space-between;
      left: -17mm;
      min-height: 21mm;
      padding: 4mm 17mm;
      position: absolute;
      right: -17mm;
    }
    .publisher-band strong {
      color: #f7f5ee;
      font-size: 10px;
      font-weight: 600;
    }
    .cover-truth-note {
      color: rgba(247, 245, 238, .76);
      font-size: 7.5px;
      line-height: 1.45;
      max-width: 62mm;
      text-align: right;
    }
    .article-opener, .article-body {
      page: article;
      background: var(--paper);
      color: var(--forest);
    }
    .article-opener {
      break-after: page;
      min-height: 263mm;
    }
    .masthead {
      align-items: end;
      border-bottom: 2px solid var(--canopy);
      border-top: 7px solid var(--canopy);
      display: flex;
      justify-content: space-between;
      margin-bottom: 8mm;
      padding: 4mm 0 3mm;
    }
    .masthead-brand {
      font-family: Arial, sans-serif;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -.03em;
    }
    .masthead-meta {
      color: var(--muted);
      font: 8.5px/1.55 Arial, sans-serif;
      letter-spacing: .08em;
      text-align: right;
      text-transform: uppercase;
    }
    .article-category {
      border-left: 3px solid var(--moss);
      color: var(--canopy);
      font: 700 9px/1.45 Arial, sans-serif;
      letter-spacing: .12em;
      margin-bottom: 4mm;
      padding-left: 3mm;
      text-transform: uppercase;
    }
    .article-title {
      font-size: 29px;
      font-weight: 500;
      letter-spacing: -.018em;
      line-height: 1.16;
      margin: 0 0 4mm;
      max-width: 166mm;
    }
    .byline {
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font: 10.5px/1.65 Arial, sans-serif;
      margin-bottom: 6mm;
      padding-bottom: 5mm;
    }
    .byline strong { color: var(--forest); font-weight: 600; }
    .front-grid {
      display: grid;
      gap: 6mm;
      grid-template-columns: 45mm 1fr;
    }
    .article-info {
      align-self: start;
      background: var(--stone);
      border-top: 5px solid var(--canopy);
      font: 9px/1.42 Arial, sans-serif;
      padding: 4mm 3.5mm;
    }
    .article-info h2, .abstract h2, .opener-introduction h2 {
      color: var(--canopy);
      font: 700 11px/1.2 Arial, sans-serif;
      letter-spacing: .08em;
      margin: 0 0 3mm;
      text-transform: uppercase;
    }
    .info-row {
      border-bottom: 1px solid #ddd7ca;
      margin: 0 0 3.5mm;
      padding: 0 0 3.5mm;
    }
    .info-row:last-child { border: 0; margin-bottom: 0; padding-bottom: 0; }
    .info-row strong {
      color: var(--canopy);
      display: block;
      font-size: 7.5px;
      letter-spacing: .1em;
      margin-bottom: .8mm;
      text-transform: uppercase;
    }
    .abstract p {
      font-size: 10.1px;
      line-height: 1.48;
      margin: 0 0 2.5mm;
      text-align: justify;
    }
    .keywords {
      border-top: 1px solid var(--line);
      color: var(--canopy);
      font: 9.4px/1.55 Arial, sans-serif;
      margin-top: 3mm;
      padding-top: 2mm;
    }
    .keywords strong { color: var(--forest); margin-right: 2mm; }
    .truth-strip {
      border-top: 1px solid var(--line);
      color: var(--muted);
      font: 7.8px/1.45 Arial, sans-serif;
      margin-top: 5mm;
      padding-top: 2.4mm;
    }
    .opener-introduction {
      border-top: 1px solid var(--line);
      column-count: 2;
      column-gap: 7mm;
      margin-top: 7mm;
      padding-top: 4mm;
    }
    .opener-introduction h2 { column-span: all; margin-bottom: 3mm; }
    .opener-introduction p {
      font-size: 9.2px;
      line-height: 1.45;
      margin: 0 0 2.6mm;
      text-align: justify;
    }
    .article-body {
      min-height: 263mm;
      position: relative;
    }
    .running-header {
      align-items: center;
      border-bottom: 1px solid var(--canopy);
      color: var(--muted);
      display: flex;
      font: 8.5px/1 Arial, sans-serif;
      justify-content: space-between;
      letter-spacing: .09em;
      margin-bottom: 5mm;
      padding-bottom: 2.6mm;
      text-transform: uppercase;
    }
    .body-flow {
      column-count: 2;
      column-gap: 7.5mm;
      column-rule: 1px solid #e4dfd3;
    }
    .journal-section {
      break-inside: avoid-column;
      margin: 0 0 5mm;
    }
    .journal-section.long { break-inside: auto; }
    .journal-section h2 {
      border-top: 1px solid var(--line);
      color: var(--canopy);
      font: 700 11px/1.25 Arial, sans-serif;
      letter-spacing: .08em;
      margin: 0 0 2.55mm;
      padding-top: 2.2mm;
      text-transform: uppercase;
    }
    .journal-section p {
      font-size: 9.25px;
      line-height: 1.5;
      margin: 0 0 2.55mm;
      text-align: justify;
    }
    .full-span {
      column-span: all;
      margin: 4mm 0 6mm;
    }
    table {
      border-collapse: collapse;
      font: 8.4px/1.35 Arial, sans-serif;
      margin-bottom: 4mm;
      width: 100%;
    }
    caption {
      color: var(--forest);
      font: 700 9px/1.4 Arial, sans-serif;
      margin-bottom: 2mm;
      text-align: left;
    }
    table th, .results-table th {
      background: var(--canopy);
      color: #f7f5ee;
      font-weight: 700;
      letter-spacing: .04em;
      text-align: left;
    }
    .annex-table th {
      background: #e8e4d9;
      color: var(--forest);
      font-weight: 700;
      text-align: left;
    }
    td, th {
      border: 1px solid var(--line);
      padding: 2mm 1.8mm;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: #f5f2e9; }
    .figure-plate {
      break-inside: avoid;
      margin: 5mm 0 7mm;
    }
    .photo-window {
      align-items: center;
      background: linear-gradient(145deg, #eef2e7, #faf8f1);
      border: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      height: 60mm;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .photo-window svg {
      height: 100%;
      width: 100%;
    }
    .photo-window .tag-label {
      background: rgba(255, 253, 248, 0.9);
      border: 1px solid var(--canopy);
      color: var(--canopy);
      font: 700 8.5px/1 Arial, sans-serif;
      letter-spacing: 0.12em;
      padding: 1.5mm 3.5mm;
      position: absolute;
      right: 4mm;
      top: 4mm;
      text-transform: uppercase;
      z-index: 10;
    }
    figcaption {
      border-left: 2px solid var(--canopy);
      color: var(--forest);
      font: 8.9px/1.5 Arial, sans-serif;
      margin-top: 2.5mm;
      padding-left: 3mm;
    }
    .callout {
      background: #eff2e8;
      border-left: 3px solid var(--moss);
      font: 9px/1.48 Arial, sans-serif;
      margin-bottom: 4mm;
      padding: 3mm 3.5mm;
    }
    .callout strong {
      color: var(--canopy);
      display: block;
      letter-spacing: .06em;
      margin-bottom: 1mm;
      text-transform: uppercase;
    }
    ul {
      font: 9px/1.48 Arial, sans-serif;
      margin: 0 0 3.5mm;
      padding-left: 5mm;
    }
    li { margin-bottom: 1.7mm; }
    .reference-section {
      border-top: 1px solid var(--line);
      margin-top: 6mm;
      padding-top: 4mm;
    }
    .reference-section h2 {
      color: var(--canopy);
      font: 700 11px/1.25 Arial, sans-serif;
      letter-spacing: .08em;
      margin: 0 0 4mm;
      text-transform: uppercase;
    }
    .reference-item {
      font-size: 8.5px;
      line-height: 1.5;
      margin-bottom: 3mm;
      text-align: justify;
    }
    .integrity-endnote {
      border-top: 1px solid var(--line);
      color: var(--muted);
      font: 7.7px/1.5 Arial, sans-serif;
      margin-top: 6mm;
      padding-top: 2.7mm;
    }
    @media screen {
      .cover-page, .article-opener, .article-body {
        box-shadow: 0 2mm 9mm rgba(0, 0, 0, .11);
        margin: 8mm auto;
        width: 210mm;
      }
      .article-opener, .article-body {
        padding: 16mm 15mm 18mm;
      }
    }
    @media print {
      html, body { background: #fff; }
      .cover-page, .article-opener, .article-body { margin: 0; }
    }
  </style>
</head>
<body data-publication-edition="v7">
  <section class="cover-page">
    <header class="cover-top">
      <div class="brand-lockup">
        <svg class="brand-leaf" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M9 27C9 14 20 7 32 8C31 21 23 31 9 31Z" fill="none" stroke="#f7f5ee" stroke-width="2"/>
          <path d="M10 30C17 23 21 18 28 12" fill="none" stroke="#f7f5ee" stroke-width="2"/>
        </svg>
        <span>NaLI / Nature / Evidence</span>
      </div>
      <span class="edition-note">${escapeHtml(article.cover.editionLine)}</span>
    </header>
    <div class="cover-heading">
      <p class="cover-kicker">Field Notes Transformed With Care</p>
      <h1>NaLI Nature <span>&amp; Evidence Journal</span></h1>
    </div>
    <div class="volume-issue-block">
      <div><span>Volume</span><strong>1</strong></div>
      <div><span>Issue</span><strong>1</strong></div>
      <div><span>Edition</span><strong>${escapeHtml(String(article.cover.year))}</strong></div>
    </div>
    <svg class="cover-landscape" viewBox="0 0 800 550" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 355C100 327 164 364 255 326C347 287 416 322 500 279C607 224 679 252 800 210V550H0Z" fill="#103b29" opacity=".7"/>
      <path d="M0 404C121 335 201 393 294 350C391 306 467 364 573 300C661 247 728 277 800 258V550H0Z" fill="#0d3021"/>
      <path d="M108 408C147 331 202 296 253 301C239 351 194 397 108 408Z" fill="#5d934b"/>
      <path d="M121 404L231 312M150 383L163 344M179 359L194 326" fill="none" stroke="#b4ce70" stroke-width="3" opacity=".72"/>
      <path d="M519 318C557 237 616 203 679 213C664 270 606 313 519 318Z" fill="#77a951"/>
      <path d="M532 312L657 224M568 287L574 246M600 267L611 236" fill="none" stroke="#d6e6a5" stroke-width="3" opacity=".7"/>
      <g fill="none" stroke="#c2dc8b" stroke-width="2" opacity=".54">
         <path d="M316 182C366 148 417 151 458 184C418 194 364 201 316 182Z"/>
         <path d="M298 200C356 160 426 163 479 198"/>
         <path d="M272 220C346 171 442 174 503 213"/>
      </g>
      <g fill="none" stroke="#f0f2df" stroke-width="3" opacity=".5">
         <path d="M584 131C603 112 623 111 640 126C657 105 679 104 698 124"/>
         <path d="M74 216C89 200 105 201 119 212C132 196 150 196 164 211"/>
      </g>
    </svg>
    <div class="cover-article">
      <p class="category">${escapeHtml(article.metadata.articleCategory)}</p>
      <h2>${escapeHtml(article.metadata.title)}</h2>
    </div>
    <footer class="publisher-band">
      <strong>${escapeHtml(article.cover.brandNote)}</strong>
      <span class="cover-truth-note">${escapeHtml(article.cover.truthNote)}</span>
    </footer>
  </section>

  <section class="article-opener">
    <header class="masthead">
      <div class="masthead-brand">${escapeHtml(article.cover.journalTitle)}</div>
      <div class="masthead-meta">
        ${escapeHtml(article.cover.issueLine)}<br>
        ${escapeHtml(article.metadata.shortCategory)}
      </div>
    </header>
    <p class="article-category">${escapeHtml(article.metadata.articleCategory)}</p>
    <h1 class="article-title">${escapeHtml(article.metadata.title)}</h1>
    <div class="byline">
      <strong>${escapeHtml(article.metadata.author)}</strong><br>
      ${escapeHtml(article.metadata.affiliation)}
    </div>
    <div class="front-grid">
      <aside class="article-info">
        <h2>Article Information</h2>
        <div class="info-row"><strong>Category</strong>${escapeHtml(article.infoBlock.category)}</div>
        <div class="info-row"><strong>Material basis</strong>${escapeHtml(article.infoBlock.materialBasis)}</div>
        <div class="info-row"><strong>Status</strong>${escapeHtml(article.infoBlock.status)}</div>
        <div class="info-row"><strong>Editorial note</strong>${escapeHtml(article.metadata.editorialNote)}</div>
      </aside>
      <article class="abstract">
        <h2>Abstract</h2>
        ${renderParagraphs(article.abstract.text)}
        <p class="keywords"><strong>Keywords</strong>${escapeHtml(article.abstract.keywords.join("; "))}</p>
        <p class="truth-strip">${escapeHtml(article.cover.truthNote)}</p>
      </article>
    </div>
    <section class="opener-introduction">
      <h2>1. INTRODUCTION</h2>
      ${renderParagraphs(article.introduction)}
    </section>
  </section>

  <main class="article-body">
    <div class="body-flow">
      <section class="journal-section long">
        <h2>2. LITERATURE REVIEW</h2>
        ${renderParagraphs(article.literatureReview)}
      </section>
      <section class="journal-section long">
        <h2>3. MATERIALS AND METHODS</h2>
        <p><strong>Material and setting.</strong> ${escapeHtml(article.materialsAndMethods.objectObserved)}. ${escapeHtml(article.materialsAndMethods.location)}; ${escapeHtml(article.materialsAndMethods.time)}.</p>
        <p><strong>Approach.</strong> ${escapeHtml(article.materialsAndMethods.method)}</p>
        <p><strong>Editorial emphasis.</strong> ${escapeHtml(article.materialsAndMethods.profileEmphasis)}</p>
        ${renderParagraphs(article.materialsAndMethods.observationDesign)}
        ${renderParagraphs(article.materialsAndMethods.recordingProtocol)}
        <p><strong>Missing methodological detail.</strong> ${escapeHtml(article.materialsAndMethods.missingDetails)}</p>
        <p><strong>Reproducibility boundary.</strong> ${escapeHtml(article.materialsAndMethods.reproducibility)}</p>
      </section>

      <section class="journal-section long" ${breakResults}>
        <h2>4. RESULTS AND DISCUSSION</h2>
        <div class="full-span">
          <table class="results-table">
            <caption>Table 1. Reported leaf morphology characters from user-provided notes (local QA fixture).</caption>
            <thead>
              <tr><th>Object</th><th>Shape</th><th>Margin</th><th>Apparent colour</th><th>Source</th><th>Status</th></tr>
            </thead>
            <tbody>${resultRows}</tbody>
          </table>
        </div>

        <div class="full-span">
          <table class="stats-table">
            <caption>Table 2. Summary measurements statistics per group (mean dimensions, local QA fixture).</caption>
            <thead>
              <tr><th>Group</th><th>Mean Length</th><th>Mean Width</th><th>Mean Petiole Length</th></tr>
            </thead>
            <tbody>${statsRows}</tbody>
          </table>
        </div>

        ${renderParagraphs(article.results.narrative)}
        ${renderParagraphs(article.discussion)}
      </section>

      <div class="full-span" ${breakFigures}>
        <figure class="figure-plate">
          <div class="photo-window">
            <span class="tag-label">synthetic QA placeholder</span>
            <svg viewBox="0 0 720 220" style="background:#f4f6f0; border:1px dashed var(--canopy);">
              <!-- Leaf A Drawing (Ovate) -->
              <g transform="translate(180, 110)">
                <path d="M-80,0 C-40,-50 40,-50 80,0 C40,50 -40,50 -80,0 Z" fill="#4d7756" opacity="0.85" stroke="#10231b" stroke-width="1.5"/>
                <line x1="-80" y1="0" x2="80" y2="0" stroke="#10231b" stroke-width="1.5" stroke-dasharray="3,3"/>
                <!-- Venation -->
                <path d="M-40,0 L-20,-15 M-20,0 L0,-18 M0,0 L20,-15 M20,0 L40,-12 M-40,0 L-20,15 M-20,0 L0,18 M0,0 L20,15 M20,0 L40,12" stroke="#fff" stroke-width="1" opacity="0.6"/>
                <text x="0" y="-35" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#10231b" text-anchor="middle">Daun A (Ovate / Lonjong)</text>
                <text x="0" y="38" font-family="Arial, sans-serif" font-size="7.5" fill="#59645e" text-anchor="middle">Margin: Rata (Entire)</text>
              </g>
              <!-- Leaf B Drawing (Palmate) -->
              <g transform="translate(540, 110)">
                <!-- 5 lobed palmate leaf path approximation -->
                <path d="M0,0 L15,-40 L5,-15 L40,-25 L15,-5 L35,25 L10,8 L15,40 L-10,12 L-35,22 L-12,-4 L-38,-28 L-5,-16 Z" fill="#7ba05a" opacity="0.85" stroke="#10231b" stroke-width="1.5"/>
                <text x="0" y="-45" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#10231b" text-anchor="middle">Daun B (Palmate / Menjari)</text>
                <text x="0" y="48" font-family="Arial, sans-serif" font-size="7.5" fill="#59645e" text-anchor="middle">Margin: Bergerigi (Serrate)</text>
              </g>
              <text x="360" y="210" font-family="Arial, sans-serif" font-size="8" fill="#59645e" text-anchor="middle" font-style="italic">[ Figure 1 Plate - Local QA Fixture Placeholder ]</text>
            </svg>
          </div>
          <figcaption>Figure 1. Leaf A/B comparative visual plate showing ovate shape with entire margin for Daun A, and palmate shape with serrated margin for Daun B. Labeled as synthetic QA placeholder for local QA testing.</figcaption>
        </figure>
      </div>

      <div class="full-span">
        <figure class="figure-plate">
          <div class="photo-window">
            <span class="tag-label">synthetic QA placeholder</span>
            <svg viewBox="0 0 720 220" style="background:#fcfaf5; border:1px dashed var(--canopy);">
              <!-- Diagram showing petiole, length, width measurements -->
              <g transform="translate(360, 100)">
                <!-- Axis grid -->
                <rect x="-240" y="-70" width="480" height="140" fill="none" stroke="#cfc6b7" stroke-width="0.5"/>
                <!-- Leaf shape vector outline for measurement -->
                <path d="M-150,0 C-100,-40 20,-40 100,0 C20,40 -100,40 -150,0 Z" fill="#e8eee0" stroke="#728347" stroke-width="1.5"/>
                <!-- Petiole line -->
                <line x1="-210" y1="0" x2="-150" y2="0" stroke="#728347" stroke-width="2.5"/>
                <!-- Measurement helpers -->
                <!-- Length -->
                <line x1="-150" y1="-50" x2="100" y2="-50" stroke="#cf2121" stroke-width="1"/>
                <line x1="-150" y1="-45" x2="-150" y2="-55" stroke="#cf2121" stroke-width="1"/>
                <line x1="100" y1="-45" x2="100" y2="-55" stroke="#cf2121" stroke-width="1"/>
                <text x="-25" y="-55" font-family="Arial, sans-serif" font-size="8" fill="#cf2121" text-anchor="middle">Leaf Length (L)</text>
                
                <!-- Width -->
                <line x1="0" y1="-30" x2="0" y2="30" stroke="#1c47a3" stroke-width="1"/>
                <line x1="-5" y1="-30" x2="5" y2="-30" stroke="#1c47a3" stroke-width="1"/>
                <line x1="-5" y1="30" x2="5" y2="30" stroke="#1c47a3" stroke-width="1"/>
                <text x="10" y="3" font-family="Arial, sans-serif" font-size="8" fill="#1c47a3">Width (W)</text>

                <!-- Petiole length -->
                <line x1="-210" y1="20" x2="-150" y2="20" stroke="#a3631c" stroke-width="1"/>
                <line x1="-210" y1="15" x2="-210" y2="25" stroke="#a3631c" stroke-width="1"/>
                <line x1="-150" y1="15" x2="-150" y2="25" stroke="#a3631c" stroke-width="1"/>
                <text x="-180" y="32" font-family="Arial, sans-serif" font-size="8" fill="#a3631c" text-anchor="middle">Petiole (P)</text>
              </g>
              <text x="360" y="200" font-family="Arial, sans-serif" font-size="8" fill="#59645e" text-anchor="middle" font-style="italic">[ Figure 2 Plate - Local QA Fixture Placeholder ]</text>
            </svg>
          </div>
          <figcaption>Figure 2. Measurement protocol schematic defining the acquisition of leaf length (L), width (W), and petiole length (P) on specimens. Labeled as synthetic QA placeholder for local QA testing.</figcaption>
        </figure>
      </div>

      <section class="journal-section">
        <h2>EVIDENCE DOCUMENTATION</h2>
        <div class="callout">
          <strong>Documentation record [local QA fixture]</strong>
          ${escapeHtml(article.evidence.photoSlot)} ${escapeHtml(article.evidence.measurementSlot)}
        </div>
        <p>${escapeHtml(article.evidence.locationSlot)}</p>
        <p>${escapeHtml(article.evidence.timestampSlot)}</p>
        <p>${escapeHtml(article.evidence.referenceSlot)}</p>
      </section>

      <section class="journal-section">
        <h2>EDUCATION AND CONSERVATION RELEVANCE</h2>
        ${renderParagraphs(article.conservationRelevance)}
      </section>

      <section class="journal-section">
        <h2>LIMITATIONS</h2>
        <div class="callout">
          <strong>Cannot be concluded</strong>
          ${escapeHtml(article.cannotBeConcluded)}
        </div>
        ${renderList(article.limitations)}
      </section>

      <section class="journal-section long">
        <h2>FUTURE WORK</h2>
        ${renderParagraphs(article.futureWork)}
        ${renderList(article.futureDataRequired)}
      </section>

      <section class="journal-section">
        <h2>CONCLUSIONS</h2>
        ${renderParagraphs(article.conclusion)}
      </section>

      <section class="full-span journal-section annex-section" ${breakAnnex}>
        <h2>ANNEXURE</h2>
        <table class="annex-table">
          <caption>Annex Table A1. Evidence inventory and review status (local QA fixture).</caption>
          <thead><tr><th>ID</th><th>Type</th><th>Material summary</th><th>Status</th></tr></thead>
          <tbody>${evidenceRows}</tbody>
        </table>
        
        <table class="annex-table" style="margin-top: 4mm">
          <caption>Annex Table A2. Raw replicate measurements per group (local QA fixture).</caption>
          <thead><tr><th>ID</th><th>Group</th><th>Length</th><th>Width</th><th>Petiole</th><th>Shape</th><th>Margin</th></tr></thead>
          <tbody>${replicateRows}</tbody>
        </table>

        <div class="callout" style="margin-top: 4mm">
          <strong>Review checklist</strong>
          ${renderList(article.annexure.checklist)}
        </div>
      </section>

      <section class="full-span journal-section reference-section" ${breakReferences}>
        <h2>REFERENCES</h2>
        ${referencesListHtml}
      </section>

      <footer class="full-span integrity-endnote">
        ${escapeHtml(PUBLIC_REPORT_DISCLAIMER)}
      </footer>
    </div>
  </main>
</body>
</html>`;
}
