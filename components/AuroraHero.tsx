import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuroraFlow } from "@/components/ui/aurora-flow";
import { NewsletterSignup } from "@/components/NewsletterSignup";

/**
 * Home hero: the flowing aurora (NaLI teal) behind NaLI's own copy. Dark plate,
 * legibility scrim, brand type. Colors and text synced to the site.
 */
export function AuroraHero() {
  return (
    <div className="relative isolate overflow-hidden bg-[#03100d]">
      <AuroraFlow />

      {/* background loop video blended with WebGL shader */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen"
        src="/videos/hero.mp4"
      />

      {/* legibility scrim behind the copy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(95% 75% at 50% 45%, rgba(3,16,13,0.66) 0%, rgba(3,16,13,0.28) 55%, rgba(3,16,13,0.04) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center sm:py-28">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-teal/90">
          Nature · Archive · Lore · Investigation
        </p>
        <h1 className="mt-5 font-display text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-6xl">
          Cerita Indonesia, dibangun dari{" "}
          <em className="font-light italic text-teal">bukti</em>.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          Jurnal riset terbuka tentang alam, sejarah, dan investigasi. Tiap klaim
          membawa sumber, label keyakinan, dan batasannya, jadi kamu tahu persis
          seberapa kuat dasarnya sebelum percaya.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-teal px-7 py-3.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ink-black transition-colors hover:bg-teal-dark hover:text-white"
          >
            Baca artikel
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
          </Link>
          <Link
            href="/metodologi"
            className="border border-white/25 px-7 py-3.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/10"
          >
            Cara kerja kami
          </Link>
        </div>

        <div className="mt-10 w-full max-w-md">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
}
