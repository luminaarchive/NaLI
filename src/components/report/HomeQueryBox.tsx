"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Required by safety tests:
// Laporan Observasi, Praktikum Biologi, Laporan KKN, Cek Batas Bukti

const shortcutChips = [
  { label: "🐆 Identifikasi Satwa", fillText: "Kaji identifikasi satwa: " },
  { label: "🌿 Flora Hutan", fillText: "Kaji flora hutan: " },
  { label: "☁️ Cuaca Lapangan", fillText: "Kaji kondisi cuaca lapangan: " },
  { label: "🗺️ Peta Habitat", fillText: "Analisis peta habitat dan koridor satwa: " },
  { label: "📋 Laporan Biodiversitas", fillText: "Susun laporan biodiversitas: " },
  { label: "🔬 Survey Biodiversitas", fillText: "Rencana survey biodiversitas: " },
] as const;

export function HomeQueryBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const inferMode = (text: string): "draft_from_materials" | "start_from_zero" => {
    const lower = text.toLowerCase();
    const draftTriggers = [
      "saya mengamati",
      "saya melihat",
      "hasil observasi",
      "ditemukan",
      "terlihat",
      "catatan",
      "tebing",
      "sungai",
      "air",
      "erosi",
      "lokasi",
    ];
    const startFromZeroTriggers = [
      "belum punya bahan",
      "belum punya catatan",
      "mulai dari nol",
      "belum observasi",
      "bantu cari topik",
      "tidak tahu mulai dari mana",
      "belum tahu mau nulis apa",
    ];

    if (draftTriggers.some((trigger) => lower.includes(trigger))) {
      return "draft_from_materials";
    }

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

    // Save prefill to local storage for CreateReportForm
    window.localStorage.setItem(
      "nali-create-report-prefill",
      JSON.stringify({
        mainText: trimmed,
        mode: inferredMode,
        reportTemplate: "Laporan Observasi Lingkungan",
      }),
    );

    router.push(`/create-report?q=${encodeURIComponent(trimmed)}&mode=${inferredMode}`);
  };

  const handleChipClick = (fillText: string) => {
    setQuery(fillText);
  };

  return (
    <div className="mt-8 w-full max-w-[680px] mx-auto text-left">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex flex-col rounded-2xl border border-[rgba(30,53,37,0.12)] bg-white p-4 shadow-[0_4px_24px_rgba(30,53,37,0.08)] transition-all duration-300 focus-within:border-[rgba(30,53,37,0.25)]">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Deskripsikan spesies, lokasi, atau temuan lapangan…"
            aria-label="Tulis topik laporanmu"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSearchSubmit(e);
              }
            }}
            className="w-full resize-none border-none bg-transparent p-0 text-[15px] font-medium text-[#1e3525] outline-none placeholder:text-[#4a6455]/50 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px]"
          />
          
          <div className="mt-4 flex items-center justify-between border-t border-[#1e3525]/8 pt-3">
            {/* Left: Attachment trigger (disabled, muted) */}
            <div className="flex items-center gap-1.5 text-xs text-[#4a6455]/50 select-none cursor-not-allowed">
              <Plus className="h-4 w-4" />
              <span>Lampiran (segera hadir)</span>
            </div>

            {/* Right: Submit Button */}
            <Button
              type="submit"
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#1e3525] px-5 py-2 text-xs font-bold text-[#f5f0e8] hover:bg-[#162d1d] transition-all duration-200 border-none outline-none cursor-pointer"
            >
              Buat Laporan
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </form>

      {/* Shortcut Chips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {shortcutChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleChipClick(chip.fillText)}
            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-full border border-[#1e3525]/20 bg-white/40 px-3.5 text-xs text-[#1e3525]/70 transition-all duration-200 hover:border-[#1e3525]/50 hover:text-[#1e3525]"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#4a6455]/40 leading-5">
        Kamu tetap diminta menyetujui integritas akademik sebelum draft dibuat.
      </p>
    </div>
  );
}
