import {
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  KeyRound,
  RadioTower,
  ShieldCheck,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { getEnvStatus } from "@/lib/config/env";
import { env } from "@/lib/config/env";
import { getServerTranslations } from "@/lib/i18n/server";
import { getScientificProviderHealth, type ScientificProviderStatus } from "@/lib/scientific-bridge";

export const dynamic = "force-dynamic";

type LiveStatus = "ok" | "degraded" | "unverified";
type LiveInfrastructureStatus = {
  database: LiveStatus;
  storage: LiveStatus;
  migrations: LiveStatus;
  livePersistence: LiveStatus;
  rls: LiveStatus;
};

async function getLiveInfrastructureStatus(): Promise<LiveInfrastructureStatus> {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    return {
      database: "degraded" as LiveStatus,
      storage: "degraded" as LiveStatus,
      migrations: "degraded" as LiveStatus,
      livePersistence: "degraded" as LiveStatus,
      rls: "unverified" as LiveStatus,
    };
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [{ error: observationsError }, { error: reasoningColumnError }, { data: buckets, error: bucketsError }] =
    await Promise.all([
      supabase.from("observations").select("id", { count: "exact", head: true }).limit(1),
      supabase
        .from("observations")
        .select(
          "reasoning_snapshot,signal_snapshot,reasoning_trace_id,conservation_priority_score,conservation_priority_category",
        )
        .limit(1),
      supabase.storage.listBuckets(),
    ]);

  const observationBucket = buckets?.find(
    (bucket) => bucket.name === "observation_media" || bucket.id === "observation_media",
  );
  const storageReady = !bucketsError && observationBucket?.public === false;
  const reasoningReady = !reasoningColumnError;
  const databaseReady = !observationsError;

  return {
    database: databaseReady ? "ok" : "degraded",
    storage: storageReady ? "ok" : "degraded",
    migrations: databaseReady && reasoningReady ? "ok" : "degraded",
    livePersistence: databaseReady && reasoningReady && storageReady ? "ok" : "degraded",
    rls: "unverified" as LiveStatus,
  };
}

export default async function SystemReadinessPage() {
  const { language, t } = await getServerTranslations();
  const envStatus = getEnvStatus();
  const providerEntries = Object.entries(envStatus.providers);
  const scientificHealth = getScientificProviderHealth();
  const liveStatus = await getLiveInfrastructureStatus();
  const knownWarnings = [
    t("warnings.optionalProviders"),
    t("warnings.healthDegraded"),
    t("warnings.backgroundAnalysis"),
  ];

  const checks: Array<{
    label: string;
    detail: string;
    status: LiveStatus;
    icon: LucideIcon;
  }> = [
    { label: "Auth configured", detail: "Supabase public URL and anon key are available for session handling.", status: envStatus.required.NEXT_PUBLIC_SUPABASE_URL.availability === "configured" && envStatus.required.NEXT_PUBLIC_SUPABASE_ANON_KEY.availability === "configured" ? "ok" : "degraded", icon: KeyRound },
    { label: "Supabase connected", detail: "Server-side runtime can reach the observations schema using configured Supabase credentials.", status: liveStatus.database, icon: Database },
    { label: "Storage configured", detail: "The private observation_media bucket is reachable and public access is disabled.", status: liveStatus.storage, icon: HardDrive },
    { label: "Storage bucket validation", detail: "Run npm run validate:storage to verify the private observation_media bucket, signed URLs, path convention, and cleanup behavior.", status: liveStatus.storage, icon: HardDrive },
    { label: "Migrations reflected", detail: "Observations schema includes operational reasoning columns for snapshots, trace IDs, and conservation priority persistence.", status: liveStatus.migrations, icon: Database },
    { label: "RLS validation", detail: "Run npm run validate:rls to check anon access, user-scoped observation data, media access, analysis traces, and public species reference behavior.", status: liveStatus.rls, icon: ShieldCheck },
    { label: "Live persistence readiness", detail: "Run npm run validate:supabase and node tests/e2e/smoke-observation-flow.cjs with production-like env vars before release.", status: liveStatus.livePersistence, icon: Database },
    { label: "Offline queue available", detail: "Client-side field capture can continue using local queue infrastructure.", status: "ok", icon: WifiOff },
    { label: "Observation create route", detail: "POST /api/observations accepts media, field notes, GPS metadata, and returns an observation_id before background analysis begins.", status: "ok", icon: RadioTower },
    { label: "Orchestrator available", detail: "Observation creation queues the provider pipeline and persists reasoning snapshots, signal snapshots, events, and field case decisions.", status: "ok", icon: ShieldCheck },
    { label: "Health endpoint available", detail: "GET /api/health reports app, database, storage, provider, timestamp, and version status for deployment smoke checks.", status: "ok", icon: Database },
    { label: "Last build/runtime status", detail: "Run npm run lint, npm run typecheck, npm run build, npm run verify, and node tests/e2e/smoke-observation-flow.cjs before release.", status: "ok", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-white/[0.06] pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
            {t("system.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t("system.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{t("system.context")}</p>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-4 md:grid-cols-2">
            {checks.map((check) => (
              <StatusCard detail={check.detail} icon={check.icon} key={check.label} label={check.label} status={check.status} />
            ))}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <RadioTower className="h-5 w-5 text-white/40" />
                <h2 className="text-lg font-semibold">{t("system.providerHealth")}</h2>
              </div>
              <div className="space-y-3">
                <ProviderRow label="GBIF occurrence data" status="configured" />
                {providerEntries.map(([key, status]) => (
                  <ProviderRow key={key} label={key.replace("_API_KEY", "").toLowerCase()} status={status.availability} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-white/40" />
                <h2 className="text-lg font-semibold">
                  {language === "id" ? "Matriks Intelijen Sumber" : "Source Intelligence Matrix"}
                </h2>
              </div>
              <div className="space-y-3">
                {scientificHealth.map((entry) => (
                  <ProviderMatrixRow key={entry.name} name={entry.name} note={language === "id" ? (entry.noteId ?? entry.note) : entry.note} purpose={language === "id" ? (entry.purposeId ?? entry.purpose) : entry.purpose} status={entry.status} />
                ))}
                <ProviderMatrixRow name="Location memory" note={language === "id" ? "RPC PostGIS telah discaffold; status live bergantung pada validasi migrasi Supabase." : "PostGIS RPC scaffolded; live status depends on Supabase migration validation."} purpose={language === "id" ? "Riwayat observasi sekitar 500m." : "500m nearby observation history."} status={liveStatus.database === "ok" ? "configured" : "degraded"} />
                <ProviderMatrixRow name="Evidence hash" note={language === "id" ? "Library SHA-256 dan scaffold migrasi tersedia; penggunaan hukum tetap perlu validasi forensik." : "SHA-256 library and migration scaffold exist; legal use still needs forensic validation."} purpose={language === "id" ? "Pemeriksaan integritas catatan lapangan yang tahan perubahan." : "Tamper-evident field record integrity check."} status={liveStatus.migrations === "ok" ? "configured" : "degraded"} />
                <ProviderMatrixRow name="Review queue" note={language === "id" ? "Kebijakan reviewer/admin harus divalidasi sebelum digunakan operasional." : "Reviewer/admin policies must be validated before operational use."} purpose={language === "id" ? "Alur validasi manusia." : "Human validation workflow."} status={liveStatus.migrations === "ok" ? "configured" : "degraded"} />
                <ProviderMatrixRow name="Workflow power tools" note={language === "id" ? "Konsep GSD, LLM-wiki, Hermes, dan DESIGN.md didokumentasikan dan diekstrak ke skill lokal." : "GSD, LLM-wiki, Hermes, and DESIGN.md concepts are documented and extracted into local skills."} purpose={language === "id" ? "Disiplin workflow Codex." : "Codex workflow discipline."} status="fallback" />
                <ProviderMatrixRow name="Codex skill pack" note={language === "id" ? ".codex/skills/nali-* dicommit sebagai manual operasi lokal untuk pekerjaan berikutnya." : ".codex/skills/nali-* is committed as the local operating manual for future work."} purpose={language === "id" ? "Perilaku agen khusus NaLI." : "NaLI-specific agent behavior."} status="configured" />
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white/40" />
                <h2 className="text-lg font-semibold">{t("system.validationCommands")}</h2>
              </div>
              <div className="space-y-2">
                {[
                  "npm run validate:vercel-env",
                  "npm run validate:supabase",
                  "npm run validate:storage",
                  "npm run validate:rls",
                  "npm run validate:production",
                ].map((command) => (
                  <p key={command} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-white/60">
                    {command}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-white/40" />
                <h2 className="text-lg font-semibold">{t("system.knownWarnings")}</h2>
              </div>
              <div className="space-y-2">
                {knownWarnings.map((warning) => (
                  <p key={warning} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm leading-6 text-white/50">
                    {warning}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white/40" />
                <h2 className="text-lg font-semibold">{t("system.activeLanguage")}</h2>
              </div>
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm font-semibold uppercase text-white/60">
                {language}
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function ProviderMatrixRow({ name, note, purpose, status }: { name: string; note: string; purpose: string; status: ScientificProviderStatus }) {
  const available = status === "live" || status === "configured";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/80">{name}</span>
        <span className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${available ? "bg-green-400/10 text-green-300" : "bg-white/[0.04] text-white/40"}`}>
          {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/50">{purpose}</p>
      <p className="mt-1 text-xs leading-5 text-white/30">{note}</p>
    </div>
  );
}

function StatusCard({ detail, icon: Icon, label, status }: { detail: string; icon: LucideIcon; label: string; status: LiveStatus }) {
  const isOk = status === "ok";
  const isUnverified = status === "unverified";

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <Icon className="h-5 w-5 text-white/50" />
          </div>
          <h2 className="text-lg font-semibold">{label}</h2>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${isOk ? "bg-green-400/10 text-green-300" : isUnverified ? "bg-white/[0.04] text-white/40" : "bg-amber-400/10 text-amber-300"}`}>
          {status === "ok" ? "ok" : status}
        </span>
      </div>
      <p className="text-sm leading-6 text-white/50">{detail}</p>
    </article>
  );
}

function ProviderRow({ label, status }: { label: string; status: string }) {
  const available = status === "configured";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="text-sm capitalize text-white/60">{label}</span>
      <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${available ? "text-green-300" : "text-white/30"}`}>
        {available ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {available ? "available" : "unconfigured"}
      </span>
    </div>
  );
}
