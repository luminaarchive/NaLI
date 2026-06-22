#!/usr/bin/env node
/**
 * Report printer for the MDX -> DB sync pipeline (Part 1).
 * Imported by sync-articles.mjs and run automatically at the end of a sync.
 * Can also be run standalone to print the last collected stats from stdin.
 */

export function printReport(stats) {
  const line = "-".repeat(56);
  console.log("\n" + line);
  console.log("  MDX -> DB SYNC REPORT" + (stats.dryRun ? "  (DRY RUN, no DB writes)" : ""));
  console.log(line);

  console.log(`  Articles processed : ${stats.articles.processed}`);
  console.log(`    inserted/updated : ${stats.articles.upserted}`);
  console.log(`    skipped          : ${stats.articles.skipped}`);
  for (const s of stats.articles.skipReasons) console.log(`      - ${s}`);

  console.log(`  Sources            : ${stats.sources.upserted} upserted (OA only)`);
  console.log(`    skipped no url   : ${stats.sources.skippedNoUrl}`);
  console.log(`    skipped not OA   : ${stats.sources.skippedNotOa}`);
  console.log(`    skipped buku     : ${stats.sources.skippedBuku}`);

  console.log(`  Claims             : ${stats.claims.upserted} upserted`);
  console.log(`  Claim-source links : ${stats.claimSources.created} created`);
  console.log(`    links skipped    : ${stats.claimSources.skipped} (pointer to a non-OA / urlless source)`);

  if (stats.warnings.length) {
    console.log(`  Warnings           : ${stats.warnings.length}`);
    for (const w of stats.warnings) console.log(`      ! ${w}`);
  } else {
    console.log(`  Warnings           : 0`);
  }
  console.log(line + "\n");
}

// Standalone: read a JSON stats blob from argv[2] file path.
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import("node:fs");
  const p = process.argv[2];
  if (p && fs.existsSync(p)) printReport(JSON.parse(fs.readFileSync(p, "utf8")));
  else console.log("Usage: node scripts/sync-articles-report.mjs <stats.json>");
}
