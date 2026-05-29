import { env, argv } from "process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { classifyOpenRouterResponse } = require("./openrouter-classifier.cjs");

const DEFAULT_CANDIDATES = [
  "google/gemini-2.0-flash-001",
  "google/gemini-2.5-flash",
  "deepseek/deepseek-chat",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
];

async function run() {
  const apiKey = env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Error: OPENROUTER_API_KEY environment variable is not set.");
    process.exit(1);
  }

  // Parse arguments
  const args = argv.slice(2);
  const showAll = args.includes("--all");
  const cliModels = args.filter((arg) => !arg.startsWith("-"));

  let candidates = DEFAULT_CANDIDATES;

  if (env.NALI_MODEL_CANDIDATES) {
    candidates = env.NALI_MODEL_CANDIDATES.split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  } else if (cliModels.length > 0) {
    candidates = cliModels;
  }

  console.log("=========================================");
  console.log("      NaLI OpenRouter Model Readiness    ");
  console.log("=========================================");
  console.log(`Probing ${candidates.length} candidate models...`);

  const results = [];
  let foundUsable = false;

  for (const model of candidates) {
    if (foundUsable && !showAll) {
      break;
    }

    console.log(`- Testing ${model}...`);
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        body: JSON.stringify({
          messages: [
            { content: 'respond with a JSON containing the field "status" set to "ok". JSON only.', role: "user" },
          ],
          model,
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://naliai.vercel.app",
          "X-OpenRouter-Title": "NaLI Readiness Probe",
        },
        method: "POST",
        signal: controller.signal,
      });

      const duration = Date.now() - start;
      const status = response.status;
      const bodyText = await response.text();

      const classification = classifyOpenRouterResponse({ status, bodyText });

      results.push({
        model,
        duration,
        status,
        classification,
        responsePreview: bodyText.slice(0, 300),
      });

      console.log(`  HTTP: ${status} | Latency: ${duration}ms | Class: ${classification}`);

      if (classification === "usable") {
        foundUsable = true;
      }
    } catch (err) {
      const duration = Date.now() - start;
      const classification = classifyOpenRouterResponse({ error: err });

      results.push({
        model,
        duration,
        classification,
        error: err instanceof Error ? err.message : String(err),
      });

      console.log(`  Failed: ${err instanceof Error ? err.message : String(err)} | Class: ${classification}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  console.log("=========================================");
  console.log("             Summary Report              ");
  console.log("=========================================");

  results.forEach((r) => {
    if (r.error) {
      console.log(`[${r.classification.toUpperCase()}] ${r.model} - Error: ${r.error}`);
    } else {
      console.log(`[${r.classification.toUpperCase()}] ${r.model} - Status: ${r.status} | Latency: ${r.duration}ms`);
    }
  });

  const allBlocked = results.length > 0 && results.every((r) => r.classification === "payment_required" || r.classification === "rate_limited");

  if (allBlocked) {
    console.log("\nBLOCKED: provider account capacity / credits / quota");
    process.exit(1);
  }

  if (foundUsable) {
    console.log("\nSuccess: Found at least one usable model.");
    process.exit(0);
  } else {
    console.log("\nFailure: No usable models found.");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unhandled error in readiness checker:", err);
  process.exit(1);
});
