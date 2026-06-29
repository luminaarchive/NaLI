#!/usr/bin/env node
/**
 * build-leads (Lab, Step 3.2). The ONE privileged step.
 *
 * Reads the three local dumps (content/lab-raw/{gbif,inat,iucn}.json), joins
 * them per taxon, distills the facts into lab_leads rows, and upserts into
 * Supabase using the service-role key. Fail-closed: without the key it refuses
 * to write. --dry-run prints the distilled rows and writes nothing (works
 * without any key, so you can inspect the shape first).
 *
 * EPISTEMIC CONTRACT:
 *   - `signals` holds RAW, normalized (0..1) evidence magnitudes with sourced
 *     notes. This script does NOT compute the Lazarus `score` (left null) , that
 *     is Step 3.3's job, with a transparent, weighted formula.
 *   - Upsert NEVER clobbers `status` or `notes` (the human review fields): they
 *     are simply omitted from the payload, so ON CONFLICT leaves them untouched
 *     and INSERT uses the table defaults ('lead' / null).
 *   - Nothing is invented. A signal is emitted only when its source provided the
 *     underlying fact.
 *
 * Usage:
 *   node --env-file=.env.local scripts/lab/build-leads.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { SEED_TAXA } from "./seed-taxa.mjs";
import { readDump, getServiceClient, arg, ROOT, rel } from "./_shared.mjs";

const DRY = process.argv.includes("--dry-run");
const EMIT_SAMPLE = process.argv.includes("--emit-sample");
const SAMPLE_FILE = path.join(ROOT, "lib", "lab", "sample-leads.ts");
const NOW = new Date().getFullYear();
const clamp = (v) => Math.max(0, Math.min(1, v));
const round2 = (v) => Number(v.toFixed(2));

// IUCN category -> lead-worthiness magnitude (0..1). DD (data deficient) scores
// high on purpose: ignorance is exactly what merits a look.
const IUCN_WEIGHT = {
  EX: 1.0, EW: 0.95, CR: 0.9, EN: 0.7, VU: 0.5, NT: 0.3, LC: 0.1, DD: 0.65,
};

function indexBy(list, key) {
  const m = new Map();
  for (const r of list || []) m.set(r[key], r);
  return m;
}

function buildSignals(g, n, u) {
  const signals = [];

  if (g) {
    if (g.gapYears != null) {
      signals.push({
        key: "gbif_gap",
        label: "Jeda sejak rekaman GBIF terakhir",
        value: round2(clamp(g.gapYears / 50)),
        note: `${g.gapYears} tahun (terakhir ${g.lastRecordYear})`,
      });
    } else {
      signals.push({
        key: "gbif_gap",
        label: "Jeda sejak rekaman GBIF terakhir",
        value: 1,
        note: "Tidak ada rekaman GBIF berkala",
      });
    }
    const total = g.totalOccurrences ?? 0;
    signals.push({
      key: "gbif_scarcity",
      label: "Kelangkaan rekaman GBIF",
      value: round2(total <= 0 ? 1 : clamp(1 - Math.log10(total + 1) / 4)),
      note: `${total} okurensi global, ${g.indonesiaOccurrences ?? "?"} di Indonesia`,
    });
  }

  if (n) {
    // A recent research-grade observation LOWERS lead priority (it suggests the
    // taxon is being seen). We store the recency magnitude; Step 3.3 applies the
    // negative weight. Note makes the direction explicit.
    const ly = n.lastResearchYear;
    const recency = ly != null ? round2(clamp(1 - (NOW - ly) / 30)) : 0;
    signals.push({
      key: "inat_recent_obs",
      label: "Observasi riset iNaturalist (menurunkan prioritas)",
      value: recency,
      note:
        n.researchGradeTotal > 0
          ? `${n.researchGradeTotal} observasi riset, terbaru ${ly ?? "?"} (Indonesia ${n.indonesiaResearchGradeTotal})`
          : "Tidak ada observasi riset",
    });
  }

  if (u && u.iucnCategory) {
    const prov = u.provenance === "curated" ? " (kurasi)" : "";
    signals.push({
      key: "iucn_status",
      label: "Status ancaman IUCN",
      value: IUCN_WEIGHT[u.iucnCategory] ?? 0.4,
      note: `${u.iucnCategory}${u.assessmentYear ? ` (${u.assessmentYear})` : ""}${prov}`,
    });
  }

  return signals;
}

function buildRow(seed, g, n, u) {
  const taxonName = g?.matched?.canonicalName || seed.sci;
  const lastYears = [g?.lastRecordYear, n?.lastResearchYear].filter((y) => y != null);
  const lastRecordYear = lastYears.length ? Math.max(...lastYears) : null;

  const sources = [];
  if (g?.sourceUrl) sources.push({ label: "GBIF", url: g.sourceUrl });
  if (n?.sourceUrl) sources.push({ label: "iNaturalist", url: n.sourceUrl });
  if (u?.sourceUrl) {
    sources.push({
      label: u.provenance === "curated" ? "IUCN (kurasi)" : "IUCN Red List",
      url: u.sourceUrl,
    });
  }

  return {
    taxon_name: taxonName,
    taxon_rank: g?.matched?.rank || seed.rank || null,
    common_name: seed.common || null,
    iucn_status: u?.iucnCategory || null,
    last_record_year: lastRecordYear,
    // score intentionally omitted from the DB write -> stays null; the app
    // computes the Lazarus Score at read time from `signals` (Step 3.3), so the
    // formula stays single-source and never goes stale in the table.
    signals: buildSignals(g, n, u),
    sources,
    // status + notes intentionally omitted -> ON CONFLICT leaves them untouched,
    // INSERT uses table defaults ('lead' / null).
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const gbif = readDump("gbif", []);
  const inat = readDump("inat", []);
  const iucn = readDump("iucn", []);
  if (!gbif.length && !inat.length) {
    console.error(
      "No dumps found in content/lab-raw/. Run the harvesters first:\n" +
        "  node scripts/lab/harvest-gbif.mjs\n" +
        "  node scripts/lab/harvest-inat.mjs\n" +
        "  node --env-file=.env.local scripts/lab/harvest-iucn.mjs",
    );
    process.exit(1);
  }

  const gIdx = indexBy(gbif, "seedSci");
  const nIdx = indexBy(inat, "seedSci");
  const uIdx = indexBy(iucn, "seedSci");

  const rows = SEED_TAXA.map((seed) =>
    buildRow(seed, gIdx.get(seed.sci), nIdx.get(seed.sci), uIdx.get(seed.sci)),
  );

  console.log(`Distilled ${rows.length} leads from dumps.\n`);
  for (const r of rows) {
    console.log(
      `  ${r.taxon_name.padEnd(30)} last ${r.last_record_year ?? "?"} | ` +
        `IUCN ${r.iucn_status ?? "-"} | ${r.signals.length} signals`,
    );
  }

  if (EMIT_SAMPLE) {
    // Snapshot the REAL harvested rows into a committed TS fixture so the /lab
    // dashboard populates in dev and prod even before build-leads writes the DB.
    // This is real GBIF + iNat data + curated IUCN, labeled CONTOH in the UI.
    const now = new Date().toISOString();
    const sampleRows = rows.map((r) => ({
      taxon_name: r.taxon_name,
      taxon_rank: r.taxon_rank,
      common_name: r.common_name,
      iucn_status: r.iucn_status,
      last_record_year: r.last_record_year,
      score: null,
      signals: r.signals,
      sources: r.sources,
      status: "lead",
      notes: null,
      created_at: now,
      updated_at: now,
    }));
    const body =
      "// AUTO-GENERATED by `node scripts/lab/build-leads.mjs --emit-sample`.\n" +
      "// Do not edit by hand. A snapshot of REAL harvested data (GBIF + iNaturalist\n" +
      "// live, IUCN curated public categories), used as the /lab dashboard fallback\n" +
      "// when the lab_leads table is empty. Surfaced in the UI as CONTOH, never as\n" +
      "// reviewed leads. Regenerate after re-harvesting.\n" +
      'import type { LabLeadRow } from "@/lib/lab/leads";\n\n' +
      `export const SAMPLE_LEAD_ROWS: LabLeadRow[] = ${JSON.stringify(sampleRows, null, 2)};\n`;
    fs.mkdirSync(path.dirname(SAMPLE_FILE), { recursive: true });
    fs.writeFileSync(SAMPLE_FILE, body);
    console.log(`\n--emit-sample: wrote ${rel(SAMPLE_FILE)} (${sampleRows.length} leads).`);
    return;
  }

  if (DRY) {
    console.log("\n--dry-run: nothing written. Sample row:\n");
    console.log(JSON.stringify(rows[0], null, 2));
    return;
  }

  const sb = await getServiceClient();
  if (!sb) process.exit(1); // fail-closed; getServiceClient logged why.

  const { error } = await sb
    .from("lab_leads")
    .upsert(rows, { onConflict: "taxon_name", ignoreDuplicates: false });
  if (error) {
    console.error("\nUpsert failed:", error.message);
    process.exit(1);
  }
  console.log(`\nUpserted ${rows.length} leads into lab_leads (status/notes preserved).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
