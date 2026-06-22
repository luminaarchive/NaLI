#!/usr/bin/env node
/**
 * check:legal, Axiom 16 compliance gate. Network-free.
 *
 * NaLI may CITE and LINK anything, but may never REPRODUCE copyrighted text.
 * This catches the two failure modes:
 *   1. Any catalogued source flagged is_oa/isOA === false with type "jurnal"
 *      that also carries a reproduced full-text field. Citing non-OA is fine;
 *      storing its text is not. (warn)
 *   2. Article bodies containing a long blockquote (> 300 chars) with no nearby
 *      source pointer, a possible reproduction of someone else's text. (warn)
 *
 * Exit 1 only on hard violations (reproduced full text on a non-OA source).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, "content", "articles");
const SOURCES = path.join(ROOT, "content", "sources");

const flags = []; // {level, file, message}
const flag = (level, file, message) => flags.push({ level, file, message });

function walkMdx(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => path.join(dir, f));
}

// (1) catalogued non-OA jurnal sources that also reproduce full text
for (const full of walkMdx(SOURCES)) {
  const rel = path.relative(ROOT, full);
  let parsed;
  try {
    parsed = matter(fs.readFileSync(full, "utf8"));
  } catch {
    continue;
  }
  const d = parsed.data;
  const isOa = d.is_oa ?? d.isOA;
  const type = d.type ?? d.sourceType;
  const reproducesFullText = Boolean(d.fullText || d.full_text || d.bodyText);
  if (isOa === false && type === "jurnal") {
    if (reproducesFullText) {
      flag("error", rel, "non-OA jurnal source carries reproduced full text. Cite/link only, never store the text.");
    } else {
      flag("warn", rel, "non-OA jurnal source. Fine to cite and link, never reproduce its text.");
    }
  }
}

// (2) long blockquotes in article bodies without a nearby source pointer
const POINTER = /\[\d+\]|https?:\/\/|\bsumber\b|\bGVP\b|\bIUCN\b/i;
for (const full of walkMdx(ARTICLES)) {
  const rel = path.relative(ROOT, full);
  let body;
  try {
    body = matter(fs.readFileSync(full, "utf8")).content;
  } catch {
    continue;
  }
  const lines = body.split("\n");
  let block = [];
  let startLine = 0;
  const flushBlock = (endLine) => {
    if (!block.length) return;
    const text = block.join(" ").replace(/^>\s?/gm, "").replace(/\s+/g, " ").trim();
    if (text.length > 300) {
      // look 3 lines around the block for a source pointer
      const ctx = lines.slice(Math.max(0, startLine - 3), Math.min(lines.length, endLine + 3)).join(" ");
      if (!POINTER.test(ctx)) {
        flag("warn", rel, `long blockquote (~${text.length} chars) near line ${startLine + 1} with no nearby source pointer. Confirm it is not reproduced copyrighted text.`);
      }
    }
    block = [];
  };
  lines.forEach((ln, i) => {
    if (/^\s*>/.test(ln)) {
      if (!block.length) startLine = i;
      block.push(ln);
    } else {
      flushBlock(i);
    }
  });
  flushBlock(lines.length);
}

const errors = flags.filter((f) => f.level === "error");
const warns = flags.filter((f) => f.level === "warn");

if (flags.length === 0) {
  console.log("LEGAL CHECK PASS, no reproduction flags.");
  process.exit(0);
}

for (const f of flags) {
  console.log(`  ${f.level === "error" ? "VIOLATION" : "FLAG     "} ${f.file}: ${f.message}`);
}
console.log(`\n${errors.length} violation(s), ${warns.length} flag(s).`);
if (errors.length > 0) {
  console.error("LEGAL CHECK FAILED.");
  process.exit(1);
}
console.log("LEGAL CHECK PASS (flags are advisory, no hard violations).");
process.exit(0);
