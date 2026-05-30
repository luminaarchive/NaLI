"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Edit3, FileText, MessageSquare, Search } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Edit3,
    title: "Tulis atau tempel bahan kamu",
    description:
      "Salin catatan lapangan, data praktikum, atau hasil survei langsung ke kotak teks. Tidak perlu format khusus.",
    direction: "left" as const,
  },
  {
    icon: Search,
    title: "NaLI analisis bukti",
    description:
      "NaLI membaca bahan kamu, mengidentifikasi klaim, dan menandai mana yang punya bukti kuat dan mana yang kurang.",
    direction: "right" as const,
  },
  {
    icon: FileText,
    title: "Laporan berbasis bukti dibuat",
    description:
      "Draft laporan ilmiah muncul dengan tabel bukti, catatan ketidakpastian, dan label inferensi yang jelas.",
    direction: "left" as const,
  },
  {
    icon: MessageSquare,
    title: "Tanya dan revisi lewat chat",
    description:
      "Tanya NaLI untuk memperjelas bagian tertentu, menambah rekomendasi, atau merevisi kesimpulan.",
    direction: "right" as const,
  },
  {
    icon: Download,
    title: "Unduh sebagai PDF",
    description:
      "Ekspor laporan sebagai PDF berformat akademik, siap dikumpulkan atau dijadikan draft jurnal.",
    direction: "left" as const,
  },
];

const useCases = [
  {
    title: "Laporan Observasi Satwa",
    description:
      "Ideal untuk ranger dan peneliti yang mendokumentasikan satwa liar di lapangan.",
  },
  {
    title: "Laporan Praktikum Biologi",
    description:
      "Untuk mahasiswa yang perlu menyusun laporan lab dengan struktur ilmiah yang benar.",
  },
  {
    title: "Laporan KKN Lingkungan",
    description:
      "Bantu tim KKN menyusun laporan dampak lingkungan berbasis data survei yang dikumpulkan.",
  },
];

function AnimatedStep({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-6 items-start transition-all duration-500 ease-out",
        visible
          ? "opacity-100 translate-x-0"
          : step.direction === "left"
          ? "opacity-0 -translate-x-10"
          : "opacity-0 translate-x-10"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1e3525]/10 border border-[#1e3525]/12">
        <Icon className="h-5 w-5 text-[#1e3525]" />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold text-[#1e3525]/40 uppercase tracking-widest">
            Langkah {index + 1}
          </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-[#1e3525] mb-2">
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-[#4a6455]">{step.description}</p>
      </div>
    </div>
  );
}

function AnimatedCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={cn(
        "rounded-2xl border border-[#1e3525]/12 bg-white/60 p-6 shadow-[0_4px_20px_rgba(30,53,37,0.03)] transition-all duration-500 ease-out",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      <h3 className="font-serif text-base font-bold text-[#1e3525] mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-[#4a6455]">{description}</p>
    </div>
  );
}

export default function LearnReportPage() {
  return (
    <PublicAppShell isHomepage={true}>
      <main className="flex-1 bg-[#f5f0e8] text-[#1e3525]">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-[1040px] px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#1e3525]/12 bg-[#1e3525]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#1e3525] uppercase">
            Panduan
          </span>
          <h1 className="mt-6 font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.15] text-[#1e3525] tracking-tight">
            Cara menggunakan NaLI
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-[#4a6455]">
            Dari catatan mentah ke laporan siap pakai — dalam 3 langkah
          </p>

          {/* Animated demo typing effect */}
          <div className="mx-auto mt-10 max-w-[560px] rounded-2xl border border-[#1e3525]/12 bg-white/60 p-5 text-left shadow-[0_4px_20px_rgba(30,53,37,0.04)]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#4a6455]/60">
              Contoh input
            </p>
            <p className="text-sm text-[#1e3525] leading-relaxed typing-demo">
              Saya mengamati burung elang jawa di lereng Gunung Merbabu pada ketinggian 2.100 mdpl...
            </p>
            <style jsx>{`
              @keyframes typing {
                from { width: 0 }
                to { width: 100% }
              }
              .typing-demo {
                overflow: hidden;
                white-space: nowrap;
                animation: typing 3.5s steps(60, end) infinite alternate;
                border-right: 2px solid #1e3525;
              }
            `}</style>
          </div>
        </section>

        {/* STEPS SECTION */}
        <section className="mx-auto max-w-[760px] px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] mb-14 tracking-tight">
            5 Langkah NaLI
          </h2>
          <div className="space-y-12">
            {steps.map((step, i) => (
              <AnimatedStep key={i} step={step} index={i} />
            ))}
          </div>
        </section>

        {/* USE CASES SECTION */}
        <section className="bg-white/40 border-t border-[#1e3525]/10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] mb-4 tracking-tight">
              Untuk siapa NaLI dibuat?
            </h2>
            <p className="mx-auto mb-12 max-w-[480px] text-center text-sm text-[#4a6455] leading-relaxed">
              Pelajari bagaimana NaLI membantu berbagai profil pengguna.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {useCases.map((uc, i) => (
                <AnimatedCard key={i} title={uc.title} description={uc.description} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[560px]">
            <h2 className="font-serif text-2xl font-bold text-[#1e3525] mb-4">
              Siap memulai?
            </h2>
            <p className="mb-8 text-sm text-[#4a6455] leading-relaxed">
              Buat laporan pertamamu sekarang dari catatan lapangan atau data observasi.
            </p>
            <Link
              href="/create-report"
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#162d1d] sm:w-auto"
            >
              Mulai Buat Laporan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
