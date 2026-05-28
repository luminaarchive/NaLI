"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Table2,
} from "lucide-react";

function useReveal(threshold = 0.15) {
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
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FeatureText({
  body,
  href,
  link,
  title,
}: {
  body: string;
  href: string;
  link: string;
  title: string;
}) {
  return (
    <div className="max-w-[480px]">
      <h2
        className="text-[34px] font-semibold tracking-normal text-white lg:text-[44px]"
        style={{ lineHeight: 1.15 }}
      >
        {title}
      </h2>
      <p className="mt-5 text-[16px] leading-[1.7] text-white/60 lg:text-[17px]">
        {body}
      </p>
      <Link
        className="mt-6 inline-flex items-center gap-2 text-[16px] font-medium text-[#06b6d4] transition-opacity hover:opacity-90"
        href={href}
      >
        {link}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function MockupShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
      {children}
    </div>
  );
}

function UploadDraftMockup() {
  return (
    <MockupShell>
      <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
        <FileText className="mx-auto h-8 w-8 text-white/40" />
        <p className="mt-3 text-sm font-medium text-white/80">
          Tempel catatan, URL sumber, atau konteks lokasi
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-3 sm:px-4">
          <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white/90">
              Catatan observasi sungai
            </p>
            <p className="text-[11px] text-white/40">Bahan teks pengguna</p>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-300">
            labeled
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-3 sm:px-4">
          <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white/90">
              URL sumber dari pengguna
            </p>
            <p className="text-[11px] text-white/40">Belum diverifikasi otomatis</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-1 text-[11px] font-medium text-cyan-300">
            review needed
          </span>
        </div>
      </div>

      <button className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 text-sm font-semibold text-white transition hover:brightness-110">
        Generate Evidence-Based Draft →
      </button>
    </MockupShell>
  );
}

function StatusBadge({ tone, children }: { tone: "green" | "amber" | "gray"; children: ReactNode }) {
  const className =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-300"
      : tone === "amber"
        ? "bg-amber-500/15 text-amber-300"
        : "bg-white/[0.08] text-white/50";

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${className}`}>
      {children}
    </span>
  );
}

function EvidenceMockup() {
  const rows = [
    {
      claim: "Populasi menurun 12%...",
      source: "Catatan patrol",
      status: <StatusBadge tone="green">Labeled</StatusBadge>,
    },
    {
      claim: "Habitat terfragmentasi...",
      source: "Foto evidence",
      status: <StatusBadge tone="amber">User check</StatusBadge>,
    },
    {
      claim: "Spesies endemik lokal...",
      source: "URL pengguna",
      status: <StatusBadge tone="gray">Pending</StatusBadge>,
    },
  ];

  return (
    <MockupShell>
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <Table2 className="h-5 w-5 shrink-0 text-cyan-400" />
        <span className="text-[14px] font-semibold text-white/90">Source Notes</span>
        <span className="ml-auto rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 font-mono text-[10px] text-cyan-300">
          Hash: 0x8f2a...9c
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/[0.08]">
        <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(72px,0.85fr)_minmax(78px,0.72fr)] bg-white/[0.08] text-[10px] sm:text-[11px]">
          <div className="bg-white/[0.02] px-2 py-2 font-semibold uppercase tracking-[0.12em] text-white/40 sm:px-3">
            CLAIM
          </div>
          <div className="bg-white/[0.02] px-2 py-2 font-semibold uppercase tracking-[0.12em] text-white/40 sm:px-3">
            SOURCE
          </div>
          <div className="bg-white/[0.02] px-2 py-2 font-semibold uppercase tracking-[0.12em] text-white/40 sm:px-3">
            STATUS
          </div>
          {rows.map((row) => (
            <div className="contents" key={row.claim}>
              <div className="min-w-0 border-t border-white/[0.04] bg-[#0f1117] px-2 py-3 text-[11px] text-white/75 sm:px-3 sm:text-[12px]">
                <span className="line-clamp-2">{row.claim}</span>
              </div>
              <div className="min-w-0 border-t border-white/[0.04] bg-[#0f1117] px-2 py-3 text-[11px] text-white/[0.65] sm:px-3 sm:text-[12px]">
                <span className="line-clamp-2">{row.source}</span>
              </div>
              <div className="min-w-0 border-t border-white/[0.04] bg-[#0f1117] px-2 py-3">
                {row.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}

function ExportMockup() {
  const checklist = [
    "Source notes labeled",
    "Evidence summary included",
    "Academic integrity confirmed",
    "Review complete",
  ];

  return (
    <MockupShell>
      <div className="text-[16px] font-semibold text-white">Export Gate</div>
      <div className="mt-5 space-y-3">
        {checklist.map((item) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3"
            key={item}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="text-[13px] font-medium text-white/75">{item}</span>
          </div>
        ))}
      </div>
      <div className="my-5 h-px bg-white/[0.08]" />
      <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-semibold text-white/50">
        <Download className="h-4 w-4" />
        PDF/DOCX terkunci di CP1
      </div>
    </MockupShell>
  );
}

function FeatureBlock({
  body,
  href,
  link,
  mockup,
  reversed = false,
  title,
}: {
  body: string;
  href: string;
  link: string;
  mockup: ReactNode;
  reversed?: boolean;
  title: string;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      className="mx-auto grid max-w-[1180px] items-center gap-8 px-5 md:grid-cols-[minmax(0,480px)_minmax(0,560px)] md:gap-16 md:px-10"
      ref={ref}
    >
      <div
        className={`transition-all duration-700 ${reversed ? "md:order-2" : ""}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <FeatureText body={body} href={href} link={link} title={title} />
      </div>

      <div
        className={`mt-0 transition-all delay-150 duration-700 md:mt-0 ${
          reversed ? "md:order-1" : ""
        }`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <div className="mt-8 md:mt-0">{mockup}</div>
      </div>
    </div>
  );
}

export function CodexFeatureShowcase() {
  return (
    <div className="space-y-[72px] bg-[#060b08] md:space-y-24">
      <FeatureBlock
        body="Dari catatan teks, URL sumber, lokasi, dan ringkasan bahan, NaLI mengubah input pengguna menjadi draft berbasis evidensi yang siap direview."
        href="/create-report"
        link="Mulai draft sekarang"
        mockup={<UploadDraftMockup />}
        title="Masukkan catatan. Dapatkan draft otomatis."
      />

      <FeatureBlock
        body="Evidence Engine NaLI menautkan klaim ke sumber, menandai data yang memerlukan verifikasi mandiri, dan menjaga transparansi sebelum export."
        href="/learn-report"
        link="Lihat evidence engine"
        mockup={<EvidenceMockup />}
        reversed
        title="Setiap klaim dilacak. Setiap sumber terlihat."
      />

      <FeatureBlock
        body="Preview tetap terbuka untuk diperiksa. PDF/DOCX publik tetap terkunci di CP1 dan checkout belum aktif."
        href="/pricing"
        link="Pelajari export gate"
        mockup={<ExportMockup />}
        title="Review dulu. Export saat siap."
      />
    </div>
  );
}
