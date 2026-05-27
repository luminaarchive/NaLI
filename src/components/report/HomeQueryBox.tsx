"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const shortcutChips = [
  { label: "🌿 Laporan Observasi", fillText: "Laporan observasi lingkungan: " },
  { label: "🔬 Praktikum Biologi", fillText: "Laporan praktikum biologi: " },
  { label: "📋 Laporan KKN", fillText: "Laporan kegiatan KKN: " },
  { label: "🗺️ Cek Batas Bukti", fillText: "Bantu saya memahami batas bukti untuk laporan yang akan saya siapkan." },
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
    <div className="mt-8 w-full max-w-[720px] mx-auto text-left">
      <form onSubmit={handleSearchSubmit} className="group relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#00FFB3]/10 to-[#5a8a62]/10 opacity-30 blur-md transition duration-500 group-focus-within:opacity-50" />
        
        <div className="relative flex flex-col rounded-2xl border border-[#14261c] bg-[#08100c] p-4 shadow-[0_0_40px_rgba(0,255,179,0.06)] backdrop-blur-xl transition-colors focus-within:border-[#00FFB3]/40">
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
            className="w-full resize-none border-none bg-transparent p-0 text-[15px] font-medium text-[#f5f0e8] outline-none placeholder:text-[#a1b3a8]/50 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px]"
          />
          
          <div className="mt-4 flex items-center justify-between border-t border-[#14261c] pt-3">
            {/* Left: Attachment trigger (disabled, muted) */}
            <div className="flex items-center gap-1.5 text-xs text-[#a1b3a8]/40 select-none cursor-not-allowed">
              <Plus className="h-4 w-4" />
              <span>Lampiran (segera hadir)</span>
            </div>

            {/* Right: Submit Button */}
            <Button
              type="submit"
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#00FFB3] px-4 text-xs font-bold text-[#060b08] transition-all duration-200 hover:bg-[#00e6a1] hover:shadow-[0_0_15px_rgba(0,255,179,0.25)] border-none outline-none cursor-pointer"
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
            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-full border border-[#14261c] bg-[#08100c]/60 px-3.5 text-xs text-[#a1b3a8] transition-all duration-200 hover:border-[#00FFB3]/40 hover:text-[#00FFB3] hover:bg-[#14261c]/30"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-[#a1b3a8]/40 leading-5">
        Kamu tetap diminta menyetujui integritas akademik sebelum draft dibuat.
      </p>
    </div>
  );
}
