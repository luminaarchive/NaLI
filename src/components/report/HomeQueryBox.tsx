"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, FileText, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeQueryBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<"draft_from_materials" | "start_from_zero" | null>(null);

  // Inferred mode helper
  const inferMode = (text: string): "draft_from_materials" | "start_from_zero" => {
    if (selectedMode) return selectedMode;
    const lower = text.toLowerCase();
    const startFromZeroTriggers = [
      "belum punya bahan",
      "belum punya catatan",
      "mulai dari nol",
      "belum observasi",
      "bantu cari topik",
      "tidak tahu mulai dari mana",
    ];
    if (startFromZeroTriggers.some((trigger) => lower.includes(trigger))) {
      return "start_from_zero";
    }
    return "draft_from_materials";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/create-report");
      return;
    }

    const inferredMode = inferMode(trimmed);

    // Save prefill to local storage using the correct key expected by CreateReportForm
    window.localStorage.setItem(
      "nali-create-report-prefill",
      JSON.stringify({
        mainText: trimmed,
        mode: inferredMode,
        reportTemplate: "Laporan Observasi Lingkungan",
      })
    );

    router.push(`/create-report?q=${encodeURIComponent(trimmed)}&mode=${inferredMode}`);
  };

  const selectChip = (label: string, mode: "draft_from_materials" | "start_from_zero", textToFill?: string) => {
    setSelectedMode(mode);
    if (textToFill) {
      setQuery(textToFill);
    }
  };

  return (
    <div className="mt-5 w-full max-w-[640px] px-4">
      <form onSubmit={handleSearchSubmit} className="relative group">
        {/* Glow backdrop on hover */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#10b981]/20 via-[#7c3aed]/20 to-[#06b6d4]/20 opacity-30 blur-md transition duration-500 group-hover:opacity-60 group-focus-within:opacity-70" />

        <div className="relative flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#07090e]/60 p-1.5 shadow-2xl backdrop-blur-xl transition duration-300 focus-within:border-white/[0.15] focus-within:bg-[#07090e]/85">
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-5 w-5 shrink-0 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tulis catatan, topik, lokasi, atau sumbermu..."
              className="w-full bg-transparent text-[15px] font-medium text-white placeholder-white/35 outline-none border-none py-2"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-white px-4 text-sm font-semibold text-[#09090b] transition duration-200 hover:bg-white/90 active:scale-95 cursor-pointer"
          >
            Mulai
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/50">
        <button
          type="button"
          onClick={() => selectChip("Punya catatan", "draft_from_materials")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition duration-200 hover:bg-white/[0.06] hover:text-white cursor-pointer",
            selectedMode === "draft_from_materials" && "border-[#10b981]/30 bg-[#10b981]/5 text-white"
          )}
        >
          <FileText className="h-3.5 w-3.5 text-[#10b981]" />
          Punya catatan
        </button>

        <button
          type="button"
          onClick={() => selectChip("Belum punya bahan", "start_from_zero", "Aku mau mulai laporan tapi belum punya bahan.")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition duration-200 hover:bg-white/[0.06] hover:text-white cursor-pointer",
            selectedMode === "start_from_zero" && "border-[#7c3aed]/30 bg-[#7c3aed]/5 text-white"
          )}
        >
          <Compass className="h-3.5 w-3.5 text-[#7c3aed]" />
          Belum punya bahan
        </button>

        <button
          type="button"
          onClick={() => selectChip("Observasi lingkungan", "draft_from_materials", "Laporan observasi lingkungan dan keanekaragaman hayati")}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition duration-200 hover:bg-white/[0.06] hover:text-white cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#06b6d4]" />
          Observasi lingkungan
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-3.5 text-center text-xs leading-5 text-white/40 max-w-[480px] mx-auto">
        Punya bahan? NaLI buatkan draf. Belum punya bahan? NaLI buatkan panduan mulai.
      </p>
    </div>
  );
}
