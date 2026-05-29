type OpenRouterJsonResult = {
  json: unknown;
  model: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const DEFAULT_FALLBACKS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.5-flash",
  "openrouter/free"
];

function parseModelList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonText(value: string) {
  const trimmed = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start < 0 || end <= start) {
      throw new Error("OpenRouter response did not contain JSON.");
    }

    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

export function getOpenRouterModels() {
  // Support both standard OPENROUTER_MODEL and NALI_OPENROUTER_MODEL env variables
  const primary = process.env.OPENROUTER_MODEL?.trim() || process.env.NALI_OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  const fallbacks = parseModelList(process.env.OPENROUTER_FALLBACK_MODELS);
  const modelSet = new Set([primary, ...(fallbacks.length > 0 ? fallbacks : DEFAULT_FALLBACKS)]);

  return Array.from(modelSet);
}

export async function requestOpenRouterJson({
  prompt,
  system,
}: {
  prompt: string;
  system: string;
}): Promise<OpenRouterJsonResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    console.warn("OpenRouter API key is missing. Model connection disabled.");
    return null;
  }

  const siteUrl = process.env.OPENROUTER_SITE_URL?.trim() || "https://naliai.vercel.app";
  const siteName = process.env.OPENROUTER_SITE_NAME?.trim() || "NaLI by NatIve";

  const models = getOpenRouterModels();
  if (models.length === 0) {
    console.warn("No OpenRouter models configured.");
    return null;
  }

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        body: JSON.stringify({
          messages: [
            { content: system, role: "system" },
            { content: prompt, role: "user" },
          ],
          model,
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-OpenRouter-Title": siteName,
        },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn("OpenRouter model failed with provider error", {
          model,
          status: response.status,
          statusText: response.statusText,
        });
        continue;
      }

      let payloadText = "";
      try {
        payloadText = await response.text();
      } catch (textErr) {
        console.warn("OpenRouter failed to read response text", { model, error: textErr instanceof Error ? textErr.message : "unknown" });
        continue;
      }

      let payload: OpenRouterResponse | null = null;
      try {
        payload = JSON.parse(payloadText) as OpenRouterResponse;
      } catch (parseErr) {
        console.warn("OpenRouter response was not valid JSON", {
          model,
          payloadTextPreview: payloadText.slice(0, 500),
          error: parseErr instanceof Error ? parseErr.message : "unknown"
        });
        continue;
      }

      if (!payload) {
        console.warn("OpenRouter response payload is empty", { model });
        continue;
      }

      if (payload.error) {
        console.warn("OpenRouter returned error in payload", {
          model,
          error: payload.error.message,
        });
        continue;
      }

      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        console.warn("OpenRouter model returned empty content or missing message choices", { model });
        continue;
      }

      let parsedJson: unknown;
      try {
        parsedJson = parseJsonText(content);
      } catch (parseErr) {
        console.warn("OpenRouter generated content was not valid JSON", {
          model,
          content,
          error: parseErr instanceof Error ? parseErr.message : "unknown",
        });
        continue;
      }

      // Verify that it contains usable generated content (must be an object)
      if (!parsedJson || typeof parsedJson !== "object") {
        console.warn("OpenRouter generated content does not contain usable JSON object", { model, parsedJson });
        continue;
      }

      return {
        json: parsedJson,
        model,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("OpenRouter request timed out", { model });
      } else {
        console.warn("OpenRouter request failed with network or system error", {
          error: error instanceof Error ? error.message : "unknown",
          model,
        });
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

