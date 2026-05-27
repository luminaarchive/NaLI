"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Map, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StreamChunk } from "@/lib/types/session";

const QUICK_CHIPS = [
  { label: "🐅 Satwa Kritis (CR)", query: "Kaji status dan populasi satwa kritis (CR) di Indonesia:" },
  { label: "🦜 Burung Endemik", query: "Daftar burung endemik Indonesia beserta sebaran dan habitatnya:" },
  { label: "🐘 Mamalia Besar", query: "Kaji wilayah jelajah dan status konservasi mamalia besar di Indonesia:" },
  { label: "🐍 Reptil & Amfibi", query: "Analisis habitat dan keanekaragaman reptil dan amfibi di Indonesia:" },
  { label: "🌺 Flora Langka", query: "Daftar flora langka dilindungi di Indonesia beserta ancaman kelestariannya:" },
  { label: "🏔️ Spesies Gunung", query: "Identifikasi keanekaragaman spesies di kawasan pegunungan Indonesia:" },
] as const;

export function SpeciesClient() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    if (draftTriggers.some((trigger) => lower.includes(trigger))) {
      return "draft_from_materials";
    }
    return "start_from_zero";
  };

  const fallbackToCreateReport = (trimmed: string) => {
    const inferredMode = inferMode(trimmed);
    window.localStorage.setItem(
      "nali-create-report-prefill",
      JSON.stringify({
        mainText: inferredMode === "draft_from_materials" ? trimmed : "",
        mode: inferredMode,
        reportTemplate: "Laporan Observasi Lingkungan",
        topic: inferredMode === "start_from_zero" ? trimmed : "",
      }),
    );
    router.push(`/create-report?q=${encodeURIComponent(trimmed)}&mode=${inferredMode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isCreating) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { fallback?: boolean; error?: string };
        if (errData.fallback) {
          fallbackToCreateReport(trimmed);
          return;
        }
        throw new Error(errData.error ?? "Gagal memulai riset spesies");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        fallbackToCreateReport(trimmed);
        return;
      }

      let redirected = false;
      while (!redirected) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6)) as StreamChunk;
            if (chunk.type === "session_created" && chunk.sessionId) {
              void reader.cancel();
              router.push(`/s/${chunk.sessionId}`);
              redirected = true;
              break;
            }
            if (chunk.type === "error") {
              throw new Error(chunk.error ?? "Terjadi kesalahan");
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && (parseErr.message.includes("Terjadi") || parseErr.message.includes("Gagal"))) {
              throw parseErr;
            }
          }
        }
      }

      if (!redirected) {
        fallbackToCreateReport(trimmed);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Gagal memulai riset spesies. Coba lagi.");
      setIsCreating(false);
    }
  };

  const handleChipClick = (val: string) => {
    setQuery(val);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative mx-auto max-w-[680px]">
        <div className="flex flex-col rounded-2xl border border-[#14261c] bg-[#08100c] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] focus-within:border-[#00FFB3]/30">
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: Panthera tigris sumatrae, Orangutan Kalimantan, burung endemik Sulawesi..."
            aria-label="Cari satwa atau topik"
            rows={3}
            disabled={isCreating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full resize-none border-none bg-transparent p-0 text-[15px] font-medium text-[#f5f0e8] outline-none placeholder:text-[#a1b3a8]/40 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px]"
          />
          <div className="mt-4 flex items-center justify-between border-t border-[#14261c] pt-3">
            <div className="flex items-center gap-1.5 text-xs text-[#a1b3a8]/40">
              <HelpCircle className="h-4 w-4" />
              <span>NaLI Intelligence Fusion</span>
            </div>
            <Button
              type="submit"
              disabled={isCreating || !query.trim()}
              className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#00FFB3] px-5 py-2 text-xs font-bold text-[#060b08] hover:bg-[#00e6a1] transition-all duration-200 border-none outline-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border border-[#060b08]/40 border-t-[#060b08]" />
                  Memproses…
                </span>
              ) : (
                <>
                  Mulai Riset
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </>
              )}
            </Button>
          </div>
        </div>
        {createError && <p className="mt-2 text-center text-xs text-red-500">{createError}</p>}
      </form>

      {/* Quick Access Chips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-[760px] mx-auto">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            disabled={isCreating}
            onClick={() => handleChipClick(chip.query)}
            className="inline-flex min-h-[36px] cursor-pointer items-center justify-center rounded-full border border-[#14261c] bg-[#0b1a12] px-3.5 text-xs text-[#a1b3a8] transition-all duration-200 hover:border-[#00FFB3]/40 hover:text-[#f5f0e8] disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Capabilities Section */}
      <div className="mt-20 border-t border-[#14261c] pt-16">
        <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] sm:text-3xl mb-10">
          Cakupan Analisis Inteligensi Spesies
        </h2>
        <div className="grid gap-6 sm:grid-cols-3 max-w-[1040px] mx-auto">
          <div className="group relative overflow-hidden rounded-2xl border border-[#14261c] bg-[#08100c] p-6 transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] hover:shadow-[0_0_24px_rgba(0,255,179,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40 text-[#00FFB3] group-hover:bg-[#00FFB3]/10">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#f5f0e8]">Status Konservasi</h3>
            <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">
              Status IUCN terkini, populasi estimasi, dan tren populasi dari data ilmiah.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-[#14261c] bg-[#08100c] p-6 transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] hover:shadow-[0_0_24px_rgba(0,255,179,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40 text-[#00FFB3] group-hover:bg-[#00FFB3]/10">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#f5f0e8]">Habitat & Distribusi</h3>
            <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">
              Sebaran geografis, tipe habitat, elevasi, dan kawasan perlindungan yang relevan.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-[#14261c] bg-[#08100c] p-6 transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] hover:shadow-[0_0_24px_rgba(0,255,179,0.05)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40 text-[#00FFB3] group-hover:bg-[#00FFB3]/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#f5f0e8]">Ancaman & Tekanan</h3>
            <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">
              Ancaman utama: deforestasi, perburuan, perdagangan ilegal, dan perubahan iklim.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-20 border-t border-[#14261c] pt-16">
        <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] sm:text-3xl mb-12">
          Cara Kerja Inteligensi Spesies
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-[840px] mx-auto text-center">
          {[
            {
              num: "01",
              title: "Input Spesies atau Topik",
              text: "Masukkan nama ilmiah, nama lokal, atau topik konservasi yang ingin diteliti."
            },
            {
              num: "02",
              title: "NaLI Memproses",
              text: "Intelligence Fusion Logic menggabungkan data lapangan, literatur ilmiah, dan konteks lokal Indonesia."
            },
            {
              num: "03",
              title: "Terima Laporan",
              text: "Laporan terstruktur dengan sitasi, batas bukti yang jelas, dan rekomendasi aksi."
            }
          ].map((step) => (
            <div key={step.num} className="space-y-3">
              <span className="block font-serif text-4xl font-extrabold text-[#00FFB3] opacity-60">
                {step.num}
              </span>
              <h3 className="font-serif text-base font-bold text-[#f5f0e8]">{step.title}</h3>
              <p className="text-xs leading-6 text-[#a1b3a8] max-w-[260px] mx-auto">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pilot Context Strip */}
      <div className="mt-20 border-t border-[#14261c] pt-10 text-center">
        <p className="text-xs tracking-wider text-[#a1b3a8]/50">
          Data kontekstual tersedia untuk: Semeru &middot; Merbabu &middot; Lawu &middot; Sindoro-Sumbing &middot; Rinjani
        </p>
      </div>
    </div>
  );
}
