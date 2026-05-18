"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  ClipboardList,
  CloudUpload,
  FileImage,
  LocateFixed,
  MapPin,
  Mic,
  RefreshCcw,
  Save,
  SearchCheck,
  ShieldCheck,
  SignalLow,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import { LocationMemoryPanel } from "@/components/observation/LocationMemoryPanel";
import { VoiceToForm } from "@/components/observation/VoiceToForm";
import { useRealtimeAlerts } from "@/lib/realtime/alerts";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getSpeciesVisual } from "@/lib/species/speciesVisuals";

type GpsState = "locating" | "acquired" | "low-accuracy" | "unavailable";
type PipelineState = "idle" | "running" | "complete";

type SpeciesResult = {
  scientificName: string;
  localName: string;
  confidence: number;
  status: "CR" | "EN" | "VU";
  trend: string;
  anomaly: string;
  distribution: string;
  notes: string;
  image: string;
};

const pipelineSteps = [
  "Uploading observation...",
  "Running species identification...",
  "Cross-checking GBIF distribution...",
  "Fetching IUCN conservation data...",
  "Running anomaly detection...",
  "Compiling structured field report...",
  "Saving observation log...",
];

const speciesResults: SpeciesResult[] = [
  {
    scientificName: "Panthera tigris sumatrae",
    localName: "Harimau Sumatera",
    confidence: 91,
    status: "CR",
    trend: "Decreasing",
    anomaly: "Human settlement proximity requires review",
    distribution: "Known range overlaps Kerinci Seblat and Bukit Barisan forest systems.",
    notes:
      "Possible large carnivore evidence near riparian vegetation. Verify track scale, camera metadata, and recent patrol reports before sharing coordinates.",
    image: getSpeciesVisual("Panthera tigris sumatrae")?.imagePath ?? "/icon.svg",
  },
  {
    scientificName: "Pongo tapanuliensis",
    localName: "Orangutan Tapanuli",
    confidence: 88,
    status: "CR",
    trend: "Decreasing",
    anomaly: "Small-range species: location privacy elevated",
    distribution: "Restricted to the Batang Toru ecosystem in North Sumatra.",
    notes:
      "Observation should be handled as sensitive habitat data. Look for nest evidence and fruiting tree context in follow-up notes.",
    image: getSpeciesVisual("Pongo tapanuliensis")?.imagePath ?? "/icon.svg",
  },
  {
    scientificName: "Varanus komodoensis",
    localName: "Komodo",
    confidence: 93,
    status: "EN",
    trend: "Stable in monitored zones",
    anomaly: "No distribution anomaly detected",
    distribution: "Primarily associated with Komodo, Rinca, Flores, Gili Motang, and nearby islands.",
    notes:
      "Record distance from settlements, temperature, and observed behavior. Maintain safe approach distance during verification.",
    image: getSpeciesVisual("Varanus komodoensis")?.imagePath ?? "/icon.svg",
  },
  {
    scientificName: "Spizaetus bartelsi",
    localName: "Elang Jawa",
    confidence: 86,
    status: "EN",
    trend: "Decreasing",
    anomaly: "Canopy call record recommended for confirmation",
    distribution: "Endemic to Java, usually associated with mature forest and mountain habitats.",
    notes:
      "Raptor identification benefits from silhouette, crest visibility, and call evidence. Add audio when available.",
    image: getSpeciesVisual("Spizaetus bartelsi")?.imagePath ?? "/icon.svg",
  },
  {
    scientificName: "Leucopsar rothschildi",
    localName: "Jalak Bali",
    confidence: 89,
    status: "CR",
    trend: "Increasing under managed recovery",
    anomaly: "Captive-release zone should be checked",
    distribution: "Native to Bali with highly managed conservation and release populations.",
    notes: "Confirm leg bands if visible and note flock size. Treat exact coordinates as sensitive until reviewed.",
    image: getSpeciesVisual("Leucopsar rothschildi")?.imagePath ?? "/icon.svg",
  },
];

function pickResult(description: string) {
  const text = description.toLowerCase();
  if (text.includes("elang") || text.includes("burung") || text.includes("kanopi")) {
    return speciesResults[3];
  }
  if (text.includes("komodo") || text.includes("biawak")) {
    return speciesResults[2];
  }
  if (text.includes("orangutan") || text.includes("pongo")) {
    return speciesResults[1];
  }
  if (text.includes("jalak") || text.includes("bali")) {
    return speciesResults[4];
  }
  return speciesResults[0];
}

export default function ObserveWorkflow() {
  const router = useRouter();
  const { language, t } = useTranslation();
  const realtimeAlerts = useRealtimeAlerts("default", language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [gpsState, setGpsState] = useState<GpsState>("locating");
  const [coords, setCoords] = useState({ latitude: -6.9175, longitude: 107.6191, accuracy: 42 });
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<SpeciesResult | null>(null);
  const [persistedObservationId, setPersistedObservationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [offlineQueued, setOfflineQueued] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsState("unavailable");
      return;
    }

    setGpsState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setGpsState(accuracy > 50 ? "low-accuracy" : "acquired");
      },
      () => setGpsState("low-accuracy"),
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      setUploadProgress(0);
      return;
    }

    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    setUploadProgress(18);
    const progressTimer = window.setInterval(() => {
      setUploadProgress((current) => (current >= 100 ? 100 : Math.min(current + 18, 100)));
    }, 180);

    return () => {
      URL.revokeObjectURL(url);
      window.clearInterval(progressTimer);
    };
  }, [photoFile]);

  useEffect(() => {
    if (pipelineState !== "running") return;
    if (!persistedObservationId) return;

    if (activeStep >= pipelineSteps.length - 1) {
      const completeTimer = window.setTimeout(() => {
        setPipelineState("complete");
        setResult(pickResult(description));
      }, 900);
      return () => window.clearTimeout(completeTimer);
    }

    const timer = window.setTimeout(() => {
      setActiveStep((step) => step + 1);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [activeStep, description, persistedObservationId, pipelineState]);

  const canAnalyze = Boolean(photoFile || description.trim()) && gpsState !== "locating";
  const observationId = useMemo(() => {
    const date = new Date();
    return `OBS-IDN-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
      date.getDate(),
    ).padStart(2, "0")}-${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
  }, []);

  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      setPhotoFile(file);
      setResult(null);
      setPipelineState("idle");
      setOfflineQueued(false);
    }
  };

  const analyzeObservation = async () => {
    if (!canAnalyze) return;
    setActiveStep(0);
    setResult(null);
    setPersistedObservationId(null);
    setSubmitError(null);
    setOfflineQueued(false);
    setPipelineState("running");

    const formData = new FormData();
    if (photoFile) formData.append("photoFile", photoFile);
    formData.append("textDescription", description);
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
    formData.append("accuracyMeters", String(coords.accuracy));

    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to persist observation");
      }
      setPersistedObservationId(payload.observationId);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to persist observation");
      setOfflineQueued(true);
      setPipelineState("idle");
      setActiveStep(0);
    }
  };

  const saveOffline = () => {
    setOfflineQueued(true);
  };

  return (
    <div className="text-white min-h-screen bg-[#09090b] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5">
          <p className="text-xs font-semibold tracking-[0.08em] text-white/30 uppercase">{t("observe.title")}</p>
          <h1 className="text-white mt-2 text-2xl font-semibold tracking-[0] sm:text-4xl">
            {t("common.fieldObservation")}
          </h1>
          <p className="text-white/50 mt-2 max-w-2xl text-sm leading-6 sm:text-base">{t("observe.context")}</p>
        </header>

        <OfflineNotice queued={offlineQueued} />
        {realtimeAlerts.length ? (
          <div className="mb-4 space-y-2">
            {realtimeAlerts.slice(0, 2).map((alert) => (
              <div
                className="border-amber-400/30 bg-amber-400/10 text-white/80 rounded-xl border p-3 text-sm font-semibold"
                key={alert.id}
              >
                {alert.message}
                {typeof alert.distanceKm === "number"
                  ? ` ${language === "id" ? "Perkiraan jarak" : "Estimated distance"}: ${alert.distanceKm.toFixed(1)} km`
                  : ""}
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
          <section className="space-y-4">
            <FieldCard
              icon={<FileImage className="h-5 w-5" />}
              title={t("observe.upload")}
              detail={t("observe.uploadHint")}
            >
              <div
                className={`relative overflow-hidden rounded-xl border-2 border-dashed ${
                  isDragging ? "border-indigo-400/40 bg-indigo-400/10" : "border-white/[0.1] bg-white/[0.03]"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                {previewUrl ? (
                  <div className="relative h-64">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Uploaded observation preview" className="h-full w-full object-cover" src={previewUrl} />
                    <button
                      aria-label="Remove selected photo"
                      className="bg-[#09090b]/85 absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      onClick={() => setPhotoFile(null)}
                      type="button"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="flex min-h-52 w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="h-8 w-8 text-white/30" />
                    <span className="text-white font-semibold">{t("observe.upload")}</span>
                    <span className="text-white/50 text-sm">
                      JPG, PNG, or HEIC from field camera and Android gallery
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  className="text-[#09090b] inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 text-sm font-semibold"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <CloudUpload className="h-4 w-4" />
                  {t("observe.upload")}
                </button>
                <button
                  className="bg-white inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#09090b]"
                  onClick={() => cameraInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                  Camera Capture
                </button>
              </div>

              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
                ref={fileInputRef}
                type="file"
              />
              <input
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
                ref={cameraInputRef}
                type="file"
              />

              <UploadProgress progress={uploadProgress} hasPhoto={Boolean(photoFile)} />
            </FieldCard>

            <FieldCard
              icon={<Mic className="h-5 w-5" />}
              title="Audio recording"
              detail="Reserved for bird calls and acoustic observations."
            >
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <button
                    className="bg-white inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#09090b]"
                    type="button"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </button>
                  <span className="text-white/40 text-right text-xs font-semibold tracking-[0.08em] uppercase">
                    Placeholder
                  </span>
                </div>
                <div className="flex h-16 items-end gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                  {[24, 42, 30, 54, 36, 48, 28, 58, 38, 44, 26, 50, 34, 46, 30, 40].map((height, index) => (
                    <span className="w-full rounded-t-sm bg-indigo-400/30" key={`${height}-${index}`} style={{ height }} />
                  ))}
                </div>
                <p className="text-white/50 mt-3 text-sm">Bird audio identification integration coming soon</p>
              </div>
            </FieldCard>

            <FieldCard
              icon={<ClipboardList className="h-5 w-5" />}
              title={t("observe.description")}
              detail="Write natural field notes in Indonesian or English."
            >
              <VoiceToForm
                onApply={(fields) => {
                  setDescription((current) => {
                    const additions = [
                      fields.species ? `Species: ${fields.species}` : "",
                      fields.individualCount ? `Individuals: ${fields.individualCount}` : "",
                      fields.behavior ? `Behavior: ${fields.behavior}` : "",
                      fields.habitat ? `Habitat: ${fields.habitat}` : "",
                      fields.threats ? `Threats: ${fields.threats}` : "",
                      fields.notes,
                    ].filter(Boolean);
                    return [current, additions.join("\n")].filter(Boolean).join("\n\n");
                  });
                  setResult(null);
                }}
              />
              <textarea
                className="text-white mt-3 min-h-36 w-full resize-none rounded-xl border border-white/[0.1] bg-white p-4 text-base leading-7 transition outline-none focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/10"
                maxLength={2000}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setResult(null);
                }}
                placeholder={t("observe.descriptionPlaceholder")}
                value={description}
              />
              <div className="text-white/40 mt-2 flex items-center justify-between text-xs">
                <span>Supports Bahasa Indonesia and English observations</span>
                <span>{description.length} / 2000</span>
              </div>
            </FieldCard>
          </section>

          <aside className="space-y-4">
            <GpsCard coords={coords} state={gpsState} />
            {gpsState !== "locating" && gpsState !== "unavailable" ? (
              <LocationMemoryPanel latitude={coords.latitude} longitude={coords.longitude} />
            ) : null}

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              {submitError ? (
                <div className="border-red-500/20 bg-red-500/10 text-white/60 mb-3 rounded-xl border p-3 text-sm leading-6">
                  {t("observe.uploadFailed")} {submitError}
                </div>
              ) : null}
              <button
                className="bg-white inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[#09090b] transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/20"
                disabled={!canAnalyze || pipelineState === "running"}
                onClick={analyzeObservation}
                type="button"
              >
                <SearchCheck className="h-5 w-5" />
                {t("common.analyzeObservation")}
              </button>
              <button
                className="text-white/80 mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#09090b] px-5 text-sm font-semibold"
                onClick={saveOffline}
                type="button"
              >
                <Save className="h-5 w-5" />
                Save Offline
              </button>
              {!canAnalyze ? (
                <p className="text-white/50 mt-3 text-sm leading-6">
                  Add a photo or field description and wait for GPS before analysis.
                </p>
              ) : null}
            </div>

            <PipelineCard activeStep={activeStep} state={pipelineState} />

            {result ? (
              <ResultCard
                coords={coords}
                observationId={observationId}
                persistedObservationId={persistedObservationId}
                result={result}
                timestamp={timestamp}
                onOpenPersisted={() => {
                  if (persistedObservationId) router.push(`/observation/${persistedObservationId}`);
                }}
              />
            ) : (
              <EmptyResultCard />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function FieldCard({
  children,
  detail,
  icon,
  title,
}: {
  children: React.ReactNode;
  detail: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
          {icon}
        </span>
        <div>
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <p className="text-white/50 text-sm leading-6">{detail}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function UploadProgress({ hasPhoto, progress }: { hasPhoto: boolean; progress: number }) {
  if (!hasPhoto) return null;

  return (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
      <div className="text-white/40 mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.08em] uppercase">
        <span>Upload preparation</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className="h-full rounded-full bg-indigo-500/60 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function GpsCard({
  coords,
  state,
}: {
  coords: { latitude: number; longitude: number; accuracy: number };
  state: GpsState;
}) {
  const stateCopy = {
    locating: {
      label: "locating...",
      tone: "border-amber-400/20 bg-amber-400/20 text-white",
      icon: RefreshCcw,
    },
    acquired: {
      label: "GPS acquired",
      tone: "border-indigo-400/20 bg-indigo-400/10 text-white",
      icon: LocateFixed,
    },
    "low-accuracy": {
      label: "low accuracy warning",
      tone: "border-amber-400/30 bg-amber-400/10 text-white",
      icon: AlertTriangle,
    },
    unavailable: {
      label: "GPS unavailable",
      tone: "border-red-500/20 bg-red-500/10 text-white",
      icon: AlertTriangle,
    },
  }[state];
  const Icon = stateCopy.icon;

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-white text-lg font-semibold">GPS detection</h2>
          <p className="text-white/50 text-sm leading-6">
            Coordinates are attached to the observation log and protected for sensitive species.
          </p>
        </div>
      </div>

      <div className={`mb-3 flex items-center gap-2 rounded-xl border p-3 text-sm ${stateCopy.tone}`}>
        <Icon className={`h-4 w-4 ${state === "locating" ? "animate-spin" : ""}`} />
        <span className="font-semibold">{stateCopy.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Coordinate label="Latitude" value={coords.latitude.toFixed(5)} />
        <Coordinate label="Longitude" value={coords.longitude.toFixed(5)} />
        <Coordinate label="Accuracy" value={`±${Math.round(coords.accuracy)}m`} />
      </div>
    </section>
  );
}

function Coordinate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
      <p className="text-white/40 text-xs font-semibold tracking-[0.08em] uppercase">{label}</p>
      <p className="text-white mt-1 text-sm font-semibold break-words">{value}</p>
    </div>
  );
}

function PipelineCard({ activeStep, state }: { activeStep: number; state: PipelineState }) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-lg font-semibold">Analysis pipeline</h2>
          <p className="text-white/50 text-sm">Sequential operational analysis states</p>
        </div>
        <span className="text-white/50 rounded-xl bg-white/[0.03] px-2.5 py-1 text-xs font-semibold tracking-[0.08em] uppercase">
          {state === "complete" ? "Complete" : state === "running" ? "Running" : "Ready"}
        </span>
      </div>

      <div className="space-y-2">
        {pipelineSteps.map((step, index) => {
          const isDone = state === "complete" || (state === "running" && index < activeStep);
          const isActive = state === "running" && index === activeStep;
          return (
            <div
              className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                isActive
                  ? "text-white border-indigo-400/20 bg-indigo-400/10"
                  : isDone
                    ? "text-white/50 border-white/[0.08] bg-[#09090b]"
                    : "text-white/30 border-white/[0.08] bg-white/[0.03]"
              }`}
              key={step}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isDone ? "bg-indigo-500/60 text-white" : isActive ? "bg-amber-400/20 text-white" : "bg-white/[0.04]"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                )}
              </span>
              <span className="font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultCard({
  coords,
  observationId,
  onOpenPersisted,
  persistedObservationId,
  result,
  timestamp,
}: {
  coords: { latitude: number; longitude: number; accuracy: number };
  observationId: string;
  onOpenPersisted: () => void;
  persistedObservationId: string | null;
  result: SpeciesResult;
  timestamp: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative h-52">
        <Image
          alt={`${result.localName} observation result`}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          src={result.image}
        />
        <span className="bg-[#09090b]/85 absolute top-3 left-3 rounded-lg px-3 py-2 text-xs font-semibold tracking-[0.08em] text-white uppercase">
          Structured result
        </span>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-white text-2xl font-semibold italic">{result.scientificName}</h2>
            <p className="text-white/50 text-sm">{result.localName}</p>
          </div>
          <StatusBadge status={result.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Coordinate label="Confidence" value={`${result.confidence}%`} />
          <Coordinate label="Trend" value={result.trend} />
          <Coordinate label="Observation ID" value={observationId} />
          <Coordinate label="Timestamp" value={timestamp} />
          <Coordinate label="Latitude" value={coords.latitude.toFixed(5)} />
          <Coordinate label="Longitude" value={coords.longitude.toFixed(5)} />
        </div>

        <div className="border-amber-400/30 bg-amber-400/10 mt-3 rounded-xl border p-3">
          <div className="flex gap-2">
            <AlertTriangle className="text-amber-300 mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">Anomaly detection warning</p>
              <p className="text-white/60 mt-1 text-sm leading-6">{result.anomaly}</p>
            </div>
          </div>
        </div>

        <InfoBlock title="Distribution summary" text={result.distribution} />
        <InfoBlock title="Ecological notes" text={result.notes} />
        {persistedObservationId ? (
          <button
            className="bg-white mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-[#09090b]"
            onClick={onOpenPersisted}
            type="button"
          >
            Open Archived Field Log
          </button>
        ) : (
          <Link
            className="text-white/80 mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/[0.1] bg-[#09090b] px-4 text-sm font-semibold"
            href="/dashboard"
          >
            View Field Log Dashboard
          </Link>
        )}
      </div>
    </motion.section>
  );
}

function EmptyResultCard() {
  return (
    <section className="text-white/50 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-indigo-300">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h2 className="text-white text-lg font-semibold">Observation result will appear here</h2>
      <p className="mt-2">
        After analysis, NaLI will show species identification, conservation context, anomaly review, coordinates, and
        structured notes in this panel.
      </p>
    </section>
  );
}

function StatusBadge({ status }: { status: SpeciesResult["status"] }) {
  const styles = {
    CR: "bg-red-500/10 text-white",
    EN: "bg-amber-400/10 text-white",
    VU: "bg-amber-400/20 text-white",
  }[status];
  return <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${styles}`}>{status}</span>;
}

function InfoBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
      <p className="text-white/40 text-xs font-semibold tracking-[0.08em] uppercase">{title}</p>
      <p className="text-white/60 mt-1 text-sm leading-6">{text}</p>
    </div>
  );
}

function OfflineNotice({ queued }: { queued: boolean }) {
  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-3">
      <NoticeItem icon={<WifiOff className="h-4 w-4" />} label="Offline lite ready" />
      <NoticeItem
        icon={<ClipboardList className="h-4 w-4" />}
        label={queued ? "Queued observation pending sync" : "No queued observation"}
      />
      <NoticeItem icon={<SignalLow className="h-4 w-4" />} label="Reconnect notification enabled" />
    </div>
  );
}

function NoticeItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-white/60 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium">
      <span className="text-white/30">{icon}</span>
      {label}
    </div>
  );
}
