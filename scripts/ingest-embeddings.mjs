#!/usr/bin/env node

/**
 * Ingest markdown content into Supabase pgvector embeddings.
 *
 * Usage:
 *   GOOGLE_GENERATIVE_AI_API_KEY=... \
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *   node scripts/ingest-embeddings.mjs
 *
 * Or with dotenv loaded via .env.local:
 *   node --env-file=.env.local scripts/ingest-embeddings.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

/* -------------------------------- Config ---------------------------------- */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GOOGLE_GENERATIVE_AI_API_KEY",
  );
  process.exit(1);
}

// NOTE: content_embeddings has RLS that only allows anon SELECT, so writes need
// a privileged key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY to a service-role key for
// this ingest run (it is server-side only and never shipped to the browser).
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const CONTENT_DIR = path.join(process.cwd(), "content");
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_API = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBEDDING_DIMS = 768; // must match content_embeddings.embedding vector(768)

/* ------------------------------- Helpers ---------------------------------- */

/** Read all .mdx/.md files from a directory. */
function readMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => ({
      slug: f.replace(/\.mdx?$/, ""),
      raw: fs.readFileSync(path.join(dir, f), "utf8"),
    }));
}

/** Split text into overlapping chunks at paragraph boundaries. */
function chunkText(text, maxChars = 2000, overlapChars = 200) {
  const cleaned = text
    .replace(/^---[\s\S]*?---\n/m, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= maxChars) return [cleaned];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + maxChars;

    if (end < cleaned.length) {
      const paraBreak = cleaned.lastIndexOf("\n\n", end);
      if (paraBreak > start + maxChars * 0.5) {
        end = paraBreak;
      } else {
        const sentBreak = cleaned.lastIndexOf(". ", end);
        if (sentBreak > start + maxChars * 0.5) end = sentBreak + 1;
      }
    } else {
      end = cleaned.length;
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - overlapChars;

    if (cleaned.length - start < overlapChars * 2) {
      if (start < cleaned.length) chunks.push(cleaned.slice(start).trim());
      break;
    }
  }

  return chunks.filter((c) => c.length > 50);
}

/** Generate embedding via Gemini REST API. */
async function embed(text) {
  const res = await fetch(
    `${EMBEDDING_API}/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMS,
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

/** Sleep helper for rate limiting. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------- Main ----------------------------------- */

async function main() {
  console.log("\n📚 NaLI Embedding Ingestion\n");

  // Gather all content
  const articles = readMdxFiles(path.join(CONTENT_DIR, "articles")).map((f) => {
    const { data, content } = matter(f.raw);
    return {
      slug: f.slug,
      category: "artikel",
      title: data.title ?? f.slug,
      content,
      metadata: {
        tags: data.tags ?? [],
        summary: data.summary ?? "",
        category: data.category ?? "alam",
        date: data.date ?? "",
      },
    };
  });

  const sources = readMdxFiles(path.join(CONTENT_DIR, "sources")).map((f) => {
    const { data, content } = matter(f.raw);
    return {
      slug: f.slug,
      category: "sumber",
      title: data.title ?? f.slug,
      content,
      metadata: {
        type: data.type ?? data.sourceType ?? "lainnya",
        topics: data.topics ?? [],
        reliability: data.reliabilityLevel ?? "",
      },
    };
  });

  const allDocs = [...articles, ...sources];
  console.log(`Found ${articles.length} articles, ${sources.length} sources`);
  console.log(`Total documents: ${allDocs.length}\n`);

  let totalChunks = 0;
  let errors = 0;

  for (let i = 0; i < allDocs.length; i++) {
    const doc = allDocs[i];
    const chunks = chunkText(doc.content);
    const progress = `[${i + 1}/${allDocs.length}]`;

    console.log(
      `${progress} ${doc.category}/${doc.slug} → ${chunks.length} chunk(s)`,
    );

    for (let ci = 0; ci < chunks.length; ci++) {
      try {
        // Prepend title + metadata for richer embeddings
        const textToEmbed = `${doc.title}\n\n${chunks[ci]}`;
        const embedding = await embed(textToEmbed);

        const { error } = await supabase.from("content_embeddings").upsert(
          {
            slug: doc.slug,
            category: doc.category,
            title: doc.title,
            chunk_index: ci,
            content: chunks[ci],
            metadata: doc.metadata,
            embedding: JSON.stringify(embedding),
          },
          { onConflict: "slug,chunk_index" },
        );

        if (error) {
          console.error(`  ✗ chunk ${ci}: ${error.message}`);
          errors++;
        }

        totalChunks++;

        // Rate limit: 100ms between calls (~600 RPM, well under 1500 RPM limit)
        await sleep(100);
      } catch (err) {
        console.error(`  ✗ chunk ${ci}: ${err.message}`);
        errors++;
        await sleep(500); // back off on errors
      }
    }
  }

  console.log(`\n✅ Done. ${totalChunks} chunks ingested, ${errors} errors.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
