"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DitheringShader } from "@/components/ui/dithering-shader";

/* -------------------------------------------------------------------------- */
/*  HomeHero                                                                   */
/*                                                                            */
/*  The restored animated hero background: a WebGL Bayer-dithering wave, tuned */
/*  to NaLI's navy ink. It is the page's one big "how was this made?" moment.  */
/*  Copy sits in NaLI's committed archive-journal voice (Fraunces display +    */
/*  mono), left-aligned and asymmetric rather than the centered template. The  */
/*  wave freezes to a single static frame under prefers-reduced-motion.        */
/* -------------------------------------------------------------------------- */

interface Stat {
  value: string;
  label: string;
}

export function HomeHero({ stats }: { stats: Stat[] }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-[#06131f]">
      <DitheringShader
        shape="wave"
        type="8x8"
        colorBack="#06131f"
        colorFront="#3f86c4"
        pxSize={3}
        speed={reduced ? 0 : 0.5}
        width={1600}
        height={1000}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* legibility wash: darken the lower-left where the copy lives */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(6,19,31,0.92) 0%, rgba(6,19,31,0.7) 38%, rgba(6,19,31,0.12) 72%, rgba(6,19,31,0) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-[1240px] flex-col justify-center px-5 py-24 sm:px-8">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-white/65">
          Jurnal riset terbuka Indonesia
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.6rem,7vw,5.4rem)] font-black leading-[1.02] tracking-[-0.02em] text-white [text-wrap:balance]">
          Bongkar yang tersembunyi,
          <br className="hidden sm:block" /> catat{" "}
          <span className="font-light italic text-[#9cc8ee]">selamanya</span>
        </h1>

        <p className="mt-7 max-w-xl font-mono text-[0.92rem] leading-relaxed text-white/80">
          Kami menelusuri alam, sejarah, dan investigasi Indonesia lewat jurnal,
          arsip, dan dataset terbuka. Tiap cerita dibangun dari bukti, dengan
          tingkat keyakinan dan batasannya ditulis terang-terangan.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/peta-eksplorasi"
            className="bg-white px-6 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[#06131f] transition-colors hover:bg-[#9cc8ee]"
          >
            Mulai jelajah
          </Link>
          <Link
            href="/articles"
            className="border border-white/45 px-6 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Baca artikel
          </Link>
        </div>

        {/* honest, concrete counts (Source First) instead of a metric template */}
        {stats.length > 0 && (
          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums text-white">
                  {s.value}
                </dd>
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/55">
                  {s.label}
                </span>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
