#!/usr/bin/env node
/**
 * emit-on-sync (Doctrine v2.1, Part 2, STEP 5).
 *
 * NaLI has no live article-edit hook (content is MDX), so alert events are
 * emitted here, right after `sync:articles`. For every active watch_alert, it
 * finds the articles it watches (by article slug, by series, or by topic/tag)
 * and emits an event when that article's `updated` date is newer than the most
 * recent event already recorded for that alert + article.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY (alert tables are RLS service-role only). No
 * key, or no active alerts -> it no-ops cleanly so the sync chain never breaks.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content", "articles");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("emit-on-sync: SUPABASE_SERVICE_ROLE_KEY not set, skipping (no events emitted).");
  process.exit(0);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: data.title || f,
        updated: data.updated || data.date || null,
        series: Array.isArray(data.series) ? data.series.map(String) : [],
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      };
    });
}

function matchArticles(alert, articles) {
  if (alert.article_slug) return articles.filter((a) => a.slug === alert.article_slug);
  if (alert.series_id) return articles.filter((a) => a.series.includes(alert.series_id));
  if (alert.topic_slug) return articles.filter((a) => a.tags.includes(alert.topic_slug));
  return [];
}

async function main() {
  const { data: alerts, error } = await sb
    .from("watch_alerts")
    .select("*")
    .eq("is_active", true);
  if (error) {
    console.log(`emit-on-sync: could not read watch_alerts (${error.message}), skipping.`);
    process.exit(0);
  }
  if (!alerts || alerts.length === 0) {
    console.log("emit-on-sync: no active alerts, nothing to emit.");
    process.exit(0);
  }

  const articles = loadArticles();
  let emitted = 0;

  for (const alert of alerts) {
    const matches = matchArticles(alert, articles);
    for (const a of matches) {
      if (!a.updated) continue;
      // most recent event already recorded for this alert + article slug
      const { data: prev } = await sb
        .from("alert_events")
        .select("created_at,payload")
        .eq("alert_id", alert.id)
        .order("created_at", { ascending: false })
        .limit(50);
      const last = (prev || []).find((e) => e.payload && e.payload.slug === a.slug);
      const updatedMs = new Date(a.updated).getTime();
      const lastMs = last ? new Date(last.created_at).getTime() : 0;
      if (last && updatedMs <= lastMs) continue; // nothing newer

      const { error: insErr } = await sb.from("alert_events").insert({
        alert_id: alert.id,
        trigger_type: alert.trigger_type,
        payload: { slug: a.slug, title: a.title, updated: a.updated, via: "sync" },
        seen: false,
      });
      if (!insErr) emitted++;
    }
  }

  console.log(`emit-on-sync: ${emitted} event(s) emitted across ${alerts.length} active alert(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
