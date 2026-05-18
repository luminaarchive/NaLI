"use client";

import Image from "next/image";
import { AlertTriangle, ClipboardCheck, Database, ShieldCheck } from "lucide-react";
import { getSpeciesVisual } from "@/lib/species/speciesVisuals";
import { useTranslation } from "@/lib/i18n/useTranslation";

export type SpeciesEvidenceCardProps = {
  scientificName: string;
  commonName: string;
  status: string;
  region: string;
  evidenceType: string;
  sourceLabel: string;
  reviewRecommendation: string;
  conservationContext?: string;
  disclaimer: string;
  priority?: boolean;
};

export function SpeciesEvidenceCard({
  scientificName,
  commonName,
  status,
  region,
  evidenceType,
  sourceLabel,
  reviewRecommendation,
  conservationContext,
  disclaimer,
  priority = false,
}: SpeciesEvidenceCardProps) {
  const { language, t } = useTranslation();
  const visual = getSpeciesVisual(scientificName);

  return (
    <article className="text-white overflow-hidden rounded-xl border border-white/[0.1] bg-[#09090b] shadow-[0_12px_34px_rgba(31,45,32,0.08)]">
      {visual?.verified ? (
        <div className="relative aspect-[4/3] w-full bg-white/[0.04]">
          <Image
            alt={language === "id" ? visual.altTextId : visual.altTextEn}
            className="object-cover"
            fetchPriority={priority ? "high" : "auto"}
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={visual.imagePath}
          />
          <div className="from-forest-950/82 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-3">
            <p className="text-xs font-semibold text-[#09090b]">{visual.commonNameId}</p>
          </div>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4 p-4 pb-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.08em] text-white/30 uppercase">{sourceLabel}</p>
          <h3 className="text-white mt-2 text-xl leading-tight font-semibold italic">{scientificName}</h3>
          <p className="text-white/50 mt-1 text-sm font-medium">{commonName}</p>
        </div>
        <span
          className={`inline-flex h-9 min-w-10 shrink-0 items-center justify-center rounded-xl px-2.5 text-xs font-bold ${
            status === "CR"
              ? "bg-red-500/10 text-white"
              : status === "EN"
                ? "bg-amber-400/10 text-white"
                : "bg-indigo-500/60 text-white"
          }`}
        >
          {status}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 px-4 text-sm sm:grid-cols-2">
        <Field label={t("landing.evidenceCard.distribution")} value={region} />
        <Field label={t("landing.evidenceCard.evidence")} value={evidenceType} />
        <Field label={t("landing.evidenceCard.review")} value={reviewRecommendation} />
        <Field label={t("landing.evidenceCard.status")} value={disclaimer} />
      </dl>

      {conservationContext ? (
        <div className="text-white/60 mx-4 mt-4 rounded-xl border border-indigo-400/20 bg-olive-50 p-3 text-sm leading-6">
          <div className="flex items-start gap-2">
            {status === "CR" ? (
              <AlertTriangle className="text-amber-300 mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
            )}
            <p>{conservationContext}</p>
          </div>
        </div>
      ) : null}

      <div className="text-white/60 mt-3 flex flex-wrap gap-2 px-4 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white px-2 py-1">
          <Database className="h-3.5 w-3.5" />
          GBIF
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white px-2 py-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          IUCN
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white px-2 py-1">
          <ClipboardCheck className="h-3.5 w-3.5" />
          NaLI
        </span>
      </div>

      {visual?.attribution ? (
        <p className="text-white/40 px-4 pt-3 pb-4 text-[0.66rem] leading-4">{visual.attribution}</p>
      ) : (
        <div className="pb-4" />
      )}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white p-3">
      <dt className="text-white/40 text-[0.68rem] font-semibold tracking-[0.08em] uppercase">{label}</dt>
      <dd className="text-white mt-1 text-sm leading-5">{value}</dd>
    </div>
  );
}
