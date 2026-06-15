#!/usr/bin/env node
/**
 * NaLI V2, Modul 9 dan 10: Historical Archive Pipeline (metadata only).
 *
 * Harvests METADATA ONLY (title, date, institution/catalog, and the anchor URL
 * to the original record) for Indonesia-related historical material from open
 * global archives. It never copies full copyrighted documents. Records are
 * written to content/raw/archive_dataset.json (gitignored, local, regenerable).
 *
 * This is a runnable scaffold, not a one-shot 50k crawl. Scale it the same way as
 * the Fase 7 pipeline: run repeatedly with more keywords; the cache makes re-runs
 * cheap. Reaching large totals is an incremental, multi-session program, never a
 * fabricated number.
 *
 * Live provider implemented (no API key): Library of Congress, Chronicling
 * America (JSON). Other targets are registered with honest access notes.
 *
 * Usage:
 *   node scripts/archive/pipeline.mjs --target=loc --keyword="Krakatau 1883"
 *   node scripts/archive/pipeline.mjs --keyword="Batavia" --rows=20
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "content", "raw");
const OUT_FILE = path.join(RAW_DIR, "archive_dataset.json");
const UA = "Mozilla/5.0 NaLI-research";

const arg = (flag, def) => {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit ? hit.slice(flag.length + 1) : def;
};

/**
 * Target registry. Only providers with a `harvest` function run; the rest carry
 * an honest access note so we never pretend to crawl what we cannot yet reach.
 */
export const ARCHIVE_TARGETS = {
  loc: {
    label: "Library of Congress, Chronicling America",
    country: "US",
    access: "JSON API, no key",
  },
  delpher: {
    label: "Delpher Kranten (KB Nederland)",
    country: "NL",
    access: "OAI-PMH (XML), needs an OAI client; not yet implemented here",
  },
  trove: {
    label: "Trove, National Library of Australia",
    country: "AU",
    access: "REST API, needs an API key from the founder",
  },
  nationaalarchief: {
    label: "Nationaal Archief Den Haag",
    country: "NL",
    access: "API, needs review of terms; not yet implemented here",
  },
};

const KEYWORDS_DEFAULT = ["Krakatau 1883", "Batavia", "Soerabaia", "Borneo Dutch Indies"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch JSON via curl. Some institution endpoints (e.g. loc.gov behind
 * Cloudflare) challenge a bare Node fetch but serve curl normally, so we use the
 * system curl with a real User-Agent. Exponential backoff on transient failure.
 */
async function fetchJson(url, tries = 4) {
  let delay = 800;
  for (let i = 0; i < tries; i++) {
    try {
      const { stdout } = await execFileP(
        "curl",
        ["-sS", "-L", "-m", "40", "-A", UA, "-H", "accept: application/json", url],
        { maxBuffer: 64 * 1024 * 1024 },
      );
      if (!stdout || !stdout.trim()) throw new Error("empty body");
      return JSON.parse(stdout);
    } catch (e) {
      if (i === tries - 1) {
        console.log(`    fetch failed: ${e.message}`);
        return null;
      }
      await sleep(delay);
      delay *= 2; // exponential backoff so we do not get IP-blocked
    }
  }
  return null;
}

/** Library of Congress, Chronicling America. Metadata + anchor URL only. */
async function harvestLoc(keyword, rows) {
  const url =
    "https://www.loc.gov/collections/chronicling-america/?fo=json&at=results&c=" +
    rows +
    "&q=" +
    encodeURIComponent(keyword);
  const json = await fetchJson(url);
  const items = json?.results || [];
  return items
    .map((it) => {
      const anchor = it.url || it.id || "";
      if (!anchor) return null;
      const place = Array.isArray(it.location) ? it.location.join(", ") : it.location || "";
      const dateRaw = Array.isArray(it.date) ? it.date[0] : it.date || "";
      return {
        id: `loc:${it.id || it.url}`,
        title: (Array.isArray(it.title) ? it.title[0] : it.title || "").trim(),
        date: String(dateRaw),
        institution: "Library of Congress, Chronicling America",
        catalog: Array.isArray(it.partof) ? it.partof.join(", ") : it.partof || "",
        place,
        language: Array.isArray(it.language) ? it.language.join(", ") : it.language || "",
        anchorUrl: anchor,
        provider: "loc",
        keyword,
        retrievedAt: new Date().toISOString().slice(0, 10),
        note: "Metadata saja. Dokumen lengkap ada di sumber aslinya.",
      };
    })
    .filter(Boolean);
}

function loadExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const target = arg("--target", "loc");
  const rows = Number(arg("--rows", "20"));
  const single = arg("--keyword", null);
  const keywords = single ? [single] : KEYWORDS_DEFAULT;

  if (!ARCHIVE_TARGETS[target]) {
    console.error(`Unknown target "${target}". Known: ${Object.keys(ARCHIVE_TARGETS).join(", ")}`);
    process.exit(1);
  }
  if (target !== "loc") {
    console.log(
      `Target "${target}" (${ARCHIVE_TARGETS[target].label}): ${ARCHIVE_TARGETS[target].access}.\n` +
        `Belum diimplementasikan sebagai harvester hidup. Pakai --target=loc untuk panen nyata sekarang.`,
    );
    process.exit(0);
  }

  fs.mkdirSync(RAW_DIR, { recursive: true });
  const byId = new Map(loadExisting().map((r) => [r.id, r]));
  const before = byId.size;

  for (const kw of keywords) {
    await sleep(400); // polite rate limit
    const recs = await harvestLoc(kw, rows);
    let added = 0;
    for (const r of recs) {
      if (!r.title) continue;
      if (!byId.has(r.id)) added++;
      byId.set(r.id, r);
    }
    console.log(`loc  ${kw.padEnd(28)} +${added} (total ${byId.size})`);
  }

  const all = [...byId.values()];
  fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 2));
  console.log(
    `\nArchive harvest done. total=${all.length} (new ${byId.size - before}).\n` +
      `Metadata only, written to ${path.relative(ROOT, OUT_FILE)} (gitignored).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
