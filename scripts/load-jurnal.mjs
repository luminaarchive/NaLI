/**
 * Loads Jurnal entries from the TypeScript cluster files for use by Node
 * validators (which cannot import the path-aliased TS directly). Each cluster
 * file exports a single array of raw entries built with the `j()` helper. We
 * strip the imports, inline a trivial `j`, transpile to JS, and import it as a
 * data URL. Covers are attached from content/jurnal/covers.json (the manifest
 * built by scripts/build-jurnal-covers.mjs), mirroring lib/jurnal.ts.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const CLUSTERS_DIR = path.join(process.cwd(), "content", "jurnal", "clusters");
const MANIFEST = path.join(process.cwd(), "content", "jurnal", "covers.json");

// Mirror of content/jurnal/_helper.ts j(): a passthrough that defaults id.
const J_SHIM = `const j = (e) => ({ ...e, id: e.id ?? e.slug });\n`;

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

export async function loadJournalEntries() {
  if (!fs.existsSync(CLUSTERS_DIR)) return [];
  const covers = loadManifest();
  const files = fs
    .readdirSync(CLUSTERS_DIR)
    .filter((f) => f.endsWith(".ts"))
    .sort();

  const all = [];
  for (const file of files) {
    const full = path.join(CLUSTERS_DIR, file);
    let src = fs.readFileSync(full, "utf8");
    src = src.replace(/^\s*import[^\n]*\n/gm, "");
    src = src.replace(/export\s+const\s+\w+\s*=/, "export default");
    src = J_SHIM + src;

    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;

    const url = "data:text/javascript;base64," + Buffer.from(js, "utf8").toString("base64");
    const mod = await import(url);
    const arr = mod.default;
    if (Array.isArray(arr)) {
      for (const entry of arr) {
        const cover = covers[entry.slug];
        const sourceIds =
          cover && cover.sourceId && !entry.sourceIds.includes(cover.sourceId)
            ? [...entry.sourceIds, cover.sourceId]
            : entry.sourceIds;
        all.push({ ...entry, sourceIds, cover, __file: `content/jurnal/clusters/${file}` });
      }
    }
  }
  return all;
}
