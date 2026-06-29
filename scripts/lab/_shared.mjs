#!/usr/bin/env node
/**
 * Shared utilities for the Internal Intelligence Lab harvesters (Bucket C, Step 3.2).
 *
 * Design contract (read this before editing):
 *   - Harvesters are READ-ONLY against external APIs and write ONLY to
 *     content/lab-raw/ (gitignored). They need no credentials.
 *   - The ONLY privileged, mutating step is build-leads.mjs, which reads those
 *     local dumps and upserts into Supabase lab_leads using the service-role key.
 *   - NOTHING here invents data. Every field written to a dump comes verbatim
 *     from a provider response. Records that lack the facts we need are skipped,
 *     never fabricated.
 *
 * A Lab "lead" is a taxon with a suspicious silence: known to science, often
 * threat-flagged, with a long gap since its last credible open record. The gap
 * is a reason for a human to look, NOT a claim the species survives.
 */
import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const RAW_DIR = path.join(ROOT, "content", "lab-raw");
export const MAILTO = "ansyahridarmatrijati@gmail.com";
// Real, identifying User-Agent with contact, as GBIF + iNaturalist request.
export const UA = "NaLI-research/1.0 (Lab harvester; ansyahridarmatrijati@gmail.com)";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Read an optional CLI flag value: arg("--max", "10"). */
export function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

/**
 * Fetch JSON with a real UA, 30s timeout, and exponential backoff on 429/5xx.
 * Returns null on a hard failure (caller decides whether to skip the taxon).
 * Extra headers (e.g. IUCN Authorization) can be passed in.
 */
export async function fetchJson(url, { tries = 4, headers = {} } = {}) {
  let delay = 800;
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      const r = await fetch(url, {
        headers: { "user-agent": UA, accept: "application/json", ...headers },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) {
        return { __error: r.status };
      }
      return await r.json();
    } catch (e) {
      if (i === tries - 1) {
        console.log(`    fetch failed: ${e.message}`);
        return null;
      }
      await sleep(delay);
      delay *= 2;
    }
  }
  return null;
}

/** Write one provider's distilled dump to content/lab-raw/<name>.json. */
export function writeDump(name, data) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const file = path.join(RAW_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

/** Read a dump back (build-leads.mjs uses this). Returns fallback if absent. */
export function readDump(name, fallback = null) {
  const file = path.join(RAW_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function rel(p) {
  return path.relative(ROOT, p);
}

/**
 * Lazily build a Supabase service-role client. Returns null (with a clear log)
 * when the key is absent, so the writer fails CLOSED rather than guessing.
 * Imported only by build-leads.mjs, never by a harvester.
 */
export async function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "build-leads writes to Supabase lab_leads and needs the service-role key\n" +
        "(founder infra). Set it in .env.local, then re-run. Harvesters do not need it.",
    );
    return null;
  }
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}
