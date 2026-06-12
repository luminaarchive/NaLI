/**
 * Loads Jurnal entries from the TypeScript cluster files for use by Node
 * validators (which cannot import the path-aliased TS directly). Each cluster
 * file exports a single array of entries built with the `j()` helper. We strip
 * the imports, inline a minimal `j`, transpile to JS, and import it as a data
 * URL. This keeps the TS files the single source of truth.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const CLUSTERS_DIR = path.join(process.cwd(), "content", "jurnal", "clusters");

// Mirror of content/jurnal/_helper.ts j(): builds the full mandatory cover from
// the light per-entry cover input. Keep in sync with the real helper.
const J_SHIM = `
const __SITE_URL = "https://nalijournal.vercel.app";
const __COVER_PHRASE = "Visual penjelas, bukan foto lapangan.";
const j = (e) => {
  const caption = e.cover.caption.includes(__COVER_PHRASE)
    ? e.cover.caption
    : e.cover.caption + " " + __COVER_PHRASE;
  const cover = {
    id: "cover-" + e.slug,
    src: "/images/jurnal-covers/" + e.slug + ".svg",
    type: e.cover.type,
    title: e.cover.title,
    creator: "NaLI by NatIve",
    sourceUrl: __SITE_URL + "/arsip-sumber/" + e.sourceIds[0],
    license: "Internal explanatory visual for NaLI Jurnal",
    attribution: "Visual internal NaLI by NatIve, non-AI",
    caption,
    alt: e.cover.alt,
    checkedAt: e.checkedAt,
    relatedJurnalIds: [e.slug],
  };
  return { ...e, id: e.id ?? e.slug, cover };
};
`;

export async function loadJournalEntries() {
  if (!fs.existsSync(CLUSTERS_DIR)) return [];
  const files = fs
    .readdirSync(CLUSTERS_DIR)
    .filter((f) => f.endsWith(".ts"))
    .sort();

  const all = [];
  for (const file of files) {
    const full = path.join(CLUSTERS_DIR, file);
    let src = fs.readFileSync(full, "utf8");
    // strip every import line (the j helper + the `import type` line)
    src = src.replace(/^\s*import[^\n]*\n/gm, "");
    // turn the single named export into a default export so we can read it back
    src = src.replace(/export\s+const\s+\w+\s*=/, "export default");
    src = J_SHIM + src;

    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;

    const url = "data:text/javascript;base64," + Buffer.from(js, "utf8").toString("base64");
    const mod = await import(url);
    const arr = mod.default;
    if (Array.isArray(arr)) {
      for (const entry of arr) all.push({ ...entry, __file: `content/jurnal/clusters/${file}` });
    }
  }
  return all;
}
