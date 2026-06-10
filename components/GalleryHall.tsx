"use client";

import { useEffect, useRef, useState } from "react";
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

/* ---- scene geometry (viewBox 1600 x 1000) ---- */
const VB_W = 1600;
const VB_H = 1000;
const HORIZON = 540;
const FLOOR_Y = 792;
const FRIEZE_TOP = 150;
const FRIEZE_BOT = 248;

const PIERS = [140, 470, 1130, 1460]; // centre x of the four marble piers
const PIER_HALF = 46;

// arch openings: [xa, xb, springY]
const ARCHES = {
  left: { xa: 186, xb: 424, spring: 470, top: FRIEZE_BOT },
  center: { xa: 516, xb: 1084, spring: 470, top: FRIEZE_TOP },
  right: { xa: 1176, xb: 1414, spring: 470, top: FRIEZE_BOT },
};

function spandrel(xa: number, xb: number, topY: number, springY: number): string {
  const r = (xb - xa) / 2;
  // rectangle whose lower edge is the arch curve (opening sits below, showing sky)
  return `M ${xa} ${topY} H ${xb} V ${springY} A ${r} ${r} 0 0 0 ${xa} ${springY} Z`;
}

// deterministic star field (seeded LCG so SSR === CSR)
function stars(count: number) {
  let s = 1337;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: count }, () => ({
    x: rnd() * VB_W,
    y: 160 + rnd() * 360,
    r: 0.6 + rnd() * 1.5,
    o: 0.3 + rnd() * 0.7,
  }));
}
const STARS = stars(46);

function Scene() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="marble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f3ec" />
          <stop offset="55%" stopColor="#e7e1d4" />
          <stop offset="100%" stopColor="#cfc7b6" />
        </linearGradient>
        <linearGradient id="marbleShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5dece" />
          <stop offset="100%" stopColor="#bcb3a0" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e3a8" />
          <stop offset="45%" stopColor="#d9b25f" />
          <stop offset="100%" stopColor="#a9803a" />
        </linearGradient>
        <linearGradient id="floorRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9e4632" />
          <stop offset="45%" stopColor="#7c3120" />
          <stop offset="100%" stopColor="#52190f" />
        </linearGradient>

        {/* skies */}
        <linearGradient id="skyAlam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfeef3" />
          <stop offset="100%" stopColor="#e9f9f2" />
        </linearGradient>
        <linearGradient id="seaAlam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#43c7ad" />
          <stop offset="100%" stopColor="#0f7e6f" />
        </linearGradient>
        <linearGradient id="skySej" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7d79b" />
          <stop offset="100%" stopColor="#f4e8c8" />
        </linearGradient>
        <linearGradient id="seaSej" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#caa05c" />
          <stop offset="100%" stopColor="#7c5223" />
        </linearGradient>
        <linearGradient id="skyInv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2230" />
          <stop offset="100%" stopColor="#14414c" />
        </linearGradient>
        <linearGradient id="seaInv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2b30" />
          <stop offset="100%" stopColor="#04141a" />
        </linearGradient>

        <radialGradient id="sunAlam" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffdf2" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#fff4cf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff4cf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunSej" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe6ad" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f2b85e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f2b85e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonInv" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dff3ec" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#9fd3c6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#9fd3c6" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="archScrim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunGlint" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- sky / sea (cross-fade per act), with gentle parallax ---------- */}
      <g
        className="gh-parallax-sky"
        style={{ transform: "translateY(calc(var(--p, 0) * -26px))" } as React.CSSProperties}
      >
        <g className="gh-sky alam">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skyAlam)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaAlam)" />
          <ellipse cx="980" cy={HORIZON + 64} rx="210" ry="58" fill="url(#sunGlint)" opacity="0.5" />
        </g>
        <g className="gh-sky sejarah">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skySej)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaSej)" />
          <ellipse cx="800" cy={HORIZON + 64} rx="240" ry="62" fill="url(#sunGlint)" opacity="0.55" />
        </g>
        <g className="gh-sky investigasi">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skyInv)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaInv)" />
          <ellipse cx="560" cy={HORIZON + 60} rx="150" ry="46" fill="url(#sunGlint)" opacity="0.38" />
          <g className="gh-stars">
            {STARS.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#eaf6f1" opacity={st.o} />
            ))}
          </g>
        </g>
      </g>

      {/* celestial body */}
      <g
        style={{ transform: "translateY(calc(var(--p, 0) * -54px))" } as React.CSSProperties}
      >
        <circle className="gh-sun alam" cx="980" cy="300" r="150" fill="url(#sunAlam)" />
        <circle className="gh-sun sejarah" cx="800" cy="430" r="190" fill="url(#sunSej)" />
        <circle className="gh-sun investigasi" cx="560" cy="280" r="120" fill="url(#moonInv)" />
      </g>

      {/* subtle horizon glow line */}
      <rect x="0" y={HORIZON - 2} width={VB_W} height="4" fill="#ffffff" opacity="0.12" />

      {/* ---------- red perspective floor (foreground) ---------- */}
      <g>
        <rect x="0" y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill="url(#floorRed)" />
        {/* converging tile lines toward VP (800, HORIZON) */}
        {[-200, 120, 360, 600, 800, 1000, 1240, 1480, 1800].map((x, i) => (
          <line
            key={`v${i}`}
            x1={x}
            y1={VB_H}
            x2={800}
            y2={HORIZON}
            stroke="#3f140c"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        ))}
        {/* horizontal tile rows with perspective spacing */}
        {[806, 824, 850, 888, 940, 1000].map((y, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={y}
            x2={VB_W}
            y2={y}
            stroke="#3f140c"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
        ))}
        {/* clip floor to below the threshold (cover any sea spill) */}
      </g>

      {/* ---------- marble architecture ---------- */}
      {/* outer return walls */}
      <rect x="0" y={FRIEZE_TOP} width="94" height={FLOOR_Y - FRIEZE_TOP} fill="url(#marbleShade)" />
      <rect x={VB_W - 94} y={FRIEZE_TOP} width="94" height={FLOOR_Y - FRIEZE_TOP} fill="url(#marbleShade)" />

      {/* arch thresholds / sills grounding the openings */}
      {Object.values(ARCHES).map((a, i) => (
        <rect key={`sill${i}`} x={a.xa - 8} y={FLOOR_Y - 12} width={a.xb - a.xa + 16} height="18" fill="url(#marbleShade)" />
      ))}

      {/* spandrels (define the arch openings) */}
      <path d={spandrel(ARCHES.left.xa, ARCHES.left.xb, ARCHES.left.top, ARCHES.left.spring)} fill="url(#marble)" />
      <path d={spandrel(ARCHES.center.xa, ARCHES.center.xb, ARCHES.center.top, ARCHES.center.spring)} fill="url(#marble)" />
      <path d={spandrel(ARCHES.right.xa, ARCHES.right.xb, ARCHES.right.top, ARCHES.right.spring)} fill="url(#marble)" />

      {/* archivolts — marble band + gold bead tracing each arch, with keystone */}
      {Object.values(ARCHES).map((a, i) => {
        const r = (a.xb - a.xa) / 2;
        const cx = (a.xa + a.xb) / 2;
        const cy = a.spring - r;
        const dOuter = `M ${a.xa} ${a.spring} A ${r} ${r} 0 0 1 ${a.xb} ${a.spring}`;
        const dInner = `M ${a.xa + 14} ${a.spring} A ${r - 14} ${r - 14} 0 0 1 ${a.xb - 14} ${a.spring}`;
        return (
          <g key={`arch${i}`}>
            <path d={dOuter} fill="none" stroke="url(#marble)" strokeWidth="22" />
            <path d={dInner} fill="none" stroke="url(#gold)" strokeWidth="3.5" opacity="0.85" />
            {/* keystone */}
            <path
              d={`M ${cx - 17} ${cy - 8} L ${cx + 17} ${cy - 8} L ${cx + 23} ${cy + 34} L ${cx - 23} ${cy + 34} Z`}
              fill="url(#marble)"
              stroke="#b7ad98"
              strokeWidth="1.5"
            />
          </g>
        );
      })}

      {/* frieze band with gold relief (sits over side sections) */}
      <rect x="0" y={FRIEZE_TOP} width={VB_W} height={FRIEZE_BOT - FRIEZE_TOP} fill="url(#marbleShade)" />
      <rect x="0" y={FRIEZE_BOT - 6} width={VB_W} height="6" fill="#000000" opacity="0.1" />
      {[
        [40, 360],
        [1240, 360],
      ].map(([x, w], i) => (
        <g key={`fr${i}`}>
          <rect x={x} y={FRIEZE_TOP + 18} width={w} height={FRIEZE_BOT - FRIEZE_TOP - 40} fill="url(#gold)" opacity="0.9" rx="3" />
          <rect x={x + 10} y={FRIEZE_TOP + 28} width={w - 20} height={FRIEZE_BOT - FRIEZE_TOP - 60} fill="none" stroke="#7a5a24" strokeOpacity="0.4" strokeWidth="2" rx="2" />
        </g>
      ))}

      {/* central cartouche tablet (breaks the cornice over the grand arch) */}
      <g>
        <rect x="690" y="118" width="220" height="104" rx="8" fill="url(#marble)" stroke="#b7ad98" strokeWidth="2" />
        <rect x="704" y="132" width="192" height="76" rx="5" fill="none" stroke="url(#gold)" strokeWidth="3" />
        <text x="800" y="186" textAnchor="middle" className="gh-engrave" fontSize="52" fill="#9a7531" letterSpacing="2">
          NaLI
        </text>
      </g>

      {/* scallop shells in the side spandrels */}
      {[305, 1295].map((cx, i) => (
        <g key={`shell${i}`} transform={`translate(${cx}, 322)`}>
          <path d="M -52 0 A 52 52 0 0 1 52 0 Z" fill="url(#marbleShade)" stroke="#b7ad98" strokeWidth="1.5" />
          {[-44, -29, -14, 0, 14, 29, 44].map((x, j) => (
            <line key={j} x1="0" y1="0" x2={x} y2={-Math.sqrt(Math.max(0, 52 * 52 - x * x))} stroke="#a89c83" strokeOpacity="0.6" strokeWidth="1.5" />
          ))}
          <circle cx="0" cy="2" r="6" fill="url(#gold)" />
        </g>
      ))}

      {/* piers, capitals, bases, pedestals */}
      {PIERS.map((c, i) => (
        <g key={`pier${i}`}>
          {/* capital */}
          <rect x={c - 62} y={FRIEZE_BOT} width="124" height="40" fill="url(#marble)" />
          <rect x={c - 70} y={FRIEZE_BOT + 34} width="140" height="10" fill="url(#marbleShade)" />
          {/* shaft */}
          <rect x={c - PIER_HALF} y={FRIEZE_BOT + 44} width={PIER_HALF * 2} height={760 - (FRIEZE_BOT + 44)} fill="url(#marble)" />
          {/* fluting hint */}
          <line x1={c - 18} y1={FRIEZE_BOT + 54} x2={c - 18} y2="752" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" />
          <line x1={c + 18} y1={FRIEZE_BOT + 54} x2={c + 18} y2="752" stroke="#000000" strokeOpacity="0.07" strokeWidth="3" />
          {/* base */}
          <rect x={c - 60} y="760" width="120" height="32" fill="url(#marbleShade)" />
          {/* pedestal */}
          <rect x={c - 78} y={FLOOR_Y} width="156" height="96" fill="url(#marble)" stroke="#bcb3a0" strokeWidth="1.5" />
          <rect x={c - 64} y={FLOOR_Y + 14} width="128" height="68" fill="none" stroke="#b0a690" strokeWidth="1.5" />
        </g>
      ))}

      {/* pedestal engravings */}
      <text x={PIERS[0]} y={FLOOR_Y + 56} textAnchor="middle" className="gh-engrave" fontSize="34" fill="#6f6450" letterSpacing="1">NaLI</text>
      <text x={PIERS[1]} y={FLOOR_Y + 52} textAnchor="middle" className="gh-engrave" fontSize="20" fill="#8a7f69" letterSpacing="4">by</text>
      <text x={PIERS[2]} y={FLOOR_Y + 54} textAnchor="middle" className="gh-engrave" fontSize="26" fill="#8a7f69" letterSpacing="2">NatIve</text>
      <text x={PIERS[3]} y={FLOOR_Y + 54} textAnchor="middle" className="gh-engrave" fontSize="22" fill="#8a7f69" letterSpacing="3">MMXXVI</text>

      {/* ---------- mood grade overlays (per act) ---------- */}
      <rect className="gh-grade alam" x="0" y="0" width={VB_W} height={VB_H} fill="#1f7d63" />
      <rect className="gh-grade sejarah" x="0" y="0" width={VB_W} height={VB_H} fill="#6b3f12" />
      <rect className="gh-grade investigasi" x="0" y="0" width={VB_W} height={VB_H} fill="#04161f" />

      {/* top + bottom vignette */}
      <rect x="0" y="0" width={VB_W} height="150" fill="#000000" opacity="0.1" />
      <rect x="0" y={VB_H - 130} width={VB_W} height="130" fill="#000000" opacity="0.1" />
    </svg>
  );
}

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
          className="gallery-stage relative h-full w-full bg-ink-black"
          data-act={acts[active].key}
        >
          <Scene />

          {/* film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />

          {/* tableaus — one per act, framed in the central arch */}
          {acts.map((act) => (
            <div
              key={act.key}
              className={`gh-tableau ${act.key} absolute left-1/2 top-1/2 w-[min(88vw,420px)] -translate-x-1/2 -translate-y-1/2`}
            >
              {/* engraved gallery placard */}
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

          {/* act navigation (right) */}
          <nav
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-8"
            aria-label="Pilih pilar"
          >
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

          {/* brand + scroll hint */}
          <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-1">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-white/55">
              Gulir menyusuri galeri
            </span>
            <span className="h-6 w-px animate-pulse bg-white/40" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
