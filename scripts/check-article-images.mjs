#!/usr/bin/env node
/**
 * Rendered article image checker.
 *
 * Run after `npm run build` and `npm run start`.
 * It crawls every published article route and fails when the rendered page does
 * not contain a visible article visual figure with an <img> plus credit block.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const BASE_URL = process.env.NALI_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000";
const REQUIRED_VISUAL_KEYS = ["src", "sourceUrl", "license", "attribution", "alt", "caption", "checkedAt"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function readArticles() {
  return fs
    .readdirSync(ARTICLES)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(ARTICLES, file);
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));
      return {
        file,
        slug: data.slug ?? file.replace(/\.mdx?$/, ""),
        data,
      };
    })
    .filter((article) => (article.data.status ?? "draft") === "published")
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function localAssetExists(src) {
  if (!String(src).startsWith("/")) return true;
  return fs.existsSync(path.join(ROOT, "public", String(src).replace(/^\/+/, "")));
}

function metadataErrors(article) {
  const errors = [];
  const displayedImages = Array.isArray(article.data.images)
    ? article.data.images.filter((image) => Boolean(image?.src))
    : [];
  const displayedDiagrams = Array.isArray(article.data.diagrams)
    ? article.data.diagrams.filter((diagram) => Boolean(diagram?.src))
    : [];

  if (displayedImages.length === 0 && displayedDiagrams.length === 0) {
    errors.push("no displayed image or rendered diagram metadata");
  }

  for (const [kind, items] of [
    ["image", displayedImages],
    ["diagram", displayedDiagrams],
  ]) {
    items.forEach((item, index) => {
      REQUIRED_VISUAL_KEYS.forEach((key) => {
        if (!item?.[key]) errors.push(`${kind}[${index}] missing ${key}`);
      });
      if (!item?.creator && !item?.institution) {
        errors.push(`${kind}[${index}] missing creator or institution`);
      }
      if (item?.checkedAt && !ISO_DATE.test(String(item.checkedAt))) {
        errors.push(`${kind}[${index}] checkedAt is not YYYY-MM-DD`);
      }
      if (item?.src && !localAssetExists(item.src)) {
        errors.push(`${kind}[${index}] local src is missing: ${item.src}`);
      }
    });
  }

  return errors;
}

function extractVisualFigures(html) {
  return [...html.matchAll(/<figure\b(?=[^>]*data-article-visual="displayed-(?:image|diagram)")[\s\S]*?<\/figure>/gi)].map(
    (match) => match[0],
  );
}

function figureHasImageAndCredit(figure) {
  const hasImage = /<img\b[^>]+\bsrc="[^"]+"/i.test(figure);
  const hasCredit = /<figcaption\b[^>]*data-visual-credit="true"/i.test(figure);
  return hasImage && hasCredit;
}

async function fetchHtml(slug) {
  const url = new URL(`/articles/${slug}`, BASE_URL);
  const response = await fetch(url);
  const html = await response.text();
  return { url: String(url), status: response.status, html };
}

async function main() {
  const articles = readArticles();
  const failures = [];
  let renderedWithImages = 0;

  for (const article of articles) {
    const metaProblems = metadataErrors(article);
    if (metaProblems.length) {
      failures.push(`${article.slug}: ${metaProblems.join("; ")}`);
      continue;
    }

    let result;
    try {
      result = await fetchHtml(article.slug);
    } catch (error) {
      failures.push(`${article.slug}: could not fetch route from ${BASE_URL}: ${error.message}`);
      continue;
    }

    if (result.status !== 200) {
      failures.push(`${article.slug}: route returned HTTP ${result.status} at ${result.url}`);
      continue;
    }

    const visualFigures = extractVisualFigures(result.html);
    if (visualFigures.length === 0) {
      failures.push(`${article.slug}: rendered page has no displayed article visual figure`);
      continue;
    }

    if (!visualFigures.some(figureHasImageAndCredit)) {
      failures.push(`${article.slug}: rendered visual figure lacks an <img> with caption/credit`);
      continue;
    }

    renderedWithImages++;
  }

  console.log(`Article image route check: ${articles.length} published article(s) checked.`);
  console.log(`Article image route check: ${renderedWithImages} article(s) render visible image figures.`);

  if (failures.length) {
    console.log(`\n${failures.length} failure(s):`);
    failures.forEach((failure) => console.log(`  FAIL ${failure}`));
    process.exit(1);
  }

  console.log("All published article routes render at least one visible image figure with credit metadata.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
