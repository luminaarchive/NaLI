#!/usr/bin/env node
/**
 * MDX -> DB sync pipeline (Doctrine v2.1, Part 1).
 *
 * Reads every article in content/articles/*.mdx, maps the real frontmatter
 * (category/confidence/claimLedger) onto the relational evidence layer, and
 * upserts into Supabase: articles, sources (OA only), claims, claim_sources.
 *
 * Idempotent: articles upsert on slug, sources upsert on url, and an article's
 * claims (+ their claim_sources) are rebuilt on each run.
 *
 * Modes:
 *   node scripts/sync-articles.mjs              real write (needs SUPABASE_SERVICE_ROLE_KEY)
 *   node scripts/sync-articles.mjs --dry-run    compute + report, no DB writes
 *   node scripts/sync-articles.mjs --emit-sql <dir>   write SQL files for manual apply
 *
 * .mjs by design (matches the repo's validator style, no ts-node). Env is read
 * from process.env (dotenv is not a dependency here).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { printReport } from "./sync-articles-report.mjs";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");

const DRY_RUN = process.argv.includes("--dry-run");
const EMIT_IDX = process.argv.indexOf("--emit-sql");
const EMIT_DIR = EMIT_IDX >= 0 ? process.argv[EMIT_IDX + 1] : null;

/* ---- mappings (single source of truth for the sync) ---- */
const VERTICALS = new Set(["alam", "sejarah", "investigasi"]);

const CONFIDENCE_ARTICLE = {
  high: "terverifikasi-kuat",
  medium: "didukung-sumber",
  low: "terbatas",
  "needs-verification": "belum-cukup-bukti",
  diperdebatkan: "diperdebatkan",
  "belum-cukup-bukti": "belum-cukup-bukti",
};

const CLAIM_STATUS = {
  "terverifikasi kuat": "terverifikasi-kuat",
  "didukung sumber": "didukung-sumber",
  diperdebatkan: "diperdebatkan",
  "belum cukup bukti": "belum-cukup-bukti",
  terbatas: "terbatas",
};

// Known open-access / open-content domains (prompt list + a few clearly-OA
// scholarly hosts that appear in the corpus: Copernicus journals, PMC/NCBI).
const OA_DOMAINS = [
  "cambridge.org/core",
  "plos.org",
  "frontiersin.org",
  "mdpi.com",
  "nature.com/articles",
  "science.org",
  "royalsocietypublishing.org",
  "link.springer.com",
  "onlinelibrary.wiley.com",
  "pubmed.ncbi",
  "pmc.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "europepmc.org",
  "zenodo.org",
  "figshare.com",
  "osf.io",
  "arxiv.org",
  "biorxiv.org",
  "iucnredlist.org",
  "researchgate.net",
  "copernicus.org",
];

// DB source_type enum: jurnal|laporan|arsip|media|buku|dataset|primer
const DB_SOURCE_TYPES = new Set(["jurnal", "laporan", "arsip", "media", "buku", "dataset", "primer"]);

const warnings = [];
const warn = (m) => warnings.push(m);

function isOaUrl(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  return OA_DOMAINS.some((d) => u.includes(d));
}

function parsePointers(ref) {
  return typeof ref === "string" ? [...ref.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])) : [];
}

/**
 * Build the full sync plan from the MDX files. Pure, no DB.
 * Returns { articles, sources (by url), stats }.
 */
export function buildSyncPlan() {
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"));
  const planArticles = [];
  const sourcesByUrl = new Map(); // url -> {title,url,source_type,is_oa,accessed_at}
  const stats = {
    dryRun: DRY_RUN,
    articles: { processed: 0, upserted: 0, skipped: 0, skipReasons: [] },
    sources: { upserted: 0, skippedNoUrl: 0, skippedNotOa: 0, skippedBuku: 0 },
    claims: { upserted: 0 },
    claimSources: { created: 0, skipped: 0 },
    warnings,
  };

  for (const file of files) {
    stats.articles.processed++;
    const slug = file.replace(/\.mdx$/, "");
    let data;
    try {
      data = matter(fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8")).data;
    } catch (e) {
      stats.articles.skipped++;
      stats.articles.skipReasons.push(`${slug}: cannot parse frontmatter (${e.message})`);
      continue;
    }

    const vertical = String(data.category || "").trim();
    if (!VERTICALS.has(vertical)) {
      stats.articles.skipped++;
      stats.articles.skipReasons.push(`${slug}: category "${data.category}" not a pillar, skipped`);
      continue;
    }

    const publishedAt = data.date || data.publishedAt || null;
    const lastChecked = data.updated || data.lastChecked || publishedAt;
    if (!lastChecked) {
      stats.articles.skipped++;
      stats.articles.skipReasons.push(`${slug}: no date/updated, cannot set last_checked_at, skipped`);
      continue;
    }
    const status = data.status || (publishedAt ? "published" : "draft");
    const confKey = String(data.confidence || "").trim();
    let confidence = CONFIDENCE_ARTICLE[confKey];
    if (!confidence) {
      confidence = "belum-cukup-bukti";
      warn(`${slug}: unmapped confidence "${data.confidence}" -> belum-cukup-bukti`);
    }

    // sources of this article, indexed 1-based for claim pointer resolution
    const rawSources = Array.isArray(data.sources) ? data.sources : [];
    const resolvedUrls = []; // index aligned with rawSources, url or null if not inserted
    rawSources.forEach((s) => {
      const url = (s && typeof s.url === "string" && s.url.trim()) || "";
      const type = s && DB_SOURCE_TYPES.has(s.type) ? s.type : null;
      if (!url) {
        if (s && s.type === "buku") stats.sources.skippedBuku++;
        else stats.sources.skippedNoUrl++;
        resolvedUrls.push(null);
        return;
      }
      if (s && s.type === "buku") {
        stats.sources.skippedBuku++;
        resolvedUrls.push(null);
        return;
      }
      if (!isOaUrl(url)) {
        stats.sources.skippedNotOa++;
        resolvedUrls.push(null);
        return;
      }
      resolvedUrls.push(url);
      if (!sourcesByUrl.has(url)) {
        sourcesByUrl.set(url, {
          title: (s && s.title) || url,
          url,
          source_type: type,
          is_oa: true,
          accessed_at: lastChecked,
        });
      }
    });

    // claims
    const ledger = Array.isArray(data.claimLedger) ? data.claimLedger : [];
    const claims = [];
    ledger.forEach((c) => {
      const statement = (c && (c.claim || c.statement) || "").trim();
      if (!statement) return;
      const sKey = String(c && c.status || "").trim().toLowerCase();
      let conf = CLAIM_STATUS[sKey];
      if (!conf) {
        conf = "belum-cukup-bukti";
        warn(`${slug}: unmapped claim status "${c && c.status}" -> belum-cukup-bukti`);
      }
      const pointers = parsePointers(c && c.sources);
      const linkUrls = [];
      pointers.forEach((p) => {
        const url = resolvedUrls[p - 1]; // 1-based
        if (url) linkUrls.push(url);
        else stats.claimSources.skipped++;
      });
      claims.push({ statement, confidence: conf, linkUrls });
      stats.claims.upserted++;
      stats.claimSources.created += linkUrls.length;
    });

    planArticles.push({
      slug,
      title: data.title || slug,
      vertical,
      published_at: publishedAt,
      last_checked_at: lastChecked,
      author: data.author || "NaLI",
      status,
      confidence_overall: confidence,
      claims,
    });
    stats.articles.upserted++;
  }

  stats.sources.upserted = sourcesByUrl.size;
  return { planArticles, sourcesByUrl, stats };
}

/* ---- SQL emit (used to apply via the management API when no service key is local) ---- */
const q = (s) => (s == null || s === "" ? "NULL" : "'" + String(s).replace(/'/g, "''") + "'");

function emitSql(plan, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const { planArticles, sourcesByUrl } = plan;

  // sources upsert
  const srcRows = [...sourcesByUrl.values()].map(
    (s) => `(${q(s.title)},${q(s.url)},${q(s.source_type)},true,${q(s.last_checked_at || s.accessed_at)})`,
  );
  const sourcesSql =
    srcRows.length === 0
      ? "-- no OA sources\n"
      : "INSERT INTO sources (title,url,source_type,is_oa,accessed_at) VALUES\n" +
        srcRows.join(",\n") +
        "\nON CONFLICT (url) DO UPDATE SET title=EXCLUDED.title, source_type=EXCLUDED.source_type;\n";
  fs.writeFileSync(path.join(dir, "01_sources.sql"), sourcesSql);

  // articles + claims + claim_sources, one DO block per article (idempotent)
  const blocks = planArticles.map((a) => {
    const claimStmts = a.claims
      .map((c) => {
        const ins = `  INSERT INTO claims(article_id,statement,confidence) VALUES (aid, ${q(c.statement)}, ${q(c.confidence)}) RETURNING id INTO cid;`;
        const link = c.linkUrls.length
          ? `\n  INSERT INTO claim_sources(claim_id,source_id) SELECT cid, s.id FROM sources s WHERE s.url IN (${c.linkUrls.map(q).join(",")}) ON CONFLICT DO NOTHING;`
          : "";
        return ins + link;
      })
      .join("\n");
    return `DO $$
DECLARE aid uuid; cid uuid;
BEGIN
  INSERT INTO articles(slug,title,vertical,published_at,last_checked_at,author,status,confidence_overall)
  VALUES (${q(a.slug)},${q(a.title)},${q(a.vertical)},${q(a.published_at)},${q(a.last_checked_at)},${q(a.author)},${q(a.status)},${q(a.confidence_overall)})
  ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, vertical=EXCLUDED.vertical, published_at=EXCLUDED.published_at,
    last_checked_at=EXCLUDED.last_checked_at, author=EXCLUDED.author, status=EXCLUDED.status, confidence_overall=EXCLUDED.confidence_overall
  RETURNING id INTO aid;
  DELETE FROM claims WHERE article_id = aid;
${claimStmts}
END $$;`;
  });
  fs.writeFileSync(path.join(dir, "02_articles_claims.sql"), blocks.join("\n\n"));
  console.log(`Emitted SQL to ${dir} (01_sources.sql, 02_articles_claims.sql)`);
}

/* ---- real DB write via supabase-js (CI / service role) ---- */
async function writeToDb(plan) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    console.error("Run with --dry-run to preview, or set the service-role key to write.");
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { planArticles, sourcesByUrl } = plan;

  // sources
  const srcRows = [...sourcesByUrl.values()].map((s) => ({
    title: s.title,
    url: s.url,
    source_type: s.source_type,
    is_oa: true,
    accessed_at: s.accessed_at,
  }));
  if (srcRows.length) {
    const { error } = await sb.from("sources").upsert(srcRows, { onConflict: "url" });
    if (error) throw new Error(`sources upsert: ${error.message}`);
  }
  // url -> source id
  const { data: srcRowsDb } = await sb.from("sources").select("id,url");
  const idByUrl = new Map((srcRowsDb || []).map((r) => [r.url, r.id]));

  for (const a of planArticles) {
    const { data: art, error: aerr } = await sb
      .from("articles")
      .upsert(
        {
          slug: a.slug,
          title: a.title,
          vertical: a.vertical,
          published_at: a.published_at,
          last_checked_at: a.last_checked_at,
          author: a.author,
          status: a.status,
          confidence_overall: a.confidence_overall,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (aerr) throw new Error(`article ${a.slug}: ${aerr.message}`);
    await sb.from("claims").delete().eq("article_id", art.id);
    for (const c of a.claims) {
      const { data: claim, error: cerr } = await sb
        .from("claims")
        .insert({ article_id: art.id, statement: c.statement, confidence: c.confidence })
        .select("id")
        .single();
      if (cerr) throw new Error(`claim for ${a.slug}: ${cerr.message}`);
      const links = c.linkUrls.map((u) => idByUrl.get(u)).filter(Boolean).map((sid) => ({ claim_id: claim.id, source_id: sid }));
      if (links.length) await sb.from("claim_sources").upsert(links, { onConflict: "claim_id,source_id" });
    }
  }
}

async function main() {
  const plan = buildSyncPlan();
  if (EMIT_DIR) emitSql(plan, EMIT_DIR);
  else if (!DRY_RUN) await writeToDb(plan);
  printReport(plan.stats);
  if (DRY_RUN) console.log("Dry run only. Re-run without --dry-run (with service key) to write.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
