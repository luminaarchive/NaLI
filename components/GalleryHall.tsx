"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type GalleryAct = {
  key: "alam" | "sejarah" | "investigasi";
  index: string;
  kicker: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  featured: { title: string; slug: string } | null;
};

/**
 * The gallery: a real classical arcade (free-licensed Pixabay cutout,
 * public/textures/arcade.png — transparent arch openings) color-graded to warm
 * marble, with a living sea behind the arches. Each scroll act crossfades to
 * different free-licensed sea footage (public/videos/{act}.mp4):
 *   alam        — turquoise coast, misty headland (day)
 *   sejarah     — golden god-rays over the water (dusk)
 *   investigasi — starlit sea with bioluminescence (night)
 */
const VIDEOS: Record<GalleryAct["key"], string> = {
  alam: "/videos/alam.mp4",
  sejarah: "/videos/sejarah.mp4",
  investigasi: "/videos/investigasi.mp4",
};

export function GalleryHall({ acts }: { acts: GalleryAct[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        const p = total > 0 ? scrolled / total : 0;
        stage.style.setProperty("--p", String(p));
        const idx = Math.min(acts.length - 1, Math.max(0, Math.floor(p * acts.length * 0.9999)));
        if (idx !== activeRef.current) {
          activeRef.current = idx;
          setActive(idx);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [acts.length]);

  // keep videos honest: play the active act, pause the rest
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.querySelectorAll<HTMLVideoElement>("video[data-act-video]").forEach((v) => {
      if (v.dataset.actVideo === acts[active].key) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, acts]);

  const goToAct = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.offsetTop + ((i + 0.5) / acts.length) * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${acts.length * 100 + 40}vh` }}
      aria-label="Galeri NaLI — Alam, Sejarah, Investigasi"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={stageRef}
          className="gallery-stage relative h-full w-full bg-[#07100f]"
          data-act={acts[active].key}
        >
          {/* ====== THE SEA — living footage behind the arches, one per act ====== */}
          {acts.map((act) => (
            <video
              key={act.key}
              data-act-video={act.key}
              className={`gh-sky ${act.key} absolute inset-0 h-full w-full object-cover`}
              src={VIDEOS[act.key]}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
            />
          ))}

          {/* ====== THE ARCADE — warm-graded marble, transparent arch openings ====== */}
          <div className="gh-arcade absolute inset-0" aria-hidden>
            <Image
              src="/textures/arcade.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom [filter:sepia(0.48)_saturate(1.3)_brightness(1.24)_contrast(1.02)]"
            />
            {/* oxblood floor grade (reference's red carpet) */}
            <div
              className="absolute inset-x-0 bottom-0 h-[30%] mix-blend-multiply"
              style={{
                background:
                  "linear-gradient(to top, rgba(122,28,14,0.92) 0%, rgba(140,53,32,0.55) 55%, rgba(140,53,32,0) 100%)",
              }}
            />
            {/* warm gilded light from above */}
            <div
              className="absolute inset-x-0 top-0 h-[26%]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(212,171,85,0.32), rgba(212,171,85,0))",
                mixBlendMode: "soft-light",
              }}
            />
          </div>

          {/* ====== mood grades per act ====== */}
          <div className="gh-grade alam absolute inset-0 bg-[#1f7d63]" aria-hidden />
          <div className="gh-grade sejarah absolute inset-0 bg-[#6b3f12]" aria-hidden />
          <div className="gh-grade investigasi absolute inset-0 bg-[#04161f]" aria-hidden />

          {/* vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 42%, rgba(0,0,0,0) 58%, rgba(8,6,2,0.42) 100%)",
            }}
            aria-hidden
          />

          {/* film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />

          {/* ====== NaLI tablet — engraved cartouche over the grand arch ====== */}
          <div className="absolute left-1/2 top-[4.5rem] z-20 -translate-x-1/2 sm:top-20">
            <div
              className="rounded-lg border-2 border-[#b08938]/70 px-7 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)]"
              style={{
                background: "linear-gradient(to bottom, #f8f4e9, #e7decb)",
              }}
            >
              <span className="font-display text-2xl font-semibold tracking-wide text-[#9a7531] sm:text-3xl">
                NaLI
              </span>
            </div>
          </div>

          {/* ====== tableaus — one per act ====== */}
          {acts.map((act) => (
            <div
              key={act.key}
              className={`gh-tableau ${act.key} absolute left-1/2 top-1/2 w-[min(88vw,420px)] -translate-x-1/2 -translate-y-1/2`}
            >
              <div className="rounded-2xl border border-[#d9b25f]/30 bg-gradient-to-b from-black/35 via-black/40 to-black/55 px-6 py-7 text-center shadow-[0_28px_80px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md sm:px-8">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-[#f0d9a0]">
                  {act.index} — {act.kicker}
                </p>
                <h2 className="mt-3 font-display text-6xl font-semibold leading-none text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-7xl">
                  {act.title}
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/85">
                  {act.desc}
                </p>

                {act.featured && (
                  <Link
                    href={`/articles/${act.featured.slug}`}
                    className="mx-auto mt-6 block max-w-xs rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left transition-colors hover:border-teal hover:bg-white/10"
                  >
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-teal">
                      Tulisan pilihan
                    </span>
                    <span className="mt-1 block font-display text-[0.95rem] leading-snug text-white">
                      {act.featured.title}
                    </span>
                  </Link>
                )}

                <Link
                  href={act.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-2.5 text-sm font-semibold text-ink-black transition-transform hover:scale-[1.04] hover:bg-teal"
                >
                  {act.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}

          {/* ====== act navigation (right) ====== */}
          <nav className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 sm:right-8 sm:block" aria-label="Pilih pilar">
            <ul className="flex flex-col gap-5">
              {acts.map((act, i) => (
                <li key={act.key}>
                  <button
                    type="button"
                    onClick={() => goToAct(i)}
                    className="group flex items-center justify-end gap-3"
                    aria-current={active === i}
                  >
                    <span
                      className={`font-mono text-[0.62rem] uppercase tracking-[0.2em] transition-opacity ${
                        active === i ? "text-white opacity-100" : "text-white/50 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {act.title}
                    </span>
                    <span
                      className={`gh-nav-dot block h-2.5 w-2.5 rounded-full ring-1 ring-white/60 ${
                        active === i ? "scale-125 bg-teal" : "bg-white/30"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* scroll hint */}
          <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-white/65">
              Gulir menyusuri galeri
            </span>
            <span className="h-6 w-px animate-pulse bg-white/50" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
