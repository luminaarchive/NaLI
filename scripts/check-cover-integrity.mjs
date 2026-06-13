import fs from "node:fs";
import path from "node:path";

const COVERS_PATH = path.join(process.cwd(), "content", "jurnal", "pub-covers.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function isValidIsoDate(str) {
  if (typeof str !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

async function main() {
  console.log("Checking cover integrity...");
  if (!fs.existsSync(COVERS_PATH)) {
    console.error(`Error: ${COVERS_PATH} does not exist.`);
    process.exit(1);
  }

  const covers = JSON.parse(fs.readFileSync(COVERS_PATH, "utf8"));
  let failed = false;

  for (const [slug, cover] of Object.entries(covers)) {
    console.log(`Checking cover for slug: [${slug}]...`);

    // 1. Verify cover source (sourceUrl)
    if (!cover.sourceUrl || typeof cover.sourceUrl !== "string" || !cover.sourceUrl.startsWith("http")) {
      console.error(`[ERROR] Slug ${slug}: 'sourceUrl' (cover source) is missing or invalid: ${cover.sourceUrl}`);
      failed = true;
    }

    // 2. Verify cover type (coverType)
    if (!cover.coverType || typeof cover.coverType !== "string") {
      console.error(`[ERROR] Slug ${slug}: 'coverType' is missing or not a string`);
      failed = true;
    }

    // 3. Verify cover license (license)
    if (!cover.license || typeof cover.license !== "string") {
      console.error(`[ERROR] Slug ${slug}: 'license' (cover license) is missing or not a string`);
      failed = true;
    }

    // 4. Verify cover status (isRealSourceCover)
    if (typeof cover.isRealSourceCover !== "boolean") {
      console.error(`[ERROR] Slug ${slug}: 'isRealSourceCover' (cover status) is missing or not a boolean`);
      failed = true;
    }

    // 5. Verify last verified date (checkedAt)
    if (!cover.checkedAt || !isValidIsoDate(cover.checkedAt)) {
      console.error(`[ERROR] Slug ${slug}: 'checkedAt' (last verified) is missing or not a valid YYYY-MM-DD date: ${cover.checkedAt}`);
      failed = true;
    }

    // 6. Verify cover file exists on disk
    if (!cover.localPath || typeof cover.localPath !== "string") {
      console.error(`[ERROR] Slug ${slug}: 'localPath' is missing or not a string`);
      failed = true;
    } else {
      const fullPath = path.join(PUBLIC_DIR, cover.localPath);
      if (!fs.existsSync(fullPath)) {
        console.error(`[ERROR] Slug ${slug}: cover file does not exist on disk at ${cover.localPath} (resolved: ${fullPath})`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error("Cover integrity check FAILED.");
    process.exit(1);
  } else {
    console.log("Cover integrity check PASSED.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
