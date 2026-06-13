import fs from "node:fs";
import path from "node:path";

const CATALOG_PATH = path.join(process.cwd(), "components", "PublicationCatalog.tsx");
const DETAIL_PATH = path.join(process.cwd(), "app", "jurnal", "[slug]", "page.tsx");

async function main() {
  console.log("Checking accessibility compliance...");
  let failed = false;

  // 1. Audit PublicationCatalog.tsx
  if (fs.existsSync(CATALOG_PATH)) {
    console.log("Auditing PublicationCatalog.tsx...");
    const content = fs.readFileSync(CATALOG_PATH, "utf8");

    // Check that search inputs have labels
    if (!content.includes('id="search-input"') || !content.includes('htmlFor="search-input"')) {
      console.error("[ERROR] PublicationCatalog: Search input or label is missing htmlFor/id association.");
      failed = true;
    }
    if (!content.includes('id="sort-select"') || !content.includes('htmlFor="sort-select"')) {
      console.error("[ERROR] PublicationCatalog: Sort select or label is missing htmlFor/id association.");
      failed = true;
    }

    // Check focus ring classes are used
    if (!content.includes("focus-visible:ring-")) {
      console.error("[ERROR] PublicationCatalog: No focus-visible ring styles found.");
      failed = true;
    }

    // Check ARIA usage in catalog
    if (!content.includes("aria-expanded") || !content.includes("aria-label") || !content.includes("role=\"dialog\"")) {
      console.error("[ERROR] PublicationCatalog: ARIA attributes (aria-expanded, aria-label, role=\"dialog\") are missing or incomplete.");
      failed = true;
    }
  } else {
    console.error(`[ERROR] File missing: ${CATALOG_PATH}`);
    failed = true;
  }

  // 2. Audit app/jurnal/[slug]/page.tsx (Detail Page)
  if (fs.existsSync(DETAIL_PATH)) {
    console.log("Auditing app/jurnal/[slug]/page.tsx...");
    const content = fs.readFileSync(DETAIL_PATH, "utf8");

    // Check that it contains a definition list <dl>
    if (!content.includes("<dl") || !content.includes("</dl>")) {
      console.error("[ERROR] Detail Page: <dl> definition list wrapper is missing.");
      failed = true;
    }

    // Check that <dt> and <dd> elements are used inside the definition list
    if (!content.includes("<dt") || !content.includes("<dd")) {
      console.error("[ERROR] Detail Page: <dt> or <dd> definition list elements are missing.");
      failed = true;
    }

    // Check focus ring styles in detail page
    if (!content.includes("focus-visible:ring-")) {
      console.error("[ERROR] Detail Page: No focus-visible ring styles found.");
      failed = true;
    }
  } else {
    console.error(`[ERROR] File missing: ${DETAIL_PATH}`);
    failed = true;
  }

  if (failed) {
    console.error("Accessibility check FAILED.");
    process.exit(1);
  } else {
    console.log("Accessibility check PASSED.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
