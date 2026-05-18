"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, History, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type LocationMemoryRow = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  observed_at: string | null;
  review_status: string | null;
  confidence_level: number | null;
  anomaly_flag: boolean | null;
  submitter_label: string | null;
  field_case_id: string | null;
  distance_meters: number | null;
  can_access_detail: boolean | null;
};

type LocationMemoryPanelProps = {
  latitude: number;
  longitude: number;
};

export function LocationMemoryPanel({ latitude, longitude }: LocationMemoryPanelProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LocationMemoryRow[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");

    fetch(`/api/location-memory?lat=${latitude}&lng=${longitude}&radius_m=500`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Location memory unavailable");
        setRows(body.rows ?? []);
      })
      .catch((lookupError) => {
        if (lookupError instanceof DOMException && lookupError.name === "AbortError") return;
        setError(lookupError instanceof Error ? lookupError.message : "Location memory unavailable");
        setRows([]);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [latitude, longitude]);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
          <History className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-white text-lg font-semibold">{t("observe.locationMemory.title")}</h2>
          <p className="text-white/50 text-sm leading-6">{t("observe.locationMemory.description")}</p>
        </div>
      </div>

      {isLoading ? <p className="text-white/50 text-sm">{t("observe.locationMemory.loading")}</p> : null}

      {error ? (
        <div className="border-amber-400/30 bg-amber-400/10 text-white/60 flex items-start gap-2 rounded-xl border p-3 text-sm leading-6">
          <AlertTriangle className="text-amber-300 mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && rows.length === 0 ? (
        <p className="text-white/50 rounded-xl border border-white/[0.08] bg-[#09090b] p-3 text-sm leading-6">
          {t("observe.locationMemory.empty")}
        </p>
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <article className="rounded-xl border border-white/[0.08] bg-[#09090b] p-3" key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-semibold italic">
                  {row.scientific_name || t("archive.speciesPending")}
                </p>
                <p className="text-white/50 text-xs">{row.local_name || t("archive.commonNamePending")}</p>
              </div>
              {row.anomaly_flag ? (
                <span className="bg-amber-400/10 text-white rounded-xl px-2 py-1 text-[10px] font-bold">
                  {t("observe.locationMemory.anomaly")}
                </span>
              ) : null}
            </div>
            <div className="text-white/50 mt-3 grid gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {row.observed_at ? new Date(row.observed_at).toLocaleDateString() : t("common.pending")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {Math.round(row.distance_meters ?? 0)}m · {row.review_status || t("common.pending")} ·{" "}
                {row.confidence_level ? `${Math.round(row.confidence_level * 100)}%` : t("common.pending")}
              </span>
              <span>{row.submitter_label || "NaLI observer"}</span>
            </div>
            {row.can_access_detail ? (
              <Link
                className="text-white/80 mt-3 inline-flex text-xs font-semibold underline"
                href={`/observation/${row.id}`}
              >
                {t("observe.locationMemory.openDetail")}
              </Link>
            ) : null}
            {row.field_case_id ? (
              <p className="text-white/50 mt-2 text-xs font-semibold">
                {t("observe.locationMemory.caseLinked")}: {row.field_case_id}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
