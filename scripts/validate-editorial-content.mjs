#!/usr/bin/env node
/**
 * Editorial-content validator (NaLI editorial-trust sprint, Phase 13).
 *
 * Fails the build if public content violates the trust rules:
 *  1. No public article/field-note contains demo terms (seed / contoh (seed) /
 *     dummy / placeholder / ilustratif).
 *  2. No first-person fieldwork claims unless `firstPartyFieldwork: true`.
 *  3. Every published article has sources, claimLedger, limitations,
 *     confidence, evidenceBasis, firstPartyFieldwork.
 *  4. Every source has type, summary(body), a reliability note, checkedAt,
 *     and at least one traceable link (url/doi/archiveUrl) — or a limitation
 *     explaining the access constraint.
 *  5. Every article image credit has sourceUrl, license, attribution, alt, caption.
 *
 * Usage: node scripts/validate-editorial-content.mjs   (npm run check:editorial)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const FIELD_NOTES = path.join(ROOT, "content", "field-notes");
const SOURCES = path.join(ROOT, "content", "sources");

const DEMO_TERMS = /\bseed\b|contoh \(seed\)|\bdummy\b|\bplaceholder\b|bersifat ilustratif|\bilustratif\b/i;
const FIRST_PERSON_FIELD =
  /observasi kami|kami melihat|kami menemukan|kami mengamati|kami amati di lapangan|dari lokasi sebenarnya|kami kunjungi langsung|kami memotret di lapangan|kami mengukur di lapangan/i;

const errors = [];
const warnings = [];

function read(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return { file: path.relative(ROOT, path.join(dir, f)), data, content };
    });
}

/* ---- Articles ---- */
for (const { file, data, content } of read(ARTICLES)) {
  const published = (data.status ?? "draft") === "published";
  const tag = `[article] ${file}`;

  // demo terms (published only — drafts may be works-in-progress)
  if (published && DEMO_TERMS.test(content)) {
    errors.push(`${tag}: contains demo/placeholder language (seed/contoh (seed)/dummy/placeholder/ilustratif).`);
  }
  if (published && DEMO_TERMS.test(JSON.stringify(data))) {
    errors.push(`${tag}: frontmatter contains demo/placeholder language.`);
  }

  // first-person fieldwork
  if (data.firstPartyFieldwork !== true && FIRST_PERSON_FIELD.test(content)) {
    errors.push(`${tag}: first-person field claim but firstPartyFieldwork is not true.`);
  }

  if (!published) continue;

  if (!Array.isArray(data.sources) || data.sources.length === 0)
    errors.push(`${tag}: missing sources.`);
  if (!Array.isArray(data.claimLedger) || data.claimLedger.length === 0)
    errors.push(`${tag}: missing claimLedger.`);
  if (!Array.isArray(data.limitations) || data.limitations.length === 0)
    errors.push(`${tag}: missing limitations.`);
  if (!data.confidence) errors.push(`${tag}: missing confidence.`);
  if (!data.evidenceBasis) errors.push(`${tag}: missing evidenceBasis.`);
  if (data.firstPartyFieldwork === undefined)
    errors.push(`${tag}: missing firstPartyFieldwork (must be explicit, usually false).`);

  // images (if present) must be fully credited
  if (Array.isArray(data.images)) {
    data.images.forEach((img, i) => {
      for (const k of ["sourceUrl", "license", "attribution", "alt", "caption"]) {
        if (!img?.[k]) errors.push(`${tag}: image[${i}] missing ${k}.`);
      }
    });
  }

  // claim ledger entries well-formed
  if (Array.isArray(data.claimLedger)) {
    data.claimLedger.forEach((c, i) => {
      if (!c?.claim) errors.push(`${tag}: claimLedger[${i}] missing claim.`);
      if (!c?.status) errors.push(`${tag}: claimLedger[${i}] missing status.`);
    });
  }
}

/* ---- Field notes ---- */
for (const { file, data, content } of read(FIELD_NOTES)) {
  const published = (data.status ?? "draft") === "published";
  if (!published) continue;
  const tag = `[field-note] ${file}`;
  if (DEMO_TERMS.test(content) || DEMO_TERMS.test(JSON.stringify(data)))
    errors.push(`${tag}: contains demo/placeholder language.`);
  if (data.firstPartyFieldwork !== true && FIRST_PERSON_FIELD.test(content))
    errors.push(`${tag}: first-person field claim (field notes must be framed as third-party/open-source).`);
}

/* ---- Sources ---- */
let sourceCount = 0;
for (const { file, data, content } of read(SOURCES)) {
  sourceCount++;
  const tag = `[source] ${file}`;
  if (!data.title) errors.push(`${tag}: missing title.`);
  if (!data.type) errors.push(`${tag}: missing sourceType (type).`);
  if (!content.trim()) errors.push(`${tag}: missing summary (body).`);

  const hasReliabilityNote = Boolean(data.reliability || data.reliabilityNote);
  if (!hasReliabilityNote) errors.push(`${tag}: missing reliability note.`);
  if (!data.reliabilityLevel) warnings.push(`${tag}: no structured reliabilityLevel.`);
  if (!data.checkedAt) errors.push(`${tag}: missing checkedAt.`);
  if (!Array.isArray(data.topics) || data.topics.length === 0)
    errors.push(`${tag}: missing topics.`);

  const hasLink = Boolean(data.url || data.doi || data.archiveUrl);
  const hasLimitation = Array.isArray(data.limitations) && data.limitations.length > 0;
  if (!hasLink && !hasLimitation)
    errors.push(`${tag}: no url/doi/archiveUrl and no limitations explaining the access constraint.`);
  if (!hasLimitation) errors.push(`${tag}: missing limitations.`);
}

/* ---- Report ---- */
console.log(`\nEditorial validation — ${sourceCount} sources checked.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("");
  process.exit(1);
}
console.log("✓ All editorial-content checks passed.\n");
