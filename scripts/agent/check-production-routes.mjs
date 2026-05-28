const BASE_URL = process.env.NALI_PROD_URL || process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";

const routes = [
  { path: "/", contentType: "text/html" },
  { path: "/create-report", contentType: "text/html" },
  { path: "/login", contentType: "text/html" },
  { path: "/register", contentType: "text/html" },
  { path: "/pricing", contentType: "text/html" },
  { path: "/learn-report", contentType: "text/html" },
  { path: "/field-notes", contentType: "text/html" },
  { path: "/robots.txt", contentType: "text/plain" },
  { path: "/sitemap.xml", contentType: "xml" },
  { path: "/opengraph-image", contentType: "image" },
  { path: "/twitter-image", contentType: "image" },
];

console.log("=========================================");
console.log(`  NaLI Production Routes Smoke (Base: ${BASE_URL})`);
console.log("=========================================");

let failed = false;

async function checkRoute(route) {
  const url = `${BASE_URL.replace(/\/$/, "")}${route.path}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "NaLI-Agent-Smoke-Tester" } });
    const contentType = res.headers.get("content-type") || "";

    const statusOk = res.ok || res.status === 307 || res.status === 308 || res.status === 302;
    const typeOk = contentType.includes(route.contentType) || 
                   (route.contentType === "xml" && (contentType.includes("xml") || contentType.includes("application/xml"))) ||
                   (route.contentType === "image" && contentType.includes("image"));

    if (statusOk && typeOk) {
      console.log(`[PASS] ${route.path.padEnd(20)} HTTP ${res.status} (${contentType.split(";")[0]})`);
    } else {
      console.log(`[FAIL] ${route.path.padEnd(20)} HTTP ${res.status} (${contentType.split(";")[0]} - Expected ${route.contentType})`);
      failed = true;
    }
  } catch (err) {
    console.log(`[FAIL] ${route.path.padEnd(20)} Error: ${err.message}`);
    failed = true;
  }
}

async function run() {
  for (const r of routes) {
    await checkRoute(r);
  }
  console.log("=========================================");
  if (failed) {
    console.log("Smoke Test Result: FAILED");
    console.log("=========================================");
    process.exit(1);
  } else {
    console.log("Smoke Test Result: PASSED");
    console.log("=========================================");
    process.exit(0);
  }
}

run();
