#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadPublications } from "./load-publications.mjs";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "content", "jurnal", "pub-covers.json");
const AUDIT_FILE = path.join(ROOT, "docs", "jurnal_cover_audit.md");

async function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error("Manifest pub-covers.json not found!");
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const pubs = await loadPublications();
  
  let md = `# NaLI Jurnal Cover Audit Report\n\n`;
  md += `This document lists the cover visual status and licensing compliance for every publication in the NaLI Jurnal catalog.\n\n`;
  md += `| Slug | Publication Title | Cover Type | Official Cover | PDF Preview | Repository Preview | Commons | Fallback | Reason | License Notes |\n`;
  md += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |\n`;
  
  for (const pub of pubs) {
    const cover = manifest[pub.slug] || {};
    const type = cover.coverType || "unknown";
    
    let official = "❌";
    let pdf = "❌";
    let repo = "❌";
    let commons = "❌";
    let fallback = "❌";
    
    if (type === "pdf_preview") {
      pdf = "✅";
      official = "✅"; // PDF is official
    } else if (type === "commons_subject") {
      commons = "✅";
    } else if (type === "source_card") {
      fallback = "✅";
    }
    
    // For repository hosted files (like Zenodo/pure.uva.nl)
    if (pub.pdfUrl && (pub.pdfUrl.includes("zenodo") || pub.pdfUrl.includes("pure.uva") || pub.pdfUrl.includes("researchonline"))) {
      if (type === "pdf_preview") {
        repo = "✅";
        pdf = "✅";
      }
    }
    
    const reason = cover.fallbackReason || "-";
    const license = cover.license || "-";
    
    // Escape pipes in titles
    const cleanTitle = pub.title.replace(/\|/g, "\\|");
    
    md += `| \`${pub.slug}\` | ${cleanTitle} | \`${type}\` | ${official} | ${pdf} | ${repo} | ${commons} | ${fallback} | ${reason} | ${license} |\n`;
  }
  
  fs.writeFileSync(AUDIT_FILE, md + "\n");
  console.log(`Cover audit generated at: ${AUDIT_FILE}`);
}

main().catch(console.error);
