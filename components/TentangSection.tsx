"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Scale,
  BadgeCheck,
  Library,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

export interface TentangStat {
  value: number;
  label: string;
  suffix?: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  side: "left" | "right";
}

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "Penelusuran",
    desc: "Kami berburu jurnal, arsip, dan laporan lembaga yang bisa ditelusuri ulang, bukan kabar burung.",
    side: "left",
  },
  {
    icon: Scale,
    title: "Pemilahan bukti",
    desc: "Yang sudah terdokumentasi kami pisahkan dari yang masih dugaan, supaya jelas mana yang kuat.",
    side: "left",
  },
  {
    icon: BadgeCheck,
    title: "Label keyakinan",
    desc: "Tiap tulisan membawa satu label seberapa kokoh dasarnya, lengkap dengan daftar sumber.",
    side: "left",
  },
  {
    icon: Library,
    title: "Arsip terbuka",
    desc: "Semua rujukan dikumpulkan di satu arsip yang bisa diperiksa siapa pun, kapan pun.",
    side: "right",
  },
  {
    icon: AlertTriangle,
    title: "Batasan jujur",
    desc: "Kalau bukti belum cukup, kami bilang begitu. Lebih baik jujur ketimbang terdengar pasti tapi keliru.",
    side: "right",
  },
  {
    icon: RefreshCw,
    title: "Koreksi terbuka",
    desc: "Kami bisa salah. Begitu ada koreksi yang berdasar, tulisan diperbarui dan perubahannya dicatat.",
    side: "right",
  },
];

/**
 * Reveals once when scrolled into view. Hardened against BUG-001: if
 * IntersectionObserver is unavailable or never fires, a mount fallback still
 * triggers the count-up so the real numbers are never stuck at 0.
 */
function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    // Safety net: reveal after a short delay even if the observer never fires.
    const fallback = window.setTimeout(() => setInView(true), 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
  return { ref, inView };
}

function Counter({ value, run, ms = 1200 }: { value: number; run: boolean; ms?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, run, ms]);
  return <>{display}</>;
}

function FeatureItem({ feature, delay }: { feature: Feature; delay: number }) {
  const Icon = feature.icon;
  return (
    <div
      className="group motion-safe:animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-dashed border-ink/60 text-ink transition-colors group-hover:bg-ink-wash">
          <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </span>
        <h3 className="font-display text-lg font-bold uppercase tracking-[0.01em] text-ink">
          {feature.title}
        </h3>
      </div>
      <p className="mt-3 pl-14 font-mono text-[0.8rem] leading-relaxed text-gray">
        {feature.desc}
      </p>
    </div>
  );
}

export function TentangSection({ stats }: { stats: TentangStat[] }) {
  const { ref: statsRef, inView } = useInViewOnce<HTMLDivElement>();
  const left = FEATURES.filter((f) => f.side === "left");
  const right = FEATURES.filter((f) => f.side === "right");

  return (
    <section className="container-editorial relative bg-paper/92 py-14 sm:py-20">
      {/* intro */}
      <div className="mx-auto max-w-2xl text-center motion-safe:animate-fade-up">
        <p className="label text-ink/70">Cara kami bekerja</p>
        <p className="mt-4 font-mono text-[0.92rem] leading-relaxed text-gray">
          NaLI dikerjakan satu orang, tapi prosesnya dibuat serapi mungkin:
          menelusuri sumber publik, memisahkan fakta dari dugaan, lalu menuliskannya
          supaya enak dibaca. Enam hal ini kami pegang di setiap tulisan.
        </p>
      </div>

      {/* feature grid: 3 left | center plate | 3 right */}
      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        <div className="space-y-10">
          {left.map((f, i) => (
            <FeatureItem key={f.title} feature={f} delay={i * 120} />
          ))}
        </div>

        {/* center: archive plate */}
        <div className="order-first flex items-start justify-center md:order-none">
          <div className="w-full max-w-xs border border-dashed border-ink/70 bg-paper p-7 text-center motion-safe:animate-fade-up">
            <svg viewBox="0 0 96 96" className="mx-auto h-24 w-24 text-ink" aria-hidden>
              <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" />
              <circle cx="48" cy="48" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
              <text x="48" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor" fontFamily="var(--font-display)">
                NaLI
              </text>
              <text x="48" y="60" textAnchor="middle" fontSize="7.5" letterSpacing="1.5" fill="currentColor" fontFamily="var(--font-mono)">
                BY NATIVE
              </text>
              <path d="M 20 70 Q 48 84 76 70" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="mt-5 font-display text-lg font-bold uppercase text-ink">NaLI by NatIve</p>
            <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-gray">
              Est. MMXXVI
            </p>
            <div className="my-5 hairline" />
            <p className="font-mono text-[0.78rem] leading-relaxed text-gray">
              Proyek solo yang terbuka: menelusuri, menulis, dan menerbitkan secara
              konsisten.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {right.map((f, i) => (
            <FeatureItem key={f.title} feature={f} delay={i * 120} />
          ))}
        </div>
      </div>

      {/* stats, honest counts */}
      <div ref={statsRef} className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-dashed border-ink/60 bg-paper p-5 text-center"
          >
            <p className="font-display text-4xl font-black text-ink">
              <Counter value={s.value} run={inView} />
              {s.suffix}
            </p>
            <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-gray">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA, calm clay band (no loud fill) */}
      <div className="mt-14 flex flex-col items-start justify-between gap-6 border border-dashed border-ink/70 bg-ink-wash/50 p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h3 className="font-display text-2xl font-bold uppercase text-ink">
            Mau lihat cara kerjanya lebih dekat?
          </h3>
          <p className="mt-2 max-w-md font-mono text-[0.82rem] leading-relaxed text-gray">
            Metodologi menjelaskan tiap langkah, dari memilih topik sampai memberi
            label. Punya koreksi atau usulan? Kami senang dikirimi.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/metodologi"
            className="inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
          >
            Baca metodologi
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          </Link>
          <Link
            href="/kontak"
            className="border border-dashed border-ink/70 px-6 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Hubungi
          </Link>
        </div>
      </div>
    </section>
  );
}
