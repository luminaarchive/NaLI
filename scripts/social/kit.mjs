#!/usr/bin/env node
/**
 * NaLI distribution kit. Turns ONE real published article into ready-to-post
 * drafts for X (thread) and Instagram (carousel), built entirely from the
 * article's own frontmatter (title, summary, claim ledger, confidence label,
 * limitations, sources). Nothing is invented; it only reformats what is already
 * written and verified, so the founder can post one piece per article.
 *
 * Usage:
 *   node scripts/social/kit.mjs --slug pesut-mahakam-populasi-terakhir
 *   node scripts/social/kit.mjs --slug <slug> --out content/_social/<slug>.md
 *   node scripts/social/kit.mjs            # lists available article slugs
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const OUT_DIR = path.join(ROOT, "content", "_social");
const BASE = "https://nalijournal.vercel.app";

const CONFIDENCE_LABEL = {
  high: "Terverifikasi kuat",
  medium: "Didukung sumber",
  low: "Terbatas",
  "needs-verification": "Belum cukup bukti",
};

const arg = (flag) => {
  const hit = process.argv.find((a) => a === flag);
  if (!hit) return undefined;
  return process.argv[process.argv.indexOf(hit) + 1];
};

function listSlugs() {
  return fs
    .readdirSync(ARTICLES)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

function load(slug) {
  for (const ext of [".mdx", ".md"]) {
    const p = path.join(ARTICLES, slug + ext);
    if (fs.existsSync(p)) return matter(fs.readFileSync(p, "utf8")).data;
  }
  return null;
}

const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const hashtags = (tags) =>
  (tags ?? [])
    .slice(0, 5)
    .map((t) => "#" + String(t).replace(/[^a-z0-9]+/gi, ""))
    .join(" ");

function buildThread(fm, url) {
  const label = CONFIDENCE_LABEL[fm.confidence] ?? fm.confidence ?? "";
  const claims = (fm.claimLedger ?? []).slice(0, 4);
  const lim = (fm.limitations ?? [])[0];
  const out = [];
  out.push(`1/ ${tidy(fm.title)}\n\n${tidy(fm.summary)}`);
  let n = 2;
  for (const c of claims) {
    out.push(`${n}/ ${tidy(c.claim)}\n(${tidy(c.status)})`);
    n++;
  }
  if (lim) {
    out.push(`${n}/ Yang masih belum pasti: ${tidy(lim)}`);
    n++;
  }
  out.push(
    `${n}/ Label keyakinan tulisan ini: ${label}. Tiap klaim membawa sumbernya. Baca lengkap di NaLI:\n${url}\n\n${hashtags(fm.tags)}`,
  );
  return out.join("\n\n---\n\n");
}

function buildCarousel(fm, url) {
  const label = CONFIDENCE_LABEL[fm.confidence] ?? fm.confidence ?? "";
  const claims = (fm.claimLedger ?? []).slice(0, 4);
  const lim = (fm.limitations ?? [])[0];
  const slides = [];
  slides.push(`SLIDE 1 (sampul)\n${tidy(fm.title)}\nNaLI by NatIve, ${tidy(fm.category)}`);
  slides.push(`SLIDE 2\n${tidy(fm.summary)}`);
  let i = 3;
  for (const c of claims) {
    slides.push(`SLIDE ${i}\n${tidy(c.claim)}\nStatus: ${tidy(c.status)}`);
    i++;
  }
  if (lim) {
    slides.push(`SLIDE ${i}\nYang masih kami cari buktinya:\n${tidy(lim)}`);
    i++;
  }
  slides.push(
    `SLIDE ${i} (penutup)\nLabel keyakinan: ${label}.\nBaca lengkap dengan semua sumbernya di NaLI.\n${url}`,
  );
  return slides.join("\n\n");
}

function caption(fm, url) {
  return `${tidy(fm.title)}\n\n${tidy(fm.summary)}\n\nBaca lengkap dengan sumber dan label keyakinannya di NaLI: ${url}\n\n${hashtags(fm.tags)}`;
}

function main() {
  const slug = arg("--slug");
  if (!slug) {
    console.log("Pakai --slug <slug>. Artikel tersedia:\n");
    for (const s of listSlugs()) console.log("  " + s);
    return;
  }
  const fm = load(slug);
  if (!fm) {
    console.error(`Artikel tidak ditemukan: ${slug}`);
    process.exit(1);
  }
  if ((fm.status ?? "draft") !== "published") {
    console.error(`Artikel "${slug}" belum terbit (status: ${fm.status}). Hanya artikel terbit yang dibagikan.`);
    process.exit(1);
  }

  const url = `${BASE}/articles/${slug}`;
  const doc =
    `# Distribution kit: ${tidy(fm.title)}\n\n` +
    `Sumber: ${url}\n\n` +
    `## X (thread)\n\n${buildThread(fm, url)}\n\n` +
    `## Instagram (carousel)\n\n${buildCarousel(fm, url)}\n\n` +
    `## Caption (IG / umum)\n\n${caption(fm, url)}\n`;

  const outArg = arg("--out");
  if (outArg) {
    fs.mkdirSync(path.dirname(outArg), { recursive: true });
    fs.writeFileSync(outArg, doc);
    console.log(`Ditulis ke ${path.relative(ROOT, outArg)}`);
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const p = path.join(OUT_DIR, `${slug}.md`);
    fs.writeFileSync(p, doc);
    console.log(doc);
    console.log(`\n(Tersimpan juga di ${path.relative(ROOT, p)})`);
  }
}

main();
