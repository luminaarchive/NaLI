"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, FileText, FlaskConical, Leaf, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeQueryBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<"draft_from_materials" | "start_from_zero" | null>(null);

  // Inferred mode helper
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

    if (selectedMode) return selectedMode;
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
      }),
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
    <div className="mt-8 w-full max-w-[680px]">
      <form onSubmit={handleSearchSubmit} className="group relative">
        <div className="flex min-h-[72px] flex-col gap-2 rounded-lg border border-[#d9d2c3] bg-white p-2 shadow-[0_12px_32px_rgba(16,35,27,0.06)] transition-colors focus-within:border-[#315f45] sm:flex-row sm:items-center">
          <div className="flex w-full flex-1 items-center gap-2 px-3">
            <Search className="h-5 w-5 shrink-0 text-[#6a756e]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tulis topik laporanmu..."
              aria-label="Tulis topik laporanmu"
              className="w-full border-none bg-transparent py-3 text-[15px] font-medium text-[#10231b] outline-none placeholder:text-[#7b847e]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[52px] w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[#315f45] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#274d38] sm:w-auto"
          >
            Buat Laporan
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      <p className="mt-3 text-center text-xs text-[#6a756e]">
        Contoh: observasi kualitas air sungai di sekitar sekolah
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-[#315f45]">
        <button
          type="button"
          onClick={() => selectChip("Laporan Observasi", "draft_from_materials", "Laporan observasi lingkungan: ")}
          className={cn(
            "inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#d9d2c3] bg-white/70 px-3 transition-colors hover:bg-[#eef2e8]",
            selectedMode === "draft_from_materials" && "border-[#9eb99e] bg-[#eef2e8]",
          )}
        >
          <Leaf className="h-3.5 w-3.5" />
          Laporan Observasi
        </button>

        <button
          type="button"
          onClick={() => selectChip("Praktikum Biologi", "draft_from_materials", "Laporan praktikum biologi: ")}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#d9d2c3] bg-white/70 px-3 transition-colors hover:bg-[#eef2e8]"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Praktikum Biologi
        </button>

        <button
          type="button"
          onClick={() => selectChip("Laporan KKN", "draft_from_materials", "Laporan kegiatan KKN: ")}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#d9d2c3] bg-white/70 px-3 transition-colors hover:bg-[#eef2e8]"
        >
          <FileText className="h-3.5 w-3.5" />
          Laporan KKN
        </button>

        <button
          type="button"
          onClick={() =>
            selectChip(
              "Cek Batas Bukti",
              "start_from_zero",
              "Bantu saya memahami batas bukti untuk laporan yang akan saya siapkan.",
            )
          }
          className={cn(
            "inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-md border border-[#d9d2c3] bg-white/70 px-3 transition-colors hover:bg-[#eef2e8]",
            selectedMode === "start_from_zero" && "border-[#9eb99e] bg-[#eef2e8]",
          )}
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Cek Batas Bukti
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-[500px] text-center text-xs leading-5 text-[#6a756e]">
        Kamu tetap diminta menyetujui integritas akademik sebelum draft dibuat.
      </p>
    </div>
  );
}
