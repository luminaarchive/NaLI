"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, SearchCheck } from "lucide-react";
import { getSpeciesVisual } from "@/lib/species/speciesVisuals";
import { useTranslation } from "@/lib/i18n/useTranslation";

type DemoSpeciesResponse = {
  scientificName: string;
  commonNameId: string;
  iucnStatus: string;
  populationTrend: string;
  distributionId: string;
  conservationContext: string;
  reviewRecommendation: string;
  source: string;
  sourceLabel: string;
  isDemo: true;
  disclaimer: string;
};

const suggestions = [
  "harimau sumatera",
  "komodo",
  "jalak bali",
  "orangutan tapanuli",
  "bekantan",
  "elang jawa",
  "gajah sumatera",
  "badak sumatera",
  "maleo",
  "cendrawasih",
];

export function PublicSpeciesDemo() {
  const { language, t } = useTranslation();
  const [query, setQuery] = useState("harimau sumatera");
  const [result, setResult] = useState<DemoSpeciesResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function runLookup(nextQuery = query) {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);
    setError("");
    setResult(null);

    if (!trimmed) {
      setError(t("landing.publicDemo.empty"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/demo/species?q=${encodeURIComponent(trimmed)}&lang=${language}`);
      const body = await response.json();

      if (!response.ok) {
        setError(body.error || t("landing.publicDemo.notFound"));
        return;
      }

      setResult(body);
    } catch {
      setError(t("landing.publicDemo.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runLookup();
  }

  const visual = result ? getSpeciesVisual(result.scientificName) : undefined;
  const ctaHref = result
    ? `/register?species=${encodeURIComponent(result.scientificName)}&common=${encodeURIComponent(
        result.commonNameId,
      )}&source=public-demo`
    : "/register";

  return (
    <section id="demo" className="border-b border-white/[0.08] bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-white/30 uppercase">
            {t("landing.publicDemo.kicker")}
          </p>
          <h2 className="text-white mt-3 text-3xl leading-tight font-semibold tracking-[0] sm:text-4xl">
            {t("landing.publicDemo.title")}
          </h2>
          <p className="text-white/50 mt-4 text-base leading-7">{t("landing.publicDemo.description")}</p>
          <p className="text-white/60 mt-5 rounded-xl border border-white/[0.1] bg-[#09090b] p-4 text-sm leading-6">
            {t("landing.publicDemo.disclaimer")}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 sm:p-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="public-species-query">
              {t("landing.publicDemo.inputLabel")}
            </label>
            <input
              className="text-white min-h-12 flex-1 rounded-xl border border-white/[0.1] bg-white px-4 text-base transition outline-none focus:border-indigo-400/40 focus:ring-2 focus:ring-olive-200"
              id="public-species-query"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("landing.publicDemo.placeholder")}
              value={query}
            />
            <button
              className="bg-white hover:bg-forest-800 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[#09090b] transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <SearchCheck className="h-4 w-4" />
              {isLoading ? t("landing.publicDemo.loading") : t("landing.publicDemo.button")}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                className="text-white/60 rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-xs font-semibold transition hover:bg-[#09090b]"
                key={suggestion}
                onClick={() => void runLookup(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="mt-5">
            {error ? (
              <div className="border-amber-400/30/50 bg-amber-400/10 text-white/80 flex items-start gap-2 rounded-xl border p-4 text-sm leading-6">
                <AlertTriangle className="text-amber-300 mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            {result ? (
              <article className="overflow-hidden rounded-xl border border-white/[0.1] bg-white">
                {visual?.verified ? (
                  <div className="relative aspect-[16/9] bg-white/[0.04]">
                    <Image
                      alt={language === "id" ? visual.altTextId : visual.altTextEn}
                      className="object-cover"
                      fill
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      src={visual.imagePath}
                    />
                    <div className="from-forest-950/82 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-4">
                      <p className="text-xs font-semibold tracking-[0.08em] text-[#09090b] uppercase">
                        {t("landing.publicDemo.demoBadge")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-0">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.08em] text-white/30 uppercase">
                      {t("landing.publicDemo.resultLabel")}
                    </p>
                    <h3 className="text-white mt-2 text-2xl font-semibold italic">{result.scientificName}</h3>
                    <p className="text-white/50 text-sm font-medium">{result.commonNameId}</p>
                  </div>
                  <span
                    className={`rounded-xl px-3 py-2 text-sm font-bold ${
                      result.iucnStatus === "CR"
                        ? "bg-red-500/10 text-white"
                        : result.iucnStatus === "EN"
                          ? "bg-amber-400/10 text-white"
                          : "bg-indigo-500/60 text-white"
                    }`}
                  >
                    {result.iucnStatus}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
                  <ResultField label={t("landing.publicDemo.populationTrend")} value={result.populationTrend} />
                  <ResultField label={t("landing.publicDemo.distribution")} value={result.distributionId} />
                  <ResultField label={t("landing.publicDemo.review")} value={result.reviewRecommendation} />
                  <ResultField label={t("landing.publicDemo.source")} value={result.sourceLabel} />
                </dl>

                <p className="text-white/60 mx-4 mt-4 rounded-xl border border-indigo-400/20 bg-olive-50 p-3 text-sm leading-6">
                  {result.conservationContext}
                </p>
                <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-white/50 text-xs font-semibold tracking-[0.08em] uppercase">
                    {t("landing.publicDemo.demoBadge")}
                  </p>
                  <Link
                    className="bg-white hover:bg-forest-800 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#09090b] transition"
                    href={ctaHref}
                  >
                    {t("landing.publicDemo.createObservation")}
                  </Link>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
      <dt className="text-white/40 text-xs font-semibold tracking-[0.08em] uppercase">{label}</dt>
      <dd className="text-white mt-1 text-sm leading-5">{value}</dd>
    </div>
  );
}
