"use client";

import { useMemo, useState } from "react";
import { Mic, Square, WandSparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

type SpeechRecognitionResultLike = {
  0?: {
    transcript?: string;
  };
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceParsedFields = {
  species?: string;
  individualCount?: string;
  behavior?: string;
  habitat?: string;
  threats?: string;
  notes: string;
};

type VoiceToFormProps = {
  onApply: (fields: VoiceParsedFields) => void;
};

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  );
}

function parseTranscript(transcript: string): VoiceParsedFields {
  const text = transcript.trim();
  const lower = text.toLowerCase();
  const countMatch = lower.match(/(?:jumlah|count|terlihat|seen)\s+(\d+)/);
  const knownSpecies = [
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
  ].find((species) => lower.includes(species));
  const threatTerms = ["jerat", "perburuan", "api", "asap", "deforestasi", "logging", "kebakaran"].filter((term) =>
    lower.includes(term),
  );

  return {
    species: knownSpecies,
    individualCount: countMatch?.[1],
    behavior: lower.includes("makan") ? "feeding" : lower.includes("bergerak") ? "moving" : undefined,
    habitat: lower.includes("sungai")
      ? "river edge"
      : lower.includes("mangrove")
        ? "mangrove"
        : lower.includes("hutan")
          ? "forest"
          : undefined,
    threats: threatTerms.length ? threatTerms.join(", ") : undefined,
    notes: text,
  };
}

export function VoiceToForm({ onApply }: VoiceToFormProps) {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const SpeechRecognition = useMemo(() => getSpeechRecognition(), []);
  const supported = Boolean(SpeechRecognition);

  function startListening() {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setTranscript(text);
      if (text) onApply(parseTranscript(text));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#09090b] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-white text-sm font-semibold">{t("observe.voice.title")}</p>
          <p className="text-white/50 mt-1 text-xs leading-5">{t("observe.voice.disclaimer")}</p>
        </div>
        <button
          className="text-white/80 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!supported}
          onClick={startListening}
          type="button"
        >
          {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isListening ? t("observe.voice.listening") : t("observe.voice.start")}
        </button>
      </div>
      {transcript ? (
        <div className="text-white/60 mt-3 flex items-start gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-3 text-sm leading-6">
          <WandSparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
          <p>{transcript}</p>
        </div>
      ) : null}
      {!supported ? <p className="text-white/40 mt-2 text-xs">{t("observe.voice.unsupported")}</p> : null}
    </div>
  );
}
