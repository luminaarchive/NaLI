// Standard free waterfall (legacy, for simple tasks)
export const FREE_MODEL_WATERFALL = [
  "openrouter/free",
  "meta-llama/llama-4-maverick:free",
  "meta-llama/llama-4-scout:free",
  "deepseek/deepseek-r1:free",
  "qwen/qwen3-235b-a22b:free",
  "openai/gpt-oss-20b:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
] as const;

// Capable model waterfall for NaLI structured reports.
// These models handle complex system prompts and long context without hallucinating.
// Verified live on OpenRouter (older :free ids like qwen3-235b / llama-4 were removed).
// Reasoning-only models (deepseek-r1, *-thinking) are excluded because they stream
// chain-of-thought instead of content and come back empty.
export const CAPABLE_MODEL_WATERFALL = [
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
] as const;

// Minimum context length required to handle the NaLI system prompt + report
const MIN_CONTEXT_LENGTH = 32000;

export async function fetchAvailableFreeModels(): Promise<string[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [...FREE_MODEL_WATERFALL];
    const data = await res.json();
    const freeIds = (
      data.data as Array<{ id: string; pricing?: { prompt?: string | number }; context_length?: number }>
    )
      .filter(
        (m) =>
          (m.pricing?.prompt === "0" || m.pricing?.prompt === 0) &&
          (m.context_length === undefined || m.context_length >= MIN_CONTEXT_LENGTH),
      )
      .map((m) => m.id);
    return ["openrouter/free", ...freeIds, ...FREE_MODEL_WATERFALL].filter((v, i, a) => a.indexOf(v) === i);
  } catch {
    return [...FREE_MODEL_WATERFALL];
  }
}
