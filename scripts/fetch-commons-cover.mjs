#!/usr/bin/env node
/**
 * Finds a genuinely displayable image on Wikimedia Commons for a subject,
 * verifies its license is public domain / CC0 / CC BY / CC BY-SA, downloads a
 * reasonably sized copy locally, and prints a cover metadata record.
 *
 * It NEVER accepts unclear / all-rights-reserved / non-free / fair-use files.
 *
 * Usage: node scripts/fetch-commons-cover.mjs <slug> "<search query>" [outDir]
 */
import fs from "node:fs";
import path from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "NaLI-by-NatIve-research/0.1 (open editorial journal; contact halo@nali.native.id)";

const ACCEPT = [
  /^cc0/i,
  /^cc-by(-sa)?-/i,
  /public domain/i,
  /^pd-/i,
  /^cc-pd/i,
];
const REJECT = /all rights reserved|fair use|non-free|nonfree|noncommercial|nc-|nd-|copyright/i;

function licenseOk(short, code, usage) {
  const s = `${short ?? ""} ${code ?? ""}`.trim();
  if (!s) return false;
  if (REJECT.test(s)) return false;
  if (/^cc-by-nc|^cc-by-nd|-nc-|-nd-/i.test(code ?? "")) return false;
  return ACCEPT.some((re) => re.test(short ?? "") || re.test(code ?? ""));
}

function strip(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function main() {
  const [slug, query, outDir = "public/images/jurnal-covers"] = process.argv.slice(2);
  if (!slug || !query) {
    console.error('usage: fetch-commons-cover.mjs <slug> "<query>" [outDir]');
    process.exit(2);
  }

  const data = await api({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1100",
  });

  const pages = Object.values(data?.query?.pages ?? {});
  const candidates = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue;
    if ((ii.width ?? 0) < 480) continue;
    const m = ii.extmetadata ?? {};
    const short = m.LicenseShortName?.value;
    const code = m.License?.value;
    if (!licenseOk(short, code, m.UsageTerms?.value)) continue;
    candidates.push({
      title: p.title,
      pageUrl: ii.descriptionurl,
      thumb: ii.thumburl ?? ii.url,
      width: ii.width,
      license: strip(short),
      licenseCode: code,
      licenseUrl: m.LicenseUrl?.value,
      artist: strip(m.Artist?.value) || strip(m.Credit?.value),
      credit: strip(m.Credit?.value),
      desc: strip(m.ImageDescription?.value).slice(0, 200),
      isPd: /public domain|^pd-|^cc0/i.test(`${short} ${code}`),
    });
  }

  // prefer public domain / cc0, then by width
  candidates.sort((a, b) => Number(b.isPd) - Number(a.isPd) || b.width - a.width);
  const pick = candidates[0];
  if (!pick) {
    console.log(JSON.stringify({ slug, query, found: false, reason: "no license-clear candidate" }, null, 2));
    process.exit(0);
  }

  const ext = pick.thumb.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const outPath = path.join(outDir, `${slug}.${ext}`);
  const img = await fetch(pick.thumb, { headers: { "user-agent": UA } });
  if (!img.ok) {
    console.log(JSON.stringify({ slug, query, found: false, reason: `download ${img.status}`, pick }, null, 2));
    process.exit(0);
  }
  const buf = Buffer.from(await img.arrayBuffer());
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, buf);

  console.log(
    JSON.stringify(
      {
        slug,
        found: true,
        localPath: `/${path.relative("public", outPath)}`,
        bytes: buf.length,
        title: pick.title,
        pageUrl: pick.pageUrl,
        license: pick.license,
        licenseCode: pick.licenseCode,
        licenseUrl: pick.licenseUrl,
        artist: pick.artist || "Wikimedia Commons contributor",
        desc: pick.desc,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
