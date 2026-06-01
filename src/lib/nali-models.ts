// NaLI processing tiers — public, NaLI-branded names that map to internal
// engines. Provider/model names are never exposed in the UI.

export interface NaLITier {
  id: "peregrine" | "obsidian" | "zephyr";
  label: string;
  tagline: string;
  engine: string; // internal OpenRouter model id (must exist in CAPABLE_MODEL_WATERFALL)
  dot: string;
}

export const NALI_TIERS: NaLITier[] = [
  {
    id: "peregrine",
    label: "NaLI Peregrine",
    tagline: "Paling cepat dan hemat",
    engine: "openai/gpt-oss-120b:free",
    dot: "#00FFB3",
  },
  {
    id: "obsidian",
    label: "NaLI Obsidian",
    tagline: "Seimbang antara cepat dan mendalam",
    engine: "meta-llama/llama-3.3-70b-instruct:free",
    dot: "#5EEAD4",
  },
  {
    id: "zephyr",
    label: "NaLI Zephyr",
    tagline: "Paling canggih untuk analisis forensik",
    engine: "qwen/qwen3-next-80b-a3b-instruct:free",
    dot: "#A5F3E4",
  },
];

export const DEFAULT_TIER_ID: NaLITier["id"] = "peregrine";

export const PREFERRED_MODEL_STORAGE_KEY = "nali_preferred_model";

export function tierById(id: string | null | undefined): NaLITier {
  return NALI_TIERS.find((t) => t.id === id) ?? NALI_TIERS[0];
}

export function engineForTier(id: string | null | undefined): string {
  return tierById(id).engine;
}

/** Map an internal engine id back to its NaLI label (never shows provider name). */
export function labelForEngine(engine: string | null | undefined): string {
  const t = NALI_TIERS.find((x) => x.engine === engine);
  return t?.label ?? "NaLI Intelligence";
}
