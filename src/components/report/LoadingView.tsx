"use client";

import { useEffect, useState } from "react";

const WORK_STEPS = [
  "Membaca konteks input",
  "Mengidentifikasi jenis laporan",
  "Memetakan klaim dan bukti",
  "Menandai bukti yang kurang",
  "Menyusun struktur laporan",
  "Membuat draft awal",
  "Mengecek batas klaim",
  "Menyiapkan hasil",
] as const;

interface LoadingViewProps {
  prompt: string;
  model?: string | null;
}

export function LoadingView({ prompt, model }: LoadingViewProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < WORK_STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-12 sm:pt-20 max-w-[520px] mx-auto w-full text-center">
      {/* Pulse logo */}
      <div className="relative mb-8">
        <div className="h-14 w-14 rounded-full bg-[#00FFB3]/10 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-[#00FFB3]/20 flex items-center justify-center animate-pulse">
            <span className="h-4 w-4 rounded-full bg-[#00FFB3]" />
          </div>
        </div>
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
      </div>

      <h2 className="font-serif text-xl font-semibold text-[#f5f0e8] mb-2">
        NaLI sedang menyusun laporan...
      </h2>
      <p className="text-sm text-white/45 mb-8">
        Menganalisis bahan dan memetakan klaim...
      </p>

      {/* Prompt preview */}
      {prompt && (
        <div className="w-full mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-xs text-white/40 italic line-clamp-2">
          &ldquo;{prompt}&rdquo;
        </div>
      )}

      {/* Animated steps */}
      <div className="w-full space-y-2 text-left">
        {WORK_STEPS.map((step, idx) => (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-500 ${
              idx === activeStep
                ? "bg-[#00FFB3]/8 text-[#00FFB3]"
                : idx < activeStep
                ? "text-white/50"
                : "text-white/20"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                idx < activeStep
                  ? "bg-[#00FFB3]/20 text-[#00FFB3]"
                  : idx === activeStep
                  ? "bg-[#00FFB3]/30 text-[#00FFB3] animate-pulse"
                  : "bg-white/[0.04] text-white/20"
              }`}
            >
              {idx < activeStep ? "✓" : idx + 1}
            </span>
            <span className="text-xs font-medium">{step}</span>
          </div>
        ))}
      </div>

      {model && (
        <p className="mt-6 text-[10px] italic text-white/25">
          Model: {model}
        </p>
      )}
    </div>
  );
}
