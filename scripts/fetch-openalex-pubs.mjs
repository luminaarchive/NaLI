#!/usr/bin/env node
/**
 * Finds specific, real open-access publications for curated Indonesia topics via
 * the OpenAlex API, keeps only records whose official OA PDF URL actually
 * resolves to a real PDF, and writes verified candidates (with reconstructed
 * abstract) to /tmp/nali-openalex-candidates.json for record authoring.
 *
 * No invented data: every title, DOI, and PDF URL comes from OpenAlex and is
 * verified to be a working official/publisher/repository PDF.
 */
import fs from "node:fs";

const MAILTO = "ansyahridarmatrijati@gmail.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 NaLI-research";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// curated Indonesia-focused topics; the pipeline picks one verified OA paper each
const QUERIES = [
  ["anak-krakatau", "Anak Krakatau tsunami 2018 collapse"],
  ["tambora-1815", "Tambora 1815 eruption climate"],
  ["samalas-1257", "Samalas 1257 eruption Rinjani"],
  ["toba-supereruption", "Toba supereruption Sumatra"],
  ["merapi-eruption", "Merapi 2010 pyroclastic eruption"],
  ["kelud-eruption", "Kelud volcano eruption 2014"],
  ["ijen-crater", "Ijen crater sulfur acid lake"],
  ["tapanuli-orangutan", "Tapanuli orangutan status threats"],
  ["bornean-orangutan", "Bornean orangutan population decline"],
  ["komodo-conservation", "Komodo dragon conservation Varanus"],
  ["anoa-sulawesi", "anoa Bubalus Sulawesi conservation"],
  ["babirusa", "babirusa Sulawesi ecology"],
  ["tarsier-sulawesi", "tarsier Tarsius Sulawesi"],
  ["coelacanth-indonesia", "coelacanth Latimeria menadoensis Indonesia"],
  ["javan-rhino", "Javan rhinoceros Ujung Kulon population"],
  ["sumatran-tiger", "Sumatran tiger conservation habitat"],
  ["sumatran-elephant", "Sumatran elephant habitat conflict"],
  ["coral-triangle", "coral reef Coral Triangle Indonesia biodiversity"],
  ["coral-bleaching-id", "coral bleaching Indonesia thermal stress"],
  ["mangrove-blue-carbon", "mangrove blue carbon Indonesia"],
  ["peatland-fire", "peatland fire Indonesia carbon emissions"],
  ["deforestation-borneo", "deforestation Borneo Kalimantan forest loss"],
  ["plastic-pollution-id", "plastic pollution rivers Indonesia marine"],
  ["jakarta-subsidence", "Jakarta land subsidence groundwater"],
  ["bird-of-paradise", "bird of paradise Papua New Guinea Paradisaeidae"],
  ["maleo-megapode", "maleo Macrocephalon megapode nesting"],
  ["pangolin-trade", "Sunda pangolin Manis javanica trade"],
  ["dugong-seagrass", "dugong seagrass Indonesia"],
  ["proboscis-monkey", "proboscis monkey Nasalis larvatus Borneo"],
  ["wallacea-biogeography", "Wallacea biogeography endemism Sulawesi"],
  ["sumatran-rhino", "Sumatran rhinoceros Dicerorhinus population"],
  ["sun-bear", "sun bear Helarctos malayanus ecology"],
  ["javan-gibbon", "Javan gibbon Hylobates moloch conservation"],
  ["sulawesi-macaque", "Sulawesi crested macaque Macaca nigra"],
  ["slow-loris", "slow loris Nycticebus trade Java"],
  ["seagrass-indonesia", "seagrass meadow Indonesia carbon"],
  ["reef-fish-indonesia", "reef fish diversity Indonesia"],
  ["forest-loss-sumatra", "forest loss Sumatra oil palm"],
  ["fire-haze-elnino", "Indonesia fire haze El Nino 2015 emissions"],
  ["volcanic-hazard-java", "volcanic hazard Java monitoring"],
  ["mangrove-restoration", "mangrove restoration Indonesia success"],
  ["new-species-zookeys", "new species Sulawesi Indonesia description"],
  ["frog-amphibian-id", "new frog species Indonesia amphibian"],
  ["bat-diversity-id", "bat diversity Indonesia Sulawesi"],
  ["karst-cave-id", "karst cave biodiversity Indonesia"],
  ["sea-level-coast-id", "sea level rise coastal Indonesia"],
  ["turtle-nesting-id", "sea turtle nesting Indonesia conservation"],
  ["hornbill-id", "hornbill Sumatra seed dispersal"],
  ["rafflesia", "Rafflesia Indonesia conservation"],
  ["orchid-id", "orchid diversity Indonesia conservation"],
  ["butterfly-id", "butterfly diversity Indonesia"],
  ["sumatran-elephant-2", "elephant Sumatra human conflict mitigation"],
  ["sumatran-tiger-2", "tiger Sumatra camera trap occupancy"],
  ["bird-diversity-id", "bird diversity Indonesia national park"],
  ["marine-protected-id", "marine protected area Indonesia management"],
  ["fisheries-id", "small scale fisheries Indonesia management"],
  ["land-use-sumatra", "land use change Sumatra carbon"],
  ["mammal-borneo", "mammal diversity Borneo camera trap"],
  ["reptile-checklist-id", "reptile checklist Indonesia herpetofauna"],
  ["krakatau-succession", "Krakatau vegetation succession island"],
  ["primate-survey-id", "primate survey Sumatra population density"],
  ["endemic-plant-sulawesi", "endemic plant Sulawesi new"],
  ["seamount-deepsea-id", "deep sea Indonesia biodiversity"],
  ["river-water-java", "water quality river Java pollution"],
  ["agroforestry-id", "agroforestry Indonesia biodiversity"],
  ["bamboo-id", "bamboo Indonesia diversity"],
  ["bee-pollinator-id", "bee pollinator Indonesia"],
  ["shark-ray-id", "shark ray fisheries Indonesia"],
];

function reconstructAbstract(inv) {
  if (!inv) return "";
  const words = [];
  for (const [w, positions] of Object.entries(inv)) for (const pos of positions) words[pos] = w;
  return words.join(" ").replace(/\s+/g, " ").trim();
}

async function pdfResolves(url) {
  if (!url) return false;
  try {
    const r = await fetch(url, {
      headers: { "user-agent": UA, accept: "application/pdf,*/*", range: "bytes=0-2047" },
      redirect: "follow",
    });
    if (!(r.ok || r.status === 206)) return false;
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const buf = Buffer.from(await r.arrayBuffer());
    const head = buf.slice(0, 5).toString("latin1");
    if (head.startsWith("%PDF")) return true; // definitive
    if (ct.includes("pdf") && !ct.includes("html")) return true;
    return false;
  } catch {
    return false;
  }
}

async function openalex(query) {
  const filter = `title.search:${query},is_oa:true,has_doi:true`;
  const url =
    "https://api.openalex.org/works?filter=" +
    encodeURIComponent(filter) +
    "&per_page=25&sort=cited_by_count:desc&mailto=" +
    MAILTO;
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`OpenAlex ${r.status}`);
  return (await r.json()).results || [];
}

async function main() {
  const out = [];
  for (const [slug, query] of QUERIES) {
    await sleep(700);
    let picked = null;
    try {
      const results = await openalex(query);
      // prefer gold/diamond OA with a pdf_url that resolves
      for (const w of results) {
        const pdf = w.best_oa_location?.pdf_url || w.open_access?.oa_url;
        if (!pdf) continue;
        if (!(await pdfResolves(pdf))) continue;
        picked = {
          slug,
          query,
          title: w.title,
          authors: (w.authorships || []).slice(0, 6).map((a) => a.author?.display_name).filter(Boolean),
          year: String(w.publication_year ?? ""),
          doi: (w.doi || "").replace(/^https?:\/\/doi\.org\//, ""),
          source: w.primary_location?.source?.display_name || w.best_oa_location?.source?.display_name || "",
          publisher: w.primary_location?.source?.host_organization_name || "",
          oaStatus: w.open_access?.oa_status,
          landing: w.primary_location?.landing_page_url || (w.doi || ""),
          pdfUrl: pdf,
          type: w.type,
          abstract: reconstructAbstract(w.abstract_inverted_index).slice(0, 900),
        };
        break;
      }
    } catch (e) {
      console.log(`ERR ${slug}: ${e.message}`);
    }
    if (picked) {
      out.push(picked);
      console.log(`OK  ${slug.padEnd(22)} ${picked.year} ${(picked.source || "").slice(0, 28).padEnd(28)} pdf ok`);
    } else {
      console.log(`--  ${slug.padEnd(22)} no verifiable OA PDF`);
    }
  }
  fs.writeFileSync("/tmp/nali-openalex-candidates.json", JSON.stringify(out, null, 2));
  console.log(`\nVerified OA publications with working PDF: ${out.length}/${QUERIES.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
