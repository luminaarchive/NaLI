import { loadPublications } from "./load-publications.mjs";

const UA = "NaLI-by-NatIve-research/0.1 (open editorial journal)";

async function checkLink(url, label) {
  if (!url) return { ok: false, status: "Missing URL", label };
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });
    return { ok: res.ok, status: res.status, url, label };
  } catch (err) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        headers: { "User-Agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(5000)
      });
      return { ok: res.ok, status: `HEAD:${res.status}`, url, label };
    } catch (headErr) {
      return { ok: false, status: err.message || "Fetch failed", url, label };
    }
  }
}

async function main() {
  console.log("Loading publications...");
  const pubs = await loadPublications();
  console.log(`Loaded ${pubs.length} publications. Checking links...\n`);

  for (const pub of pubs) {
    console.log(`Checking [${pub.slug}]...`);
    const sourceRes = await checkLink(pub.sourceUrl, "Source/DOI");
    console.log(`  Source/DOI: ${sourceRes.ok ? "OK" : "FAILED"} (${sourceRes.status}) -> ${pub.sourceUrl}`);
    
    if (pub.pdfUrl) {
      const pdfRes = await checkLink(pub.pdfUrl, "PDF");
      console.log(`  PDF Link:   ${pdfRes.ok ? "OK" : "FAILED"} (${pdfRes.status}) -> ${pub.pdfUrl}`);
    } else {
      console.log(`  PDF Link:   None`);
    }
    console.log("-".repeat(50));
  }
}

main().catch(console.error);
