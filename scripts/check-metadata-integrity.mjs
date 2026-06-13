import fs from "node:fs";
import path from "node:path";
import { loadPublications } from "./load-publications.mjs";

const OFFICIAL_METADATA_PATH = path.join(process.cwd(), "content", "jurnal", "official-metadata.json");

async function main() {
  console.log("Checking metadata integrity...");
  if (!fs.existsSync(OFFICIAL_METADATA_PATH)) {
    console.error(`Error: ${OFFICIAL_METADATA_PATH} does not exist.`);
    process.exit(1);
  }

  const officialMetadata = JSON.parse(fs.readFileSync(OFFICIAL_METADATA_PATH, "utf8"));
  const pubs = await loadPublications();

  let failed = false;

  for (const pub of pubs) {
    const official = officialMetadata[pub.slug];
    if (!official) {
      console.warn(`[WARNING] No official metadata entry found for slug: ${pub.slug}`);
      // If no official metadata, make sure none of the fields are populated with mock data.
      const forbiddenFields = ["volume", "issue", "pages", "license", "peerReviewed"];
      for (const field of forbiddenFields) {
        if (pub[field] !== undefined && pub[field] !== null) {
          console.error(`[ERROR] Slug ${pub.slug} has value for '${field}' but is not in official-metadata.json. Value: ${pub[field]}`);
          failed = true;
        }
      }
      continue;
    }

    // Check volume
    const expectedVol = official.volume || undefined;
    const fieldsToCheck = ["volume", "issue", "pages", "license", "peerReviewed"];
    for (const field of fieldsToCheck) {
      if (pub[field] !== undefined && pub[field] !== null) {
        // If it's hardcoded in the raw file, it should match official-metadata.json exactly
        const expected = official[field] ?? undefined;
        if (pub[field] !== expected) {
          console.error(`[ERROR] Slug ${pub.slug} has hardcoded '${field}' with value '${pub[field]}', expected '${expected}' from official-metadata.json`);
          failed = true;
        }
      }
    }

    // Now let's simulate the resolution logic from lib/jurnal.ts:
    const resolved = {
      ...pub,
      volume: official.volume || undefined,
      issue: official.issue || undefined,
      pages: official.pages || undefined,
      license: official.license || undefined,
      peerReviewed: official.peerReviewed ?? undefined,
    };

    // Ensure resolved values contain no mocked/injected patterns (e.g. fabricated placeholder volume/issue values)
    const mockPatterns = [
      /\bmock\b/i,
      /\btest\b/i,
      /\btemp\b/i,
      /\bplaceholder\b/i,
      /\bunknown\b/i,
      /^[xX\s\-\/]+$/,
      /^[0\s\-\/]+$/
    ];

    for (const field of ["volume", "issue", "pages", "license"]) {
      const val = resolved[field];
      if (typeof val === "string") {
        for (const pattern of mockPatterns) {
          if (pattern.test(val)) {
            console.error(`[ERROR] Slug ${pub.slug} resolved field '${field}' has suspicious pattern matching ${pattern}: '${val}'`);
            failed = true;
          }
        }
      }
    }

    // fileSize check: must not be present (removed as per Phase 1 instructions)
    if (pub.fileSize !== undefined && pub.fileSize !== null) {
      console.error(`[ERROR] Slug ${pub.slug} contains 'fileSize' property in raw publication object: ${pub.fileSize}`);
      failed = true;
    }
    if (resolved.fileSize !== undefined && resolved.fileSize !== null) {
      console.error(`[ERROR] Slug ${pub.slug} contains resolved 'fileSize' property: ${resolved.fileSize}`);
      failed = true;
    }
  }

  if (failed) {
    console.error("Metadata integrity check FAILED.");
    process.exit(1);
  } else {
    console.log("Metadata integrity check PASSED.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
