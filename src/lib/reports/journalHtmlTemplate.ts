import type { JournalArticle } from "./journalArticleTemplate";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraphs(value: string) {
  return value
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderList(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function buildJournalHtml(article: JournalArticle) {
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
      --moss: #728347;
      --fern: #dbe4d2;
      --paper: #fdfcf8;
      --stone: #eee9dd;
      --line: #cfc6b7;
      --muted: #59645e;
      --cyan: #397e87;
    }
    * { box-sizing: border-box; }
    @page cover { size: A4; margin: 0; }
    @page article { size: A4; margin: 16mm 15mm 18mm 15mm; }
    html, body {
      margin: 0;
      padding: 0;
      background: #d7d4cc;
      color: var(--forest);
      font-family: "Georgia", "Times New Roman", serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cover-page {
      page: cover;
      break-after: page;
      position: relative;
      height: 297mm;
      width: 210mm;
      overflow: hidden;
      padding: 23mm 20mm 17mm;
      background:
        radial-gradient(circle at 78% 24%, rgba(208, 230, 186, .28) 0 16%, transparent 16.5%),
        linear-gradient(144deg, #0f241b 0%, #18372a 46%, #315f45 100%);
      color: #f7f5ee;
    }
    .cover-page::before {
      content: "";
      position: absolute;
      inset: auto -22mm -40mm -30mm;
      height: 142mm;
      background:
        radial-gradient(ellipse at 20% 58%, #728b45 0 10%, transparent 10.5%),
        radial-gradient(ellipse at 39% 34%, #557647 0 15%, transparent 15.5%),
        radial-gradient(ellipse at 66% 54%, #88a54d 0 12%, transparent 12.5%),
        linear-gradient(8deg, #172d24 10%, transparent 10.5%);
      opacity: .88;
      transform: rotate(-3deg);
    }
    .cover-page::after {
      content: "";
      position: absolute;
      right: -30mm;
      top: 46mm;
      height: 155mm;
      width: 108mm;
      border: 1px solid rgba(230, 235, 214, .18);
      border-radius: 52% 0 0 54%;
      box-shadow: -13mm 8mm 0 -12.4mm rgba(230, 235, 214, .25),
        -28mm 17mm 0 -27.4mm rgba(230, 235, 214, .18);
      transform: rotate(-17deg);
    }
    .cover-mark {
      align-items: center;
      border-bottom: 1px solid rgba(247, 245, 238, .34);
      display: flex;
      font-family: Arial, sans-serif;
      justify-content: space-between;
      letter-spacing: .18em;
      padding-bottom: 8mm;
      position: relative;
      text-transform: uppercase;
      z-index: 1;
    }
    .cover-monogram {
      align-items: center;
      border: 1px solid rgba(247, 245, 238, .6);
      display: flex;
      font-size: 20px;
      font-weight: 700;
      height: 15mm;
      justify-content: center;
      width: 15mm;
    }
    .cover-series {
      color: #dbe4d2;
      font-size: 9px;
      font-weight: 600;
    }
    .cover-content {
      max-width: 158mm;
      position: relative;
      z-index: 1;
    }
    .cover-kicker {
      color: #d9e5c8;
      font-family: Arial, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .2em;
      margin: 30mm 0 7mm;
      text-transform: uppercase;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 500;
      line-height: 1.12;
      margin: 0 0 8mm;
      max-width: 148mm;
    }
    .cover-issue {
      border-left: 2px solid #a9c761;
      color: #e7ebdc;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.7;
      margin-top: 13mm;
      padding-left: 5mm;
    }
    .cover-article {
      bottom: 49mm;
      left: 20mm;
      max-width: 126mm;
      position: absolute;
      z-index: 1;
    }
    .cover-article-label {
      color: #d2e1be;
      font: 700 9px/1 Arial, sans-serif;
      letter-spacing: .2em;
      margin-bottom: 4mm;
      text-transform: uppercase;
    }
    .cover-article h2 {
      color: #f8f7f2;
      font-size: 24px;
      font-weight: 500;
      line-height: 1.24;
      margin: 0;
    }
    .cover-footer {
      bottom: 15mm;
      color: rgba(247, 245, 238, .82);
      display: flex;
      font: 10px/1.5 Arial, sans-serif;
      justify-content: space-between;
      left: 20mm;
      position: absolute;
      right: 20mm;
      z-index: 2;
    }
    .cover-truth { max-width: 64mm; text-align: right; }
    .article-first-page, .article-body {
      page: article;
      background: var(--paper);
      color: var(--forest);
    }
    .article-first-page {
      break-after: page;
      min-height: 263mm;
    }
    .masthead {
      align-items: end;
      background: #f2f0e8;
      border-bottom: 3px solid var(--canopy);
      display: flex;
      justify-content: space-between;
      margin-bottom: 12mm;
      padding: 6mm 7mm 5mm;
    }
    .masthead-brand {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.16;
    }
    .masthead-meta {
      color: var(--muted);
      font: 9.5px/1.6 Arial, sans-serif;
      text-align: right;
    }
    .article-title {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.18;
      margin: 0 auto 4mm;
      max-width: 165mm;
      text-align: center;
    }
    .byline {
      color: var(--muted);
      font: 12px/1.65 Arial, sans-serif;
      margin-bottom: 11mm;
      text-align: center;
    }
    .front-grid {
      display: grid;
      gap: 6mm;
      grid-template-columns: 46mm 1fr;
    }
    .article-info {
      align-self: start;
      background: #f1f0e9;
      border-top: 7px solid var(--canopy);
      font: 10px/1.45 Arial, sans-serif;
      padding: 4mm;
    }
    .article-info h2, .abstract h2 {
      color: var(--canopy);
      font: 700 13px/1.2 Arial, sans-serif;
      letter-spacing: .05em;
      margin: 0 0 4mm;
      text-transform: uppercase;
    }
    .info-row { border-bottom: 1px solid #ddd7ca; padding: 0 0 3mm; margin: 0 0 3mm; }
    .info-row strong { display: block; text-transform: uppercase; font-size: 8px; letter-spacing: .08em; }
    .abstract p {
      font-size: 11.2px;
      line-height: 1.55;
      margin: 0 0 3.2mm;
      text-align: justify;
    }
    .keywords {
      border-top: 1px solid var(--line);
      color: var(--canopy);
      font: 10.5px/1.6 Arial, sans-serif;
      margin-top: 4mm;
      padding-top: 3mm;
    }
    .keywords strong { color: var(--forest); margin-right: 2mm; }
    .article-body {
      min-height: 263mm;
      position: relative;
    }
    .running-header {
      align-items: center;
      border-bottom: 1px solid var(--canopy);
      color: var(--muted);
      display: flex;
      font: 9px/1 Arial, sans-serif;
      justify-content: space-between;
      letter-spacing: .08em;
      margin-bottom: 7mm;
      padding-bottom: 3mm;
      text-transform: uppercase;
    }
    .body-flow {
      column-count: 2;
      column-gap: 8mm;
      column-rule: 1px solid #e0dbd0;
    }
    .journal-section {
      break-inside: avoid-column;
      margin: 0 0 6mm;
    }
    .journal-section.long { break-inside: auto; }
    .journal-section h2 {
      border-top: 1px solid var(--line);
      color: var(--canopy);
      font: 700 12px/1.25 Arial, sans-serif;
      letter-spacing: .06em;
      margin: 0 0 3mm;
      padding-top: 2.5mm;
      text-transform: uppercase;
    }
    .journal-section p {
      font-size: 9.6px;
      line-height: 1.52;
      margin: 0 0 3mm;
      orphans: 3;
      text-align: justify;
      widows: 3;
    }
    .full-span {
      column-span: all;
      margin: 5mm 0 7mm;
    }
    table {
      border-collapse: collapse;
      font: 9px/1.35 Arial, sans-serif;
      width: 100%;
    }
    caption {
      color: var(--forest);
      font: 700 10px/1.4 Arial, sans-serif;
      margin-bottom: 2.5mm;
      text-align: left;
    }
    th {
      background: var(--canopy);
      color: #f7f5ee;
      font-weight: 700;
      letter-spacing: .04em;
      text-align: left;
    }
    td, th {
      border: 1px solid var(--line);
      padding: 2.4mm 2mm;
      vertical-align: top;
    }
    tbody tr:nth-child(even) td { background: #f5f2e9; }
    .figure-slot {
      background: linear-gradient(135deg, #f0f3e8, #faf8f2);
      border: 1px solid var(--line);
      min-height: 47mm;
      padding: 12mm 9mm 7mm;
      position: relative;
      text-align: center;
    }
    .figure-leaf {
      border: 2px solid rgba(49, 95, 69, .2);
      border-radius: 80% 10% 80% 10%;
      height: 20mm;
      margin: 0 auto 6mm;
      position: relative;
      transform: rotate(-34deg);
      width: 39mm;
    }
    .figure-leaf::after {
      background: rgba(49, 95, 69, .28);
      content: "";
      height: 1px;
      left: 3mm;
      position: absolute;
      top: 10mm;
      transform: rotate(-35deg);
      width: 37mm;
    }
    .figure-note { color: var(--muted); font: 10px/1.5 Arial, sans-serif; }
    .caption {
      color: var(--forest);
      font: 9.5px/1.55 Arial, sans-serif;
      margin-top: 2.4mm;
      text-align: left;
    }
    .callout {
      background: #eff2e8;
      border-left: 3px solid var(--moss);
      font: 9.5px/1.52 Arial, sans-serif;
      margin-bottom: 6mm;
      padding: 3.5mm 4mm;
    }
    .callout strong { display: block; letter-spacing: .04em; margin-bottom: 1.5mm; text-transform: uppercase; }
    ul {
      font: 9.5px/1.48 Arial, sans-serif;
      margin: 0 0 4mm;
      padding-left: 5mm;
    }
    li { margin-bottom: 2mm; }
    .annex-table td:first-child { width: 10%; }
    .annex-table td:nth-child(2) { width: 16%; }
    .annex-table td:last-child { width: 19%; }
    .source-statement {
      background: #f5f3ed;
      border: 1px solid var(--line);
      font: 10px/1.5 Arial, sans-serif;
      padding: 4mm;
    }
    .truth-footer {
      border-top: 1px solid var(--line);
      color: var(--muted);
      font: 8.5px/1.55 Arial, sans-serif;
      margin-top: 7mm;
      padding-top: 3mm;
    }
    @media screen {
      .cover-page, .article-first-page, .article-body {
        box-shadow: 0 2mm 9mm rgba(0, 0, 0, .11);
        margin: 8mm auto;
        padding-left: 15mm;
        padding-right: 15mm;
        width: 210mm;
      }
      .cover-page { padding-left: 20mm; padding-right: 20mm; }
      .article-first-page, .article-body { padding-top: 16mm; padding-bottom: 18mm; }
    }
    @media print {
      html, body { background: #fff; }
      .cover-page, .article-first-page, .article-body { margin: 0; }
    }
  </style>
</head>
<body>
  <section class="cover-page">
    <div class="cover-mark">
      <div class="cover-monogram">N</div>
      <div class="cover-series">${escapeHtml(article.cover.seriesTitle)}</div>
    </div>
    <div class="cover-content">
      <p class="cover-kicker">Nature / Evidence / Learning</p>
      <h1 class="cover-title">${escapeHtml(article.cover.journalTitle)}</h1>
      <div class="cover-issue">
        ${escapeHtml(article.cover.issueLine)}<br>
        ${escapeHtml(String(article.cover.year))} &nbsp; / &nbsp; ${escapeHtml(article.metadata.modelLabel)}
      </div>
    </div>
    <div class="cover-article">
      <div class="cover-article-label">Article Draft</div>
      <h2>${escapeHtml(article.metadata.title)}</h2>
    </div>
    <footer class="cover-footer">
      <div>${escapeHtml(article.cover.brandNote)}</div>
      <div class="cover-truth">${escapeHtml(article.cover.truthNote)}</div>
    </footer>
  </section>

  <section class="article-first-page">
    <header class="masthead">
      <div class="masthead-brand">${escapeHtml(article.cover.journalTitle)}</div>
      <div class="masthead-meta">
        Founder/Admin Draft Series &nbsp;|&nbsp; ${escapeHtml(String(article.cover.year))}<br>
        DOI: ${escapeHtml(article.metadata.doi)} &nbsp;|&nbsp; ISSN: ${escapeHtml(article.metadata.issn)}
      </div>
    </header>
    <h1 class="article-title">${escapeHtml(article.metadata.title)}</h1>
    <div class="byline">
      ${escapeHtml(article.metadata.author)}<br>
      ${escapeHtml(article.metadata.affiliation)}
    </div>
    <div class="front-grid">
      <aside class="article-info">
        <h2>Article Information</h2>
        <p class="info-row"><strong>Received</strong>${escapeHtml(article.infoBlock.received)}</p>
        <p class="info-row"><strong>Accepted</strong>${escapeHtml(article.infoBlock.accepted)}</p>
        <p class="info-row"><strong>Published</strong>${escapeHtml(article.infoBlock.published)}</p>
        <p class="info-row"><strong>DOI</strong>${escapeHtml(article.metadata.doi)}</p>
        <p class="info-row"><strong>ISSN</strong>${escapeHtml(article.metadata.issn)}</p>
        <p class="info-row"><strong>Verification</strong>${escapeHtml(article.infoBlock.verificationStatus)}</p>
      </aside>
      <article class="abstract">
        <h2>Abstract</h2>
        ${renderParagraphs(article.abstract.text)}
        <p class="keywords"><strong>Keywords</strong>${escapeHtml(article.abstract.keywords.join("; "))}</p>
      </article>
    </div>
  </section>

  <main class="article-body">
    <div class="running-header">
      <span>${escapeHtml(article.cover.journalTitle)}</span>
      <span>Evidence-based draft / ${escapeHtml(article.metadata.modelLabel)}</span>
    </div>
    <div class="body-flow">
      <section class="journal-section long">
        <h2>INTRODUCTION</h2>
        ${renderParagraphs(article.introduction)}
      </section>
      <section class="journal-section long">
        <h2>LITERATURE REVIEW</h2>
        ${renderParagraphs(article.literatureReview)}
      </section>
      <section class="journal-section long">
        <h2>MATERIALS AND METHODS</h2>
        <p><strong>Material and setting.</strong> ${escapeHtml(article.materialsAndMethods.objectObserved)}. ${escapeHtml(article.materialsAndMethods.location)}; ${escapeHtml(article.materialsAndMethods.time)}.</p>
        <p><strong>Approach.</strong> ${escapeHtml(article.materialsAndMethods.method)}</p>
        ${renderParagraphs(article.materialsAndMethods.observationDesign)}
        ${renderParagraphs(article.materialsAndMethods.recordingProtocol)}
        <p><strong>Missing methodological detail.</strong> ${escapeHtml(article.materialsAndMethods.missingDetails)}</p>
        <p><strong>Reproducibility boundary.</strong> ${escapeHtml(article.materialsAndMethods.reproducibility)}</p>
      </section>

      <section class="full-span">
        <table class="results-table">
          <caption>Table 1. Reported leaf morphology characters from user-provided notes.</caption>
          <thead>
            <tr><th>Object</th><th>Shape</th><th>Margin</th><th>Apparent colour</th><th>Source</th><th>Status</th></tr>
          </thead>
          <tbody>${resultRows}</tbody>
        </table>
      </section>

      <section class="journal-section long">
        <h2>RESULTS AND DISCUSSION</h2>
        ${renderParagraphs(article.results.narrative)}
        ${renderParagraphs(article.discussion)}
      </section>

      <figure class="full-span">
        <div class="figure-slot">
          <div class="figure-leaf"></div>
          <div class="figure-note">Evidence placeholder / no image embedded</div>
        </div>
        <figcaption class="caption">${escapeHtml(article.evidence.figureCaption)} The slot is intentionally empty because no photograph was supplied.</figcaption>
      </figure>

      <section class="journal-section">
        <h2>EVIDENCE DOCUMENTATION</h2>
        <div class="callout">
          <strong>Available record</strong>
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

      <section class="full-span journal-section">
        <h2>ANNEXURE</h2>
        <table class="annex-table">
          <caption>Annex Table A1. Evidence inventory and review status.</caption>
          <thead><tr><th>ID</th><th>Type</th><th>Material summary</th><th>Status</th></tr></thead>
          <tbody>${evidenceRows}</tbody>
        </table>
        <div class="callout" style="margin-top: 4mm">
          <strong>Review checklist</strong>
          ${renderList(article.annexure.checklist)}
        </div>
      </section>

      <section class="full-span journal-section">
        <h2>REFERENCES</h2>
        <div class="source-statement">${escapeHtml(article.references[0])}</div>
      </section>

      <footer class="full-span truth-footer">
        ${escapeHtml(PUBLIC_REPORT_DISCLAIMER)}
      </footer>
    </div>
  </main>
</body>
</html>`;
}
