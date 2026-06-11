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

/* =====================================================================
 * Scene geometry — a Bibiena-style painted gallery, viewBox 1600×1000.
 *
 *   y   0–196   coffered gilded barrel vault
 *   y 196–306   entablature: architrave · figured gold frieze · dentils
 *   y 306–812   marble wall pierced by three arches onto the sea
 *   y 812–1000  red perspective floor with pedestals
 *
 *   bays: wall 0–150 · pier 150–255 · arch 265–505 · pier 505–610 ·
 *         GRAND ARCH 630–970 · pier 990–1095 · arch 1095–1335 ·
 *         pier 1345–1450 · wall 1450–1600
 * ===================================================================== */
const VB_W = 1600;
const VB_H = 1000;
const HORIZON = 560;
const FLOOR_Y = 812;
const SPRING = 480;

const ARCHES = [
  { xa: 265, xb: 505, r: 120 },
  { xa: 630, xb: 970, r: 170 }, // grand central arch
  { xa: 1095, xb: 1335, r: 120 },
];

const PIERS = [202, 567, 1032, 1397]; // centre x of the four piers
const PIER_HALF = 53;
const PIER_LETTER = ["N", "A", "L", "I"];
const PIER_CAPTION = ["NATURE", "ARCHIVE", "LORE", "INVESTIGATION"];

const VAULT_RIBS = [150, 505, 990, 1345, 255, 610, 1095, 1450]; // bay edges

function archHole(a: { xa: number; xb: number; r: number }): string {
  return `M ${a.xa} ${FLOOR_Y} L ${a.xa} ${SPRING} A ${a.r} ${a.r} 0 0 1 ${a.xb} ${SPRING} L ${a.xb} ${FLOOR_Y} Z`;
}
const WALL_PATH = `M 0 212 H ${VB_W} V ${FLOOR_Y} H 0 Z ${ARCHES.map(archHole).join(" ")}`;

/* deterministic star field (seeded LCG so SSR === CSR) */
function stars(count: number) {
  let s = 1337;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: count }, () => ({
    x: rnd() * VB_W,
    y: 180 + rnd() * 340,
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
        {/* marble + gold */}
        <linearGradient id="marble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f4e9" />
          <stop offset="55%" stopColor="#ece4d0" />
          <stop offset="100%" stopColor="#d3c8af" />
        </linearGradient>
        <linearGradient id="marbleShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e0cb" />
          <stop offset="100%" stopColor="#c2b698" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3df9f" />
          <stop offset="45%" stopColor="#d4ab55" />
          <stop offset="100%" stopColor="#9c742e" />
        </linearGradient>
        <linearGradient id="goldFlat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#caa14e" />
          <stop offset="50%" stopColor="#edd391" />
          <stop offset="100%" stopColor="#b08938" />
        </linearGradient>
        <linearGradient id="floorRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b14a2e" />
          <stop offset="45%" stopColor="#8c3520" />
          <stop offset="100%" stopColor="#5e1f12" />
        </linearGradient>
        <linearGradient id="vault" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9cdb1" />
          <stop offset="100%" stopColor="#f3edda" />
        </linearGradient>

        {/* skies per act */}
        <linearGradient id="skyAlam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aee3ef" />
          <stop offset="78%" stopColor="#e6f7f0" />
          <stop offset="100%" stopColor="#f4fbf4" />
        </linearGradient>
        <linearGradient id="seaAlam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62cdb4" />
          <stop offset="100%" stopColor="#0f7e6f" />
        </linearGradient>
        <linearGradient id="skySej" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3cf8d" />
          <stop offset="80%" stopColor="#f8ead0" />
          <stop offset="100%" stopColor="#fdf6e6" />
        </linearGradient>
        <linearGradient id="seaSej" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d2a763" />
          <stop offset="100%" stopColor="#7c5223" />
        </linearGradient>
        <linearGradient id="skyInv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2230" />
          <stop offset="100%" stopColor="#16444f" />
        </linearGradient>
        <linearGradient id="seaInv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2e33" />
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
        <radialGradient id="sunGlint" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* figured relief frieze — abstract gold procession */}
        <pattern id="friezeFig" width="124" height="70" patternUnits="userSpaceOnUse">
          <rect width="124" height="70" fill="url(#gold)" />
          <g fill="#8a6526" opacity="0.55">
            <circle cx="28" cy="22" r="7" />
            <ellipse cx="28" cy="44" rx="10" ry="16" />
            <circle cx="64" cy="20" r="7" />
            <ellipse cx="66" cy="43" rx="11" ry="17" />
            <path d="M 50 36 Q 58 28 74 34" stroke="#8a6526" strokeWidth="4" fill="none" />
            <circle cx="100" cy="23" r="7" />
            <ellipse cx="99" cy="45" rx="10" ry="15" />
          </g>
          <g fill="#f6e7b4" opacity="0.5">
            <circle cx="27" cy="20" r="2.6" />
            <circle cx="63" cy="18" r="2.6" />
            <circle cx="99" cy="21" r="2.6" />
          </g>
        </pattern>

        {/* dentil course */}
        <pattern id="dentils" width="26" height="24" patternUnits="userSpaceOnUse">
          <rect width="26" height="24" fill="#efe7d2" />
          <rect x="4" y="4" width="13" height="15" fill="#b9ac8c" />
        </pattern>

        {/* coffer rosette */}
        <g id="rosette">
          <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="#b9a878" strokeWidth="2" />
          <circle r="5.5" fill="url(#goldFlat)" />
        </g>

        <clipPath id="wallClip">
          <path d={WALL_PATH} clipRule="evenodd" />
        </clipPath>
      </defs>

      {/* ============ THE VIEW: sky + sea per act (parallax drift) ============ */}
      <g
        className="gh-parallax-sky"
        style={{ transform: "translateY(calc(var(--p, 0) * -26px))" } as React.CSSProperties}
      >
        <g className="gh-sky alam">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skyAlam)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaAlam)" />
          {/* clouds */}
          <g fill="#ffffff" opacity="0.75">
            <ellipse cx="700" cy="330" rx="64" ry="16" />
            <ellipse cx="745" cy="316" rx="40" ry="13" />
            <ellipse cx="1180" cy="395" rx="52" ry="13" />
          </g>
          {/* distant volcanic islet */}
          <path d="M 640 560 L 700 522 L 736 538 L 790 560 Z" fill="#3f8d77" opacity="0.7" />
          <ellipse cx="980" cy={HORIZON + 62} rx="210" ry="56" fill="url(#sunGlint)" opacity="0.5" />
          {/* gulls */}
          <g stroke="#3c6b60" strokeWidth="2.4" fill="none" opacity="0.7">
            <path d="M 860 380 q 7 -7 14 0 q 7 -7 14 0" />
            <path d="M 906 356 q 6 -6 12 0 q 6 -6 12 0" />
          </g>
        </g>

        <g className="gh-sky sejarah">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skySej)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaSej)" />
          <ellipse cx="800" cy={HORIZON + 60} rx="240" ry="60" fill="url(#sunGlint)" opacity="0.55" />
          {/* phinisi silhouettes on the horizon */}
          <g fill="#5d3c16" opacity="0.85">
            <path d="M 690 558 q 28 10 56 0 l -6 -8 h -44 Z" />
            <path d="M 716 514 l 3 38 h 4 l 3 -38 q -5 -8 -10 0 Z" />
            <path d="M 700 530 q 16 -14 34 -6 l -32 12 Z" />
            <path d="M 1108 556 q 22 8 44 0 l -5 -7 h -34 Z" />
            <path d="M 1128 522 l 2 28 h 4 l 2 -28 q -4 -7 -8 0 Z" />
          </g>
        </g>

        <g className="gh-sky investigasi">
          <rect x="0" y="0" width={VB_W} height={HORIZON} fill="url(#skyInv)" />
          <rect x="0" y={HORIZON} width={VB_W} height={FLOOR_Y - HORIZON} fill="url(#seaInv)" />
          <ellipse cx="560" cy={HORIZON + 58} rx="150" ry="44" fill="url(#sunGlint)" opacity="0.35" />
          <g className="gh-stars">
            {STARS.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#eaf6f1" opacity={st.o} />
            ))}
          </g>
        </g>
      </g>

      {/* celestial bodies */}
      <g style={{ transform: "translateY(calc(var(--p, 0) * -54px))" } as React.CSSProperties}>
        <circle className="gh-sun alam" cx="980" cy="320" r="150" fill="url(#sunAlam)" />
        <circle className="gh-sun sejarah" cx="800" cy="450" r="190" fill="url(#sunSej)" />
        <circle className="gh-sun investigasi" cx="560" cy="300" r="120" fill="url(#moonInv)" />
      </g>

      <rect x="0" y={HORIZON - 2} width={VB_W} height="4" fill="#ffffff" opacity="0.12" />

      {/* ============ RED PERSPECTIVE FLOOR ============ */}
      <g>
        <rect x="0" y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill="url(#floorRed)" />
        {[-260, 60, 320, 580, 800, 1020, 1280, 1540, 1860].map((x, i) => (
          <line key={`v${i}`} x1={x} y1={VB_H} x2={800} y2={HORIZON} stroke="#3f140c" strokeOpacity="0.32" strokeWidth="1.5" />
        ))}
        {[826, 846, 874, 912, 962, 1000].map((y, i) => (
          <line key={`h${i}`} x1="0" y1={y} x2={VB_W} y2={y} stroke="#3f140c" strokeOpacity="0.26" strokeWidth="1.5" />
        ))}
        {/* sheen: light spilling through the arches onto the floor */}
        {ARCHES.map((a, i) => (
          <path
            key={`spill${i}`}
            d={`M ${a.xa + 14} ${FLOOR_Y} L ${a.xa - 60} ${VB_H} L ${a.xb + 60} ${VB_H} L ${a.xb - 14} ${FLOOR_Y} Z`}
            fill="#ffffff"
            opacity="0.07"
          />
        ))}
      </g>

      {/* ============ MARBLE WALL (pierced by the arches) ============ */}
      <path d={WALL_PATH} fillRule="evenodd" fill="url(#marble)" />
      {/* stone joints, clipped to the wall */}
      <g clipPath="url(#wallClip)">
        {[380, 470, 560, 650, 740].map((y, i) => (
          <line key={`j${i}`} x1="0" y1={y} x2={VB_W} y2={y} stroke="#9c8e6e" strokeOpacity="0.16" strokeWidth="1.5" />
        ))}
        {/* ambient shading at outer corners */}
        <rect x="0" y="212" width="120" height={FLOOR_Y - 212} fill="#6b5b3a" opacity="0.08" />
        <rect x={VB_W - 120} y="212" width="120" height={FLOOR_Y - 212} fill="#6b5b3a" opacity="0.08" />
      </g>

      {/* arch sills */}
      {ARCHES.map((a, i) => (
        <rect key={`sill${i}`} x={a.xa - 10} y={FLOOR_Y - 10} width={a.xb - a.xa + 20} height="16" fill="url(#marbleShade)" />
      ))}

      {/* ============ ARCHIVOLTS + KEYSTONE CARTOUCHES ============ */}
      {ARCHES.map((a, i) => {
        const cx = (a.xa + a.xb) / 2;
        const cy = SPRING - a.r;
        const ring = (rr: number) =>
          `M ${cx - rr} ${SPRING} A ${rr} ${rr} 0 0 1 ${cx + rr} ${SPRING}`;
        return (
          <g key={`arch${i}`}>
            <path d={ring(a.r + 20)} fill="none" stroke="url(#marbleShade)" strokeWidth="26" />
            <path d={ring(a.r + 30)} fill="none" stroke="#b3a584" strokeWidth="2.5" />
            <path d={ring(a.r + 8)} fill="none" stroke="url(#goldFlat)" strokeWidth="6" opacity="0.9" />
            <path d={ring(a.r + 1)} fill="none" stroke="#8a7a57" strokeOpacity="0.5" strokeWidth="2" />
            {/* keystone cartouche */}
            <g transform={`translate(${cx}, ${cy - 16})`}>
              <path d="M -20 -14 L 20 -14 L 27 36 L -27 36 Z" fill="url(#marble)" stroke="#b3a584" strokeWidth="1.5" />
              <path d="M -11 -2 Q 0 -10 11 -2 Q 14 12 0 20 Q -14 12 -11 -2 Z" fill="url(#goldFlat)" opacity="0.95" />
            </g>
          </g>
        );
      })}

      {/* spandrel rosettes beside the grand arch */}
      {[572, 1028].map((x, i) => (
        <g key={`spro${i}`} transform={`translate(${x}, 370)`}>
          <circle r="24" fill="url(#marbleShade)" stroke="#b3a584" strokeWidth="1.5" />
          <circle r="13" fill="url(#goldFlat)" />
          <circle r="4" fill="#8a6526" />
        </g>
      ))}

      {/* ============ ENTABLATURE ============ */}
      {/* architrave */}
      <rect x="0" y="196" width={VB_W} height="16" fill="url(#marbleShade)" />
      <line x1="0" y1="203" x2={VB_W} y2="203" stroke="#a8997a" strokeWidth="1.5" />
      {/* figured gold frieze */}
      <rect x="0" y="212" width={VB_W} height="70" fill="url(#friezeFig)" />
      <rect x="0" y="212" width={VB_W} height="4" fill="#7a5a22" opacity="0.55" />
      <rect x="0" y="278" width={VB_W} height="4" fill="#7a5a22" opacity="0.55" />
      {/* dentil cornice */}
      <rect x="0" y="282" width={VB_W} height="24" fill="url(#dentils)" />
      <rect x="0" y="304" width={VB_W} height="6" fill="#8d7e5d" opacity="0.5" />

      {/* central tablet: NaLI (breaks the frieze over the grand arch) */}
      <g>
        <rect x="706" y="200" width="188" height="92" rx="7" fill="url(#marble)" stroke="#b3a584" strokeWidth="2" />
        <rect x="718" y="212" width="164" height="68" rx="4" fill="none" stroke="url(#goldFlat)" strokeWidth="3" />
        <text x="800" y="262" textAnchor="middle" className="gh-engrave" fontSize="46" fill="#9a7531" letterSpacing="2">
          NaLI
        </text>
      </g>

      {/* ============ COFFERED GILDED VAULT ============ */}
      <rect x="0" y="0" width={VB_W} height="196" fill="url(#vault)" />
      {/* barrel-vault coffer arcs per bay */}
      {[
        [75, 0],
        [380, 1],
        [800, 2],
        [1220, 1],
        [1525, 0],
      ].map(([cx], i) => (
        <g key={`vbay${i}`}>
          <path d={`M ${cx - 200} 196 Q ${cx} 30 ${cx + 200} 196`} fill="none" stroke="#bfb190" strokeWidth="2.5" opacity="0.8" />
          <path d={`M ${cx - 132} 196 Q ${cx} 86 ${cx + 132} 196`} fill="none" stroke="#bfb190" strokeWidth="2" opacity="0.7" />
          <use href="#rosette" x={cx} y="118" />
          <use href="#rosette" x={cx - 74} y="150" />
          <use href="#rosette" x={cx + 74} y="150" />
        </g>
      ))}
      {/* gold transverse ribs above bay edges */}
      {VAULT_RIBS.map((x, i) => (
        <rect key={`rib${i}`} x={x - 9} y="0" width="18" height="196" fill="url(#gold)" opacity="0.85" />
      ))}
      <rect x="0" y="190" width={VB_W} height="8" fill="#6b5b3a" opacity="0.25" />

      {/* ============ OUTER BAYS: GILT-FRAMED PAINTINGS ============ */}
      {[20, 1472].map((fx, i) => (
        <g key={`paint${i}`}>
          {/* shell pediment */}
          <g transform={`translate(${fx + 54}, 348)`}>
            <path d="M -40 0 A 40 40 0 0 1 40 0 Z" fill="url(#goldFlat)" opacity="0.95" />
            {[-32, -20, -8, 4, 16, 28].map((sx, j) => (
              <line key={j} x1="0" y1="0" x2={sx} y2={-Math.sqrt(Math.max(0, 1600 - sx * sx)) * 0.92} stroke="#8a6526" strokeWidth="1.6" opacity="0.7" />
            ))}
          </g>
          {/* frame */}
          <rect x={fx} y="362" width="108" height="300" fill="url(#goldFlat)" />
          <rect x={fx + 8} y="370" width="92" height="284" fill="#5a4020" />
          <rect x={fx + 13} y="375" width="82" height="274" fill="none" stroke="#f3df9f" strokeWidth="1.6" opacity="0.7" />
          {/* sepia painting: ruin arch over water */}
          <g>
            <rect x={fx + 15} y="377" width="78" height="270" fill="#caa468" />
            <rect x={fx + 15} y="500" width="78" height="147" fill="#8a6034" />
            <path d={`M ${fx + 30} 647 L ${fx + 30} 470 A 24 24 0 0 1 ${fx + 78} 470 L ${fx + 78} 647 Z`} fill="#5a4020" opacity="0.8" />
            <circle cx={fx + 54} cy="420" r="14" fill="#f0d9a8" opacity="0.85" />
            <rect x={fx + 15} y="377" width="78" height="270" fill="none" stroke="#3d2a12" strokeOpacity="0.35" strokeWidth="3" />
          </g>
          {/* plaque */}
          <rect x={fx + 30} y="676" width="48" height="14" rx="2" fill="url(#goldFlat)" opacity="0.9" />
        </g>
      ))}

      {/* ============ PIERS: capitals, engraved N·A·L·I panels ============ */}
      {PIERS.map((c, i) => (
        <g key={`pier${i}`}>
          {/* capital */}
          <rect x={c - 64} y="306" width="128" height="14" fill="url(#marbleShade)" />
          <rect x={c - 56} y="320" width="112" height="26" fill="url(#goldFlat)" opacity="0.9" />
          <circle cx={c - 34} cy="333" r="7" fill="#8a6526" opacity="0.6" />
          <circle cx={c + 34} cy="333" r="7" fill="#8a6526" opacity="0.6" />
          <rect x={c - 60} y="346" width="120" height="8" fill="url(#marbleShade)" />
          {/* engraved panel */}
          <rect x={c - 36} y="372" width="72" height="290" fill="url(#marbleShade)" />
          <rect x={c - 30} y="378" width="60" height="278" fill="url(#marble)" stroke="#b3a584" strokeWidth="1.5" />
          <rect x={c - 24} y="384" width="48" height="266" fill="none" stroke="url(#goldFlat)" strokeWidth="2" opacity="0.8" />
          {/* gold shell at panel head */}
          <g transform={`translate(${c}, 416)`}>
            <path d="M -18 0 A 18 18 0 0 1 18 0 Z" fill="url(#goldFlat)" />
            <circle cy="4" r="3.4" fill="#8a6526" />
          </g>
          {/* the letter */}
          <text x={c} y="540" textAnchor="middle" className="gh-engrave" fontSize="84" fontWeight="600" fill="#a98f4f" opacity="0.95">
            {PIER_LETTER[i]}
          </text>
          <text x={c} y="568" textAnchor="middle" fontSize="11" fill="#8d7c5c" letterSpacing="2.5" fontFamily="var(--font-mono)">
            {PIER_CAPTION[i]}
          </text>
          {/* base */}
          <rect x={c - 60} y="752" width="120" height="14" fill="url(#marbleShade)" />
          <rect x={c - 66} y="766" width="132" height="46" fill="url(#marble)" />
        </g>
      ))}

      {/* ============ PEDESTALS (foreground, on the red floor) ============ */}
      {PIERS.map((c, i) => {
        const mid = i === 1 || i === 2;
        return (
          <g key={`ped${i}`}>
            <ellipse cx={c} cy="892" rx="104" ry="14" fill="#000000" opacity="0.25" />
            {/* cap */}
            <rect x={c - 92} y="636" width="184" height="12" fill="url(#marble)" />
            <rect x={c - 84} y="648" width="168" height="10" fill="url(#marbleShade)" />
            {/* body */}
            <rect x={c - 78} y="658" width="156" height="196" fill="url(#marble)" stroke="#c2b698" strokeWidth="1.5" />
            <rect x={c - 62} y="674" width="124" height="164" fill="none" stroke="#b3a584" strokeWidth="1.5" />
            <rect x={c - 58} y="678" width="116" height="156" fill="none" stroke="url(#goldFlat)" strokeWidth="1.6" opacity="0.65" />
            {/* plinth */}
            <rect x={c - 88} y="854" width="176" height="14" fill="url(#marbleShade)" />
            <rect x={c - 96} y="868" width="192" height="18" fill="url(#marble)" />
            {/* engraving */}
            {mid ? (
              <g>
                <text x={c} y="746" textAnchor="middle" className="gh-engrave" fontSize="40" fill="#8d7c5c">
                  NaLI
                </text>
                <text x={c} y="772" textAnchor="middle" fontSize="10.5" fill="#9c8e6e" letterSpacing="3" fontFamily="var(--font-mono)">
                  BY NATIVE
                </text>
                {/* laurel sprigs */}
                <g stroke="#a98f4f" strokeWidth="2" fill="none" opacity="0.85">
                  <path d={`M ${c - 44} 796 q 14 14 34 12`} />
                  <path d={`M ${c + 44} 796 q -14 14 -34 12`} />
                </g>
              </g>
            ) : (
              <g>
                {/* laurel wreath medallion */}
                <circle cx={c} cy="738" r="34" fill="none" stroke="#a98f4f" strokeWidth="2.5" opacity="0.9" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <ellipse
                    key={deg}
                    cx={c + 34 * Math.cos((deg * Math.PI) / 180)}
                    cy={738 + 34 * Math.sin((deg * Math.PI) / 180)}
                    rx="6"
                    ry="3"
                    transform={`rotate(${deg + 90} ${c + 34 * Math.cos((deg * Math.PI) / 180)} ${738 + 34 * Math.sin((deg * Math.PI) / 180)})`}
                    fill="#a98f4f"
                    opacity="0.8"
                  />
                ))}
                <text x={c} y="745" textAnchor="middle" className="gh-engrave" fontSize="16" fill="#8d7c5c">
                  {i === 0 ? "EST." : "MMXXVI"}
                </text>
                <text x={c} y="806" textAnchor="middle" fontSize="10.5" fill="#9c8e6e" letterSpacing="3" fontFamily="var(--font-mono)">
                  {i === 0 ? "FIELD JOURNAL" : "RESEARCH"}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ============ MOOD GRADES + VIGNETTE ============ */}
      <rect className="gh-grade alam" x="0" y="0" width={VB_W} height={VB_H} fill="#1f7d63" />
      <rect className="gh-grade sejarah" x="0" y="0" width={VB_W} height={VB_H} fill="#6b3f12" />
      <rect className="gh-grade investigasi" x="0" y="0" width={VB_W} height={VB_H} fill="#04161f" />

      <rect x="0" y="0" width={VB_W} height="120" fill="#000000" opacity="0.1" />
      <rect x="0" y={VB_H - 120} width={VB_W} height="120" fill="#000000" opacity="0.12" />
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

          {/* tableaus — one per act, framed in the grand arch */}
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

          {/* act navigation (right) */}
          <nav className="absolute right-4 top-1/2 z-20 -translate-y-1/2 sm:right-8" aria-label="Pilih pilar">
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
