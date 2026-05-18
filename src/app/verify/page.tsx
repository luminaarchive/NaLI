"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SearchCheck, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type VerifyResult = {
  hash: string;
  hash_algorithm: string;
  observation_id: string | null;
  scientific_name: string | null;
  local_name: string | null;
  created_at: string | null;
  review_status: string | null;
  coordinates_protected: boolean | null;
  accessible: boolean | null;
};

export default function VerifyPage() {
  const { t } = useTranslation();
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/verify/hash?hash=${encodeURIComponent(hash)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || t("verify.failed"));
      setResult(body.result);
      if (!body.result) setError(t("verify.notFound"));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : t("verify.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-semibold text-white/50 underline transition hover:text-white" href="/">
          NaLI
        </Link>
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-indigo-400/60">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{t("verify.kicker")}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("verify.title")}</h1>
              <p className="mt-3 text-sm leading-6 text-white/50">{t("verify.description")}</p>
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="hash">
              {t("verify.inputLabel")}
            </label>
            <input
              className="field-input min-h-12 flex-1 font-mono text-sm"
              id="hash"
              onChange={(event) => setHash(event.target.value)}
              placeholder="sha256..."
              value={hash}
            />
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#09090b] disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <SearchCheck className="h-4 w-4" />
              {isLoading ? t("verify.checking") : t("verify.button")}
            </button>
          </form>

          <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm leading-6 text-white/40">
            {t("verify.disclaimer")}
          </p>

          {error ? (
            <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
              {error}
            </p>
          ) : null}

          {result ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <VerifyField label={t("verify.fields.hash")} value={result.hash} mono />
              <VerifyField label={t("verify.fields.algorithm")} value={result.hash_algorithm} />
              <VerifyField
                label={t("verify.fields.observation")}
                value={result.observation_id || t("common.unavailable")}
              />
              <VerifyField
                label={t("verify.fields.species")}
                value={result.scientific_name || t("archive.speciesPending")}
              />
              <VerifyField
                label={t("verify.fields.commonName")}
                value={result.local_name || t("archive.commonNamePending")}
              />
              <VerifyField label={t("verify.fields.review")} value={result.review_status || t("common.pending")} />
              <VerifyField
                label={t("verify.fields.coordinates")}
                value={result.coordinates_protected ? t("verify.protected") : t("verify.notProtected")}
              />
            </dl>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function VerifyField({ label, mono, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{label}</dt>
      <dd className={`mt-1 break-all text-sm leading-5 text-white/70 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
