"use client";

import { TriangleAlert } from "lucide-react";

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  onNew: () => void;
}

export function ErrorView({ message, onRetry, onNew }: ErrorViewProps) {
  const isCapacityError = message.includes("Kapasitas AI sedang penuh") || message.includes("ALL_MODELS_UNAVAILABLE");

  return (
    <div className="flex flex-col items-center justify-center pt-12 sm:pt-20 max-w-[440px] mx-auto w-full text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mb-6">
        <TriangleAlert className="h-7 w-7 text-amber-400" />
      </div>

      <h2 className="font-serif text-xl font-semibold text-[#f5f0e8] mb-3">
        Laporan tidak berhasil dibuat
      </h2>

      <p className="text-sm text-white/55 leading-relaxed mb-3">{message}</p>

      {isCapacityError && (
        <p className="text-xs text-white/35 leading-relaxed mb-6">
          Semua model sedang sibuk. Tunggu 1-2 menit lalu coba lagi.
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={onRetry}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#09090b] transition hover:bg-white/90"
        >
          Coba lagi
        </button>
        <button
          onClick={onNew}
          className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Tugas baru
        </button>
      </div>
    </div>
  );
}
