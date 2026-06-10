import Link from "next/link";
import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[600px] items-center overflow-hidden bg-ink-black text-white">
      {/* video — founder drops public/videos/hero.mp4; layers below are the fallback */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/brand/png-exports/nali-mark-1920x1920.png"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        aria-hidden
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* designed fallback / atmosphere — looks intentional even with no video */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 15% 20%, #0f3b32 0%, #0A0A0A 55%, #0A0A0A 100%)",
        }}
        aria-hidden
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 600"
      >
        {/* topographic contour motif — nods to field/maps */}
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse
            key={i}
            cx={620}
            cy={140}
            rx={90 + i * 70}
            ry={60 + i * 48}
            fill="none"
            stroke="#2DD4A7"
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* locked spec overlay */}
      <div className="absolute inset-0 bg-teal opacity-20" aria-hidden />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10,10,10,0.75), transparent 55%)",
        }}
        aria-hidden
      />

      {/* content */}
      <div className="container-editorial relative z-10">
        <div className="max-w-3xl">
          <p className="label animate-fade-in text-teal-bg/90">
            Nature · Archive · Lore · Investigation
          </p>
          <h1 className="mt-5 animate-fade-up font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Membongkar yang
            <br />
            tersembunyi dari{" "}
            <span className="text-teal">Indonesia</span>.
          </h1>
          <p
            className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-white/85 sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {SITE.tagline}
          </p>
          <div
            className="mt-9 flex animate-fade-up flex-wrap items-center gap-3"
            style={{ animationDelay: "220ms" }}
          >
            <Link
              href="/articles"
              className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-ink-black transition-transform hover:scale-[1.03] hover:bg-teal-dark hover:text-white"
            >
              Baca artikel
            </Link>
            <Link
              href="/manifesto"
              className="rounded-full border border-white/25 px-6 py-3 text-sm text-white/90 transition-colors hover:border-teal hover:text-teal"
            >
              Baca manifesto
            </Link>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <span className="label text-white/40">Gulir untuk menjelajah</span>
      </div>
    </section>
  );
}
