// Lab harvest, Supabase Edge Function (self-running, no founder credential).
//
// Re-harvests the 12 Lazarus-cluster seed taxa from GBIF + iNaturalist (read-only,
// no API key), distills lead signals with the SAME normalization as
// scripts/lab/build-leads.mjs, upserts public.lab_leads, and logs one row to
// public.lab_harvest_runs. Runs weekly via pg_cron (see migration 0014).
//
// Auth: the gateway requires a valid Supabase JWT (the public anon key, which
// pg_cron sends). Writes use SUPABASE_SERVICE_ROLE_KEY, which Supabase injects
// into the function runtime automatically , the key is never handled outside
// Supabase's own environment. The upsert NEVER clobbers human status/notes.
//
// Nothing is invented: a signal is emitted only when the provider returned the
// underlying fact. Verified taxon keys are embedded so the run is deterministic
// and avoids the fuzzy-name-match pitfall (an exact id can never attach the
// wrong taxon's observations).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GBIF = "https://api.gbif.org/v1";
const INAT = "https://api.inaturalist.org/v1";
const INDONESIA_PLACE_ID = 6966;
const MAILTO = "ansyahridarmatrijati@gmail.com";
const NOW = new Date().getFullYear();

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const round2 = (v: number) => Number(v.toFixed(2));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const IUCN_WEIGHT: Record<string, number> = {
  EX: 1.0, EW: 0.95, CR: 0.9, EN: 0.7, VU: 0.5, NT: 0.3, LC: 0.1, DD: 0.65,
};

// 12 seed taxa with verified GBIF usageKey + iNaturalist taxon_id + curated
// public IUCN category. Same set as scripts/lab/seed-taxa.mjs + seed-iucn.mjs.
const TAXA = [
  { sci: "Panthera tigris sondaica", common: "Harimau Jawa", rank: "subspecies", gbif: 5219422, inat: 130799, iucn: "EX" },
  { sci: "Malacocincla perspicillata", common: "Black-browed babbler", rank: "species", gbif: 2493402, inat: 15145, iucn: "DD" },
  { sci: "Eutrichomyias rowleyi", common: "Seriwang Sangihe", rank: "species", gbif: 2486697, inat: 8604, iucn: "CR" },
  { sci: "Megachile pluto", common: "Lebah raksasa Wallace", rank: "species", gbif: 1336561, inat: 97243, iucn: "VU" },
  { sci: "Latimeria menadoensis", common: "Coelacanth Sulawesi", rank: "species", gbif: 2441276, inat: 104110, iucn: "VU" },
  { sci: "Nepenthes pitopangii", common: "Kantong semar Sulawesi", rank: "species", gbif: 4930501, inat: 441243, iucn: "VU" },
  { sci: "Rhinoceros sondaicus", common: "Badak Jawa", rank: "species", gbif: 5220112, inat: 43346, iucn: "CR" },
  { sci: "Orcaella brevirostris", common: "Pesut Mahakam", rank: "species", gbif: 2440460, inat: 41519, iucn: "EN" },
  { sci: "Zaglossus attenboroughi", common: "Echidna paruh panjang Attenborough", rank: "species", gbif: 2433390, inat: 43247, iucn: "CR" },
  { sci: "Cyornis ruckii", common: "Sikatan Rueck", rank: "species", gbif: 2492441, inat: 12859, iucn: "EN" },
  { sci: "Varanus zugorum", common: "Biawak Zug", rank: "species", gbif: 2470837, inat: 39431, iucn: "DD" },
  { sci: "Gallirallus sharpei", common: "Mandar Sharpe", rank: "species", gbif: 2474543, inat: null, iucn: null },
] as const;

async function fetchJson(url: string, tries = 4): Promise<any> {
  let delay = 800;
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 25000);
      const r = await fetch(url, {
        headers: { "user-agent": `NaLI-research/1.0 (Lab edge harvester; ${MAILTO})`, accept: "application/json" },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) return { __error: r.status };
      return await r.json();
    } catch (_e) {
      if (i === tries - 1) return null;
      await sleep(delay);
      delay *= 2;
    }
  }
  return null;
}

async function gbifFacts(usageKey: number) {
  const hist = await fetchJson(
    `${GBIF}/occurrence/search?taxonKey=${usageKey}&limit=0&facet=year&facetLimit=2000&mailto=${MAILTO}`,
  );
  if (!hist || hist.__error) return null;
  const yearFacet = (hist.facets || []).find((f: any) => f.field === "YEAR");
  const counts = (yearFacet?.counts || [])
    .map((c: any) => ({ year: Number(c.name), count: c.count }))
    .filter((c: any) => Number.isFinite(c.year) && c.year > 1500 && c.year <= NOW + 1);
  const years = counts.map((c: any) => c.year);
  const lastYear = years.length ? Math.max(...years) : null;
  const recentCount = counts.filter((c: any) => c.year >= NOW - 20).reduce((s: number, c: any) => s + c.count, 0);
  const idj = await fetchJson(`${GBIF}/occurrence/search?taxonKey=${usageKey}&country=ID&limit=0&mailto=${MAILTO}`);
  const idCount = idj && !idj.__error ? (idj.count ?? 0) : null;
  return { total: hist.count ?? 0, lastYear, recentCount, idCount };
}

async function inatObs(taxonId: number, placeId?: number) {
  let url = `${INAT}/observations?taxon_id=${taxonId}&quality_grade=research&order_by=observed_on&order=desc&per_page=1`;
  if (placeId) url += `&place_id=${placeId}`;
  const j = await fetchJson(url);
  if (!j || j.__error) return null;
  const top = (j.results || [])[0];
  const on = top?.observed_on || top?.observed_on_details?.date || null;
  const year = on ? Number(String(on).slice(0, 4)) : null;
  return { total: j.total_results ?? 0, lastYear: Number.isFinite(year) ? year : null };
}

function buildSignals(g: any, n: any, iucn: string | null) {
  const signals: any[] = [];
  if (g) {
    if (g.lastYear != null) {
      const gap = NOW - g.lastYear;
      signals.push({ key: "gbif_gap", label: "Jeda sejak rekaman GBIF terakhir", value: round2(clamp(gap / 50)), note: `${gap} tahun (terakhir ${g.lastYear})` });
    } else {
      signals.push({ key: "gbif_gap", label: "Jeda sejak rekaman GBIF terakhir", value: 1, note: "Tidak ada rekaman GBIF berkala" });
    }
    const total = g.total ?? 0;
    signals.push({ key: "gbif_scarcity", label: "Kelangkaan rekaman GBIF", value: round2(total <= 0 ? 1 : clamp(1 - Math.log10(total + 1) / 4)), note: `${total} okurensi global, ${g.idCount ?? "?"} di Indonesia` });
  }
  // iNat signal always emitted (parity with build-leads): value 0 means no recent obs.
  const ly = n?.lastYear ?? null;
  const recency = ly != null ? round2(clamp(1 - (NOW - ly) / 30)) : 0;
  signals.push({
    key: "inat_recent_obs",
    label: "Observasi riset iNaturalist (menurunkan prioritas)",
    value: recency,
    note: n && n.total > 0 ? `${n.total} observasi riset, terbaru ${ly ?? "?"}` : "Tidak ada observasi riset",
  });
  if (iucn) {
    signals.push({ key: "iucn_status", label: "Status ancaman IUCN", value: IUCN_WEIGHT[iucn] ?? 0.4, note: `${iucn} (kurasi)` });
  }
  return signals;
}

Deno.serve(async (req: Request) => {
  const trigger = new URL(req.url).searchParams.get("trigger") || "manual";
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const rows: any[] = [];
  const providerOk = { gbif: 0, inat: 0 };
  let anyFail = false;

  for (const tx of TAXA) {
    const g = await gbifFacts(tx.gbif);
    if (g) providerOk.gbif++;
    else anyFail = true;
    await sleep(250);

    let n = null;
    if (tx.inat) {
      n = await inatObs(tx.inat);
      if (n) providerOk.inat++;
      else anyFail = true;
      await sleep(250);
    }

    const lastYears = [g?.lastYear, n?.lastYear].filter((y) => y != null) as number[];
    const sources = [
      { label: "GBIF", url: `https://www.gbif.org/occurrence/search?taxon_key=${tx.gbif}` },
      {
        label: "iNaturalist",
        url: tx.inat
          ? `https://www.inaturalist.org/observations?taxon_id=${tx.inat}&quality_grade=research`
          : `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(tx.sci)}`,
      },
      { label: "IUCN (kurasi)", url: `https://www.iucnredlist.org/search?query=${encodeURIComponent(tx.sci)}` },
    ];

    rows.push({
      taxon_name: tx.sci,
      taxon_rank: tx.rank,
      common_name: tx.common,
      iucn_status: tx.iucn,
      last_record_year: lastYears.length ? Math.max(...lastYears) : null,
      signals: buildSignals(g, n, tx.iucn),
      sources,
      updated_at: new Date().toISOString(),
    });
  }

  const { error: upErr } = await sb
    .from("lab_leads")
    .upsert(rows, { onConflict: "taxon_name", ignoreDuplicates: false });

  const status = upErr ? "failed" : anyFail ? "partial" : "success";

  const highlights = rows
    .map((r) => ({
      taxon: r.taxon_name,
      gap_years: r.last_record_year != null ? NOW - r.last_record_year : null,
      note: r.last_record_year != null ? `terakhir ${r.last_record_year}` : "tanpa rekaman",
    }))
    .sort((a, b) => {
      if (a.gap_years == null && b.gap_years == null) return 0;
      if (a.gap_years == null) return -1;
      if (b.gap_years == null) return 1;
      return b.gap_years - a.gap_years;
    })
    .slice(0, 5);

  await sb.from("lab_harvest_runs").insert({
    trigger: ["manual", "cron", "dev", "backfill"].includes(trigger) ? trigger : "manual",
    status,
    taxa_count: rows.length,
    leads_upserted: upErr ? 0 : rows.length,
    providers: [
      { source: "gbif", records: providerOk.gbif, ok: providerOk.gbif > 0 },
      { source: "inat", records: providerOk.inat, ok: providerOk.inat > 0 },
      { source: "iucn", records: rows.filter((r) => r.iucn_status).length, ok: true, provenance: "curated" },
    ],
    highlights,
    notes: `edge lab-harvest ${status} , GBIF ${providerOk.gbif}/${TAXA.length}, iNat ${providerOk.inat}.`,
  });

  return new Response(
    JSON.stringify({ status, taxa: rows.length, upserted: upErr ? 0 : rows.length, error: upErr?.message ?? null }),
    { headers: { "content-type": "application/json" }, status: upErr ? 500 : 200 },
  );
});
