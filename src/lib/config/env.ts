type EnvRequirement = "required" | "optional";
type EnvAvailability = "configured" | "missing" | "unavailable";

export type EnvKeyStatus = {
  availability: EnvAvailability;
  requirement: EnvRequirement;
};

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

const optionalProviderKeys = [
  "OPENROUTER_API_KEY",
  "MIDTRANS_SERVER_KEY",
  "MIDTRANS_MERCHANT_ID",
  "MIDTRANS_ENVIRONMENT",
  "MIDTRANS_IS_PRODUCTION",
  "MIDTRANS_SNAP_BASE_URL",
  "NALI_EXPORT_PRICE_IDR",
  "IUCN_API_KEY",
  "EBIRD_API_KEY",
  "NASA_FIRMS_API_KEY",
  "GFW_API_KEY",
  "BIRDNET_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

type RequiredEnvKey = (typeof requiredKeys)[number];
type OptionalProviderKey = (typeof optionalProviderKeys)[number];

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function statusFor(key: RequiredEnvKey | OptionalProviderKey, requirement: EnvRequirement): EnvKeyStatus {
  const configured = hasValue(process.env[key]);

  if (configured) {
    return { availability: "configured", requirement };
  }

  return {
    availability: requirement === "required" ? "missing" : "unavailable",
    requirement,
  };
}

export function getEnvStatus() {
  const required = Object.fromEntries(requiredKeys.map((key) => [key, statusFor(key, "required")])) as Record<
    RequiredEnvKey,
    EnvKeyStatus
  >;

  const providers = Object.fromEntries(optionalProviderKeys.map((key) => [key, statusFor(key, "optional")])) as Record<
    OptionalProviderKey,
    EnvKeyStatus
  >;

  const missingRequired = requiredKeys.filter((key) => required[key].availability === "missing");

  return {
    required,
    providers,
    ready: missingRequired.length === 0,
    missingRequired,
  };
}

export const env = {
  admin: {
    viewEnabled: process.env.ADMIN_VIEW_ENABLED === "true",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? "0.1.0",
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  providers: {
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b:free",
      fallbackModels:
        process.env.OPENROUTER_FALLBACK_MODELS ??
        "z-ai/glm-4.5-air:free,nvidia/nemotron-3-super:free,openrouter/free",
      siteUrl: process.env.OPENROUTER_SITE_URL ?? "https://naliai.vercel.app",
      siteName: process.env.OPENROUTER_SITE_NAME ?? "NaLI by NatIve",
    },
    midtrans: {
      merchantId: process.env.MIDTRANS_MERCHANT_ID ?? "",
      serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
      environment: process.env.MIDTRANS_ENVIRONMENT ?? "sandbox",
      isProduction: process.env.MIDTRANS_IS_PRODUCTION ?? "",
      snapBaseUrl: process.env.MIDTRANS_SNAP_BASE_URL ?? "",
      exportPriceIdr: process.env.NALI_EXPORT_PRICE_IDR ?? "19000",
    },
    iucn: {
      apiKey: process.env.IUCN_API_KEY ?? "",
      apiBase: process.env.IUCN_API_BASE ?? "https://apiv3.iucnredlist.org/api/v3",
    },
    birdnet: {
      apiBase: process.env.BIRDNET_API_BASE ?? "",
      apiKey: process.env.BIRDNET_API_KEY ?? "",
    },
    ebird: {
      apiKey: process.env.EBIRD_API_KEY ?? "",
    },
    firms: {
      apiKey: process.env.NASA_FIRMS_API_KEY ?? "",
    },
    gfw: {
      apiKey: process.env.GFW_API_KEY ?? "",
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      model: "claude-sonnet-4-20250514",
    },
    gbif: {
      apiBase: process.env.GBIF_API_BASE ?? "https://api.gbif.org/v1",
    },
  },
};
