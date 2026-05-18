import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { env, getEnvStatus } from "@/lib/config/env";

export const dynamic = "force-dynamic";

type ServiceStatus = "ok" | "degraded" | "unconfigured";
type ProviderStatus = "available" | "degraded" | "unconfigured";

async function checkDatabase(): Promise<ServiceStatus> {
  if (!env.supabase.url || !env.supabase.anonKey) {
    return "unconfigured";
  }

  try {
    const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.from("observations").select("id", { count: "exact", head: true }).limit(1);
    return error ? "degraded" : "ok";
  } catch {
    return "degraded";
  }
}

async function checkStorage(): Promise<ServiceStatus> {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    return "unconfigured";
  }

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.storage.listBuckets();
    return error ? "degraded" : "ok";
  } catch {
    return "degraded";
  }
}

function providerStatus(configured: boolean): ProviderStatus {
  return configured ? "available" : "unconfigured";
}

export async function GET() {
  const envStatus = getEnvStatus();
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);

  const providers = {
    gbif: "available" as ProviderStatus,
    openrouter: providerStatus(envStatus.providers.OPENROUTER_API_KEY.availability === "configured"),
    iucn: providerStatus(envStatus.providers.IUCN_API_KEY.availability === "configured"),
    birdnet: providerStatus(envStatus.providers.BIRDNET_API_KEY.availability === "configured"),
    anthropic: providerStatus(envStatus.providers.ANTHROPIC_API_KEY.availability === "configured"),
  };

  const providerValues = Object.values(providers);
  const aggregateProviders: ProviderStatus = providerValues.every((status) => status === "available")
    ? "available"
    : providerValues.some((status) => status === "available")
      ? "degraded"
      : "unconfigured";

  return NextResponse.json({
    app: "ok",
    database,
    storage,
    providers: {
      status: aggregateProviders,
      services: providers,
    },
    env: {
      ready: envStatus.ready,
      missing_required: envStatus.missingRequired,
    },
    timestamp: new Date().toISOString(),
    version: env.app.version,
  });
}
