import { mkdir } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { chromium } from "playwright";
import type { JournalArticle } from "./journalArticleTemplate";
import { buildJournalHtml } from "./journalHtmlTemplate";

function isInside(parent: string, target: string) {
  const rel = relative(parent, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

export function validateJournalPdfOutputPath(outputPath: string) {
  const resolved = resolve(outputPath);
  const allowedDownloads = resolve(homedir(), "Downloads", "NaLI-QA");
  const allowedTmp = [resolve(tmpdir(), "nali-qa"), resolve("/tmp", "nali-qa")];

  if (extname(resolved).toLowerCase() !== ".pdf") {
    throw new Error("Founder/admin journal PDF output must use a .pdf filename.");
  }

  if (!isInside(allowedDownloads, resolved) && !allowedTmp.some((directory) => isInside(directory, resolved))) {
    throw new Error("Founder/admin journal PDFs may only be written to ~/Downloads/NaLI-QA or /tmp/nali-qa.");
  }

  return resolved;
}

export async function renderJournalPdfFromHtml(article: JournalArticle, outputPath: string) {
  const resolvedOutputPath = validateJournalPdfOutputPath(outputPath);
  await mkdir(dirname(resolvedOutputPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route("**/*", (route) => route.abort());
    await page.setContent(buildJournalHtml(article), { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: resolvedOutputPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="box-sizing:border-box;color:#627067;font-family:Arial,sans-serif;font-size:8px;letter-spacing:.11em;padding:6mm 15mm 0;text-transform:uppercase;width:100%;">NaLI Nature &amp; Evidence Journal <span style="float:right">Founder/Admin Draft Series</span></div>`,
      footerTemplate: `<div style="box-sizing:border-box;border-top:1px solid #d6d0c3;color:#627067;font-family:Arial,sans-serif;font-size:8px;margin:0 15mm;padding-top:2mm;text-align:right;width:calc(100% - 30mm);">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
  } finally {
    await browser.close();
  }

  return resolvedOutputPath;
}
