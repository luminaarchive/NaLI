"use client";

import { useEffect, useState } from "react";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { NewsletterSignup } from "@/components/NewsletterSignup";

/**
 * Home hero: the 21st.dev dithering wave shader, tuned to NaLI's brand, * teal wave (#2DD4A7) over deep ink, Bayer 8x8 dithering, museum-slow.
 */
export function WaveHero() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="relative isolate overflow-hidden bg-[#03100d]">
      <DitheringShader
        shape="wave"
        type="8x8"
        colorBack="#03100d"
        colorFront="#2DD4A7"
        pxSize={3}
        speed={reduced ? 0 : 0.6}
        width={1600}
        height={1000}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {/* legibility scrim behind the copy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 45%, rgba(3,16,13,0.55) 0%, rgba(3,16,13,0.15) 60%, rgba(3,16,13,0) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[82svh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-teal/90">
          Nature · Archive · Lore · Investigation
        </p>
        <h1 className="mt-5 font-sans text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Bongkar yang tersembunyi, catat{" "}
          <em className="font-light italic text-teal">selamanya</em>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75">
          Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia.
          Kami membaca jurnal, arsip, laporan lembaga, dataset, dan dokumentasi
          lapangan pihak ketiga, setiap klaim membawa sumber, label keyakinan,
          dan batasan.
        </p>
        <div className="mt-8 w-full max-w-md">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
}
