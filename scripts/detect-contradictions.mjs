/**
 * Contradiction detector (Bucket B, Step 2.1).
 *
 * Reads every article's authored claimLedger, embeds each claim, finds
 * high-similarity claim pairs ACROSS different articles, asks Gemini to
 * adjudicate whether each pair genuinely contradicts, and writes the
 * CONTRADICT pairs into Supabase as status='candidate' for human review.
 *
 * Nothing here publishes anything: similarity is not proof. A human flips a
 * candidate to 'confirmed' in /admin before it ever reaches a reader.
 *
 * Run:
 *   node --env-file=.env.local scripts/detect-contradictions.mjs
 *   node --env-file=.env.local scripts/detect-contradictions.mjs --dry-run
 *   node --env-file=.env.local scripts/detect-contradictions.mjs --threshold 0.84 --max 150
 *
 * Env:
 *   GOOGLE_GENERATIVE_AI_API_KEY  (required: embeddings + adjudication)
 *   NEXT_PUBLIC_SUPABASE_URL      (required unless --dry-run)
 *   SUPABASE_SERVICE_ROLE_KEY     (required unless --dry-run; bypasses RLS)
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

/* ------------------------------- config ---------------------------------- */

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
// Keep in step with lib/embeddings.ts (single embedding model across the repo).
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMS = 768;
const GEN_MODEL = "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const THRESHOLD = numArg("--threshold", 0.82);
const MAX_ADJUDICATIONS = numArg("--max", 200);

function numArg(flag, fallback) {
  const i = args.indexOf(flag);
  if (i === -1 || i + 1 >= args.length) return fallback;
  const v = Number(args[i + 1]);
  return Number.isFinite(v) ? v : fallback;
}

const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GEMINI_KEY) {
  console.error(
    "Missing GOOGLE_GENERATIVE_AI_API_KEY. Set it in .env.local and run with --env-file=.env.local.",
  );
  process.exit(1);
}

/* --------------------------- load claims ---------------------------------- */

/** Collect every authored claim across published articles. */
function loadClaims() {
  const claims = [];
  if (!fs.existsSync(ARTICLES_DIR)) return claims;
  for (const file of fs.readdirSync(ARTICLES_DIR)) {
    if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data } = matter(raw);
    if (data.status && data.status !== "published") continue;
    if (!Array.isArray(data.claimLedger)) continue;
    const slug = data.slug ?? file.replace(/\.mdx?$/, "");
    const topics = new Set([...(data.tags ?? []), ...(data.series ?? [])]);
    for (const item of data.claimLedger) {
      if (!item?.claim) continue;
      claims.push({
        slug,
        title: data.title ?? slug,
        text: String(item.claim).trim(),
        status: String(item.status ?? "tidak dicatat"),
        topics,
      });
    }
  }
  return claims;
}

/* --------------------------- embeddings ----------------------------------- */

async function embed(text) {
  const res = await fetch(`${API_BASE}/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMS,
    }),
  });
  if (!res.ok) throw new Error(`Embedding API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values;
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function topicOverlap(a, b) {
  for (const t of a.topics) if (b.topics.has(t)) return true;
  return false;
}

/* --------------------------- adjudication --------------------------------- */

/** Ask Gemini whether two claims genuinely contradict. */
async function adjudicate(a, b) {
  const prompt = `Kamu menilai apakah dua klaim faktual SALING BERTENTANGAN.

Klaim A (dari "${a.title}"): "${a.text}"
Klaim B (dari "${b.title}"): "${b.text}"

Jawab HANYA dalam JSON: {"verdict":"CONTRADICT|AGREE|UNRELATED","rationale":"satu kalimat singkat"}.
- CONTRADICT: keduanya membahas hal yang sama tetapi tidak bisa sama-sama benar.
- AGREE: sejalan atau saling menguatkan.
- UNRELATED: membahas hal berbeda.`;

  const res = await fetch(`${API_BASE}/${GEN_MODEL}:generateContent?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`GenAI API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return { verdict: parsed.verdict ?? "UNRELATED", rationale: parsed.rationale ?? "" };
  } catch {
    return { verdict: "UNRELATED", rationale: "" };
  }
}

/* ------------------------------- main ------------------------------------- */

async function main() {
  const claims = loadClaims();
  console.log(`Loaded ${claims.length} claims from articles.`);
  if (claims.length < 2) {
    console.log("Not enough claims to compare.");
    return;
  }

  console.log("Embedding claims...");
  const vectors = [];
  for (const c of claims) vectors.push(await embed(c.text));

  // High-similarity cross-article candidate pairs, topical pairs first.
  const candidates = [];
  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      if (claims[i].slug === claims[j].slug) continue;
      const sim = cosine(vectors[i], vectors[j]);
      if (sim < THRESHOLD) continue;
      candidates.push({ i, j, sim, shared: topicOverlap(claims[i], claims[j]) });
    }
  }
  candidates.sort((x, y) => Number(y.shared) - Number(x.shared) || y.sim - x.sim);
  console.log(`Found ${candidates.length} high-similarity pairs (threshold ${THRESHOLD}).`);

  const toAdjudicate = candidates.slice(0, MAX_ADJUDICATIONS);
  const confirmed = [];
  for (const cand of toAdjudicate) {
    const a = claims[cand.i];
    const b = claims[cand.j];
    const { verdict, rationale } = await adjudicate(a, b);
    if (verdict !== "CONTRADICT") continue;
    // canonical order: lower (slug,text) is A, so re-runs dedupe deterministically
    const [first, second] =
      `${a.slug}|${a.text}` <= `${b.slug}|${b.text}` ? [a, b] : [b, a];
    confirmed.push({
      claim_a_article_slug: first.slug,
      claim_a_text: first.text,
      claim_a_status: first.status,
      claim_b_article_slug: second.slug,
      claim_b_text: second.text,
      claim_b_status: second.status,
      similarity: Number(cand.sim.toFixed(4)),
      llm_verdict: "CONTRADICT",
      llm_rationale: rationale,
      status: "candidate",
    });
  }

  console.log(`Adjudicated ${toAdjudicate.length} pairs -> ${confirmed.length} CONTRADICT candidate(s).`);

  if (DRY_RUN) {
    for (const c of confirmed) {
      console.log(
        `\n[${c.similarity}] ${c.claim_a_article_slug} <> ${c.claim_b_article_slug}\n  A: ${c.claim_a_text}\n  B: ${c.claim_b_text}\n  why: ${c.llm_rationale}`,
      );
    }
    console.log(`\n--dry-run: nothing written. ${confirmed.length} candidate(s) would be upserted.`);
    return;
  }

  if (confirmed.length === 0) {
    console.log("No candidates to write.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (service role, founder infra). Use --dry-run to skip writes.",
    );
    process.exit(1);
  }
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  // ignoreDuplicates: never clobber a row a human already reviewed.
  const { error, count } = await sb
    .from("contradictions")
    .upsert(confirmed, {
      onConflict: "claim_a_article_slug,claim_a_text,claim_b_article_slug,claim_b_text",
      ignoreDuplicates: true,
      count: "exact",
    });
  if (error) {
    console.error("Write failed:", error.message);
    process.exit(1);
  }
  console.log(`Wrote ${count ?? confirmed.length} new candidate(s) (existing reviewed rows untouched).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
