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

export async function fetchAvailableFreeModels(): Promise<string[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [...FREE_MODEL_WATERFALL];
    const data = await res.json();
    const freeIds = (data.data as any[])
      .filter((m) => m.pricing?.prompt === "0" || m.pricing?.prompt === 0)
      .map((m) => m.id as string);
    return ["openrouter/free", ...freeIds, ...FREE_MODEL_WATERFALL].filter(
      (v, i, a) => a.indexOf(v) === i,
    );
  } catch {
    return [...FREE_MODEL_WATERFALL];
  }
}
