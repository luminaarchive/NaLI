#!/usr/bin/env node
/**
 * generate-graph (Doctrine v2.1, Part 3).
 *
 * Builds the evidence graph from the relational evidence layer (articles,
 * sources, claims, claim_sources, all public-read) plus topic/series tags read
 * from MDX, and writes public/graph-data.json. Run via `npm run graph:generate`
 * and chained after `sync:articles`.
 *
 * Reads use the public anon key (those tables are RLS public-read), so no
 * service-role key is needed. If Supabase is unreachable it writes an empty
 * graph rather than failing the pipeline.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "graph-data.json");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");

/* ---- env (process.env first, then a minimal .env.local fallback) ---- */
function loadEnv() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if ((!url || !key) && fs.existsSync(path.join(ROOT, ".env.local"))) {
    for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "NEXT_PUBLIC_SUPABASE_URL" && !url) url = v;
      if (m[1] === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && !key) key = v;
    }
  }
  return { url, key };
}

function writeEmpty(reason) {
  const empty = {
    nodes: [],
    edges: [],
    meta: { generatedAt: new Date().toISOString(), totalNodes: 0, totalEdges: 0, articleCount: 0, sourceCount: 0 },
  };
  fs.writeFileSync(OUT, JSON.stringify(empty));
  console.log(`generate-graph: wrote empty graph (${reason}).`);
}

function mdxTagsSeries() {
  const bySlug = new Map();
  if (!fs.existsSync(ARTICLES_DIR)) return bySlug;
  for (const f of fs.readdirSync(ARTICLES_DIR)) {
    if (!f.endsWith(".mdx")) continue;
    const { data } = matter(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
    bySlug.set(f.replace(/\.mdx$/, ""), {
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      series: Array.isArray(data.series) ? data.series.map(String) : [],
    });
  }
  return bySlug;
}

async function main() {
  const { url, key } = loadEnv();
  if (!url || !key) return writeEmpty("supabase env not set");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const [{ data: articles }, { data: sources }, { data: claims }, { data: links }] = await Promise.all([
    sb.from("articles").select("id,slug,title,vertical,confidence_overall"),
    sb.from("sources").select("id,url,title"),
    sb.from("claims").select("id,article_id"),
    sb.from("claim_sources").select("claim_id,source_id"),
  ]);
  if (!articles || !sources) return writeEmpty("could not read articles/sources");

  const artById = new Map(articles.map((a) => [a.id, a]));
  const claimToArticle = new Map((claims || []).map((c) => [c.id, c.article_id]));
  const srcById = new Map(sources.map((s) => [s.id, s]));
  const mdx = mdxTagsSeries();

  const nodes = new Map();
  const edges = [];
  const addNode = (n) => { if (!nodes.has(n.id)) nodes.set(n.id, n); };
  const addEdge = (source, target, type, weight) => edges.push({ source, target, type, weight });

  // vertical nodes
  for (const v of ["alam", "sejarah", "investigasi"]) addNode({ id: `vertical:${v}`, type: "vertical", label: v });

  // article nodes + vertical/series/topic edges
  const claimCountByArticle = new Map();
  for (const c of claims || []) claimCountByArticle.set(c.article_id, (claimCountByArticle.get(c.article_id) || 0) + 1);

  const seriesSeen = new Set();
  const topicSeen = new Set();
  for (const a of articles) {
    const id = `article:${a.slug}`;
    addNode({
      id, type: "article", label: a.title, slug: a.slug, vertical: a.vertical,
      confidence: a.confidence_overall, claimCount: claimCountByArticle.get(a.id) || 0, sourceCount: 0,
    });
    if (["alam", "sejarah", "investigasi"].includes(a.vertical)) addEdge(id, `vertical:${a.vertical}`, "article-in-vertical", 1);
    const meta = mdx.get(a.slug) || { tags: [], series: [] };
    for (const s of meta.series) {
      const sid = `series:${s}`;
      if (!seriesSeen.has(s)) { addNode({ id: sid, type: "series", label: s }); seriesSeen.add(s); }
      addEdge(id, sid, "article-in-series", 3);
    }
    for (const t of meta.tags) {
      const tid = `topic:${t}`;
      if (!topicSeen.has(t)) { addNode({ id: tid, type: "topic", label: t, articleCount: 0 }); topicSeen.add(t); }
      addEdge(id, tid, "article-has-topic", 2);
      nodes.get(tid).articleCount += 1;
    }
  }

  // source nodes (all OA sources in DB)
  for (const s of sources) addNode({ id: `source:${s.id}`, type: "source", label: s.title || s.url, articleCount: 0 });

  // article-cites-source edges (dedup per article+source) + shared-source clusters
  const citedPairs = new Set();
  const articlesBySource = new Map(); // source uuid -> Set(article slug)
  for (const l of links || []) {
    const artId = claimToArticle.get(l.claim_id);
    const a = artId ? artById.get(artId) : null;
    const s = srcById.get(l.source_id);
    if (!a || !s) continue;
    const key2 = `${a.slug}::${l.source_id}`;
    if (citedPairs.has(key2)) continue;
    citedPairs.add(key2);
    addEdge(`article:${a.slug}`, `source:${l.source_id}`, "article-cites-source", 1);
    const an = nodes.get(`article:${a.slug}`); if (an) an.sourceCount += 1;
    const sn = nodes.get(`source:${l.source_id}`); if (sn) sn.articleCount += 1;
    if (!articlesBySource.has(l.source_id)) articlesBySource.set(l.source_id, new Set());
    articlesBySource.get(l.source_id).add(a.slug);
  }

  // articles-share-source: connect articles that cite the same source, weight = shared count
  const sharePair = new Map(); // "slugA|slugB" -> count
  for (const set of articlesBySource.values()) {
    const arr = [...set].sort();
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++) {
        const k = `${arr[i]}|${arr[j]}`;
        sharePair.set(k, (sharePair.get(k) || 0) + 1);
      }
  }
  for (const [k, count] of sharePair) {
    const [x, y] = k.split("|");
    addEdge(`article:${x}`, `article:${y}`, "articles-share-source", count);
  }

  const nodeArr = [...nodes.values()];
  const graph = {
    nodes: nodeArr,
    edges,
    meta: {
      generatedAt: new Date().toISOString(),
      totalNodes: nodeArr.length,
      totalEdges: edges.length,
      articleCount: articles.length,
      sourceCount: sources.length,
    },
  };
  fs.writeFileSync(OUT, JSON.stringify(graph));
  const byType = nodeArr.reduce((m, n) => ((m[n.type] = (m[n.type] || 0) + 1), m), {});
  console.log(
    `generate-graph: ${graph.meta.totalNodes} nodes (` +
      Object.entries(byType).map(([t, c]) => `${t}:${c}`).join(", ") +
      `), ${graph.meta.totalEdges} edges -> public/graph-data.json`,
  );
}

main().catch((e) => { console.error(e); writeEmpty("error: " + e.message); });
