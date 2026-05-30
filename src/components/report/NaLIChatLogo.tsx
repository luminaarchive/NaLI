"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function NaLIChatLogo({
  size = 32,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`nali-logo-container ${animated ? "nali-logo-animated" : ""} ${className}`.trim()}
      style={{ width: size, height: size, position: "relative", display: "inline-block" }}
    >
      <Image
        src="/nali-logo.png"
        alt="NaLI"
        width={size}
        height={size}
        style={{ borderRadius: "20%", display: "block", position: "relative", zIndex: 1 }}
        unoptimized
      />

      {animated && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            pointerEvents: "none",
            borderRadius: "20%",
            overflow: "visible",
          }}
          aria-hidden="true"
        >
          <defs>
            <filter id="nali-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Three wavy N strokes traced from the logo */}
            <path
              id="nali-path-outer"
              d="M 10 85 C 9 62 9 42 13 20 C 14 11 22 6 33 9 C 46 13 53 32 50 52 C 47 67 50 76 58 79 C 67 82 73 75 76 63 C 79 51 80 35 80 19 C 80 11 84 6 90 8"
              fill="none"
            />
            <path
              id="nali-path-mid"
              d="M 16 85 C 15 62 15 42 19 21 C 20 13 27 9 37 11 C 50 15 56 33 53 52 C 50 66 53 74 61 77 C 69 80 74 73 76 61 C 79 49 80 34 80 20 C 80 12 83 8 89 10"
              fill="none"
            />
            <path
              id="nali-path-inner"
              d="M 22 85 C 21 62 21 42 24 22 C 25 14 32 11 41 13 C 53 17 59 34 56 52 C 53 65 56 72 63 75 C 70 78 74 71 76 59 C 79 47 79 33 79 21 C 79 13 82 9 88 11"
              fill="none"
            />
          </defs>

          <circle r="2.5" fill="#00FFB3" filter="url(#nali-glow)" opacity="0.9">
            <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto">
              <mpath href="#nali-path-outer" />
            </animateMotion>
          </circle>

          <circle r="2" fill="#7fffdf" filter="url(#nali-glow)" opacity="0.7">
            <animateMotion dur="2.4s" begin="-0.8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#nali-path-mid" />
            </animateMotion>
          </circle>

          <circle r="1.5" fill="#00FFB3" filter="url(#nali-glow)" opacity="0.6">
            <animateMotion dur="2.4s" begin="-1.6s" repeatCount="indefinite" rotate="auto">
              <mpath href="#nali-path-inner" />
            </animateMotion>
          </circle>
        </svg>
      )}
    </div>
  );
}

export function NaLIChatLogoAnimated({ size = 32 }: { size?: number }) {
  return <NaLIChatLogo size={size} animated={true} />;
}

/* ---- ThoughtLine & generateAgenticThoughts (used by LoadingView) ---- */

interface ThoughtLineProps {
  text: string;
  isActive: boolean;
  delay: number;
}

export function ThoughtLine({ text, isActive, delay }: ThoughtLineProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      style={{
        opacity: isActive ? 1 : 0.45,
        color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.8",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "thought-appear 0.3s ease-out both",
        marginBottom: "2px",
      }}
    >
      <span style={{ color: "#00FFB3", flexShrink: 0 }}>&#8594;</span>
      <span>{text}</span>
      {isActive && (
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "14px",
            backgroundColor: "#00FFB3",
            marginLeft: "2px",
            animation: "cursor-blink 1s step-end infinite",
          }}
        />
      )}
    </div>
  );
}

const BASE_THOUGHTS = [
  "Membaca konteks input...",
  "Mengidentifikasi jenis dokumen yang diminta...",
  "Memetakan struktur laporan...",
  "Memeriksa kecukupan bukti yang diberikan...",
  "Menandai klaim yang membutuhkan verifikasi...",
  "Menyusun kerangka berbasis IMRaD...",
  "Menulis draf awal...",
  "Memvalidasi batas klaim AI...",
];

function getContextualThoughts(prompt: string): string[] {
  const p = prompt.toLowerCase();
  const thoughts: string[] = [];
  if (p.includes("elang") || p.includes("burung") || p.includes("satwa")) {
    thoughts.push("Mencocokkan spesies dengan basis data taksonomi Indonesia...");
    thoughts.push("Memeriksa status konservasi IUCN...");
  }
  if (p.includes("sungai") || p.includes("air") || p.includes("kaligarang")) {
    thoughts.push("Menganalisis parameter kualitas air yang disebutkan...");
    thoughts.push("Memetakan lokasi: wilayah Semarang terdeteksi...");
  }
  if (p.includes("praktikum") || p.includes("mikroskop") || p.includes("sel")) {
    thoughts.push("Memverifikasi prosedur laboratorium yang dijelaskan...");
    thoughts.push("Mencocokkan dengan standar pengamatan biologi sel...");
  }
  if (p.includes("kkn") || p.includes("mahasiswa") || p.includes("survei")) {
    thoughts.push("Menyesuaikan format dengan standar laporan KKN...");
  }
  if (p.includes("semeru") || p.includes("merbabu") || p.includes("gunung")) {
    thoughts.push("Memuat data habitat: zona ketinggian pegunungan Jawa...");
  }
  if (p.includes("jurnal") || p.includes("imrad") || p.includes("abstrak")) {
    thoughts.push("Menerapkan struktur IMRaD: Introduction, Methods, Results...");
    thoughts.push("Menyesuaikan dengan standar penulisan ilmiah...");
  }
  return thoughts;
}

export function generateAgenticThoughts(prompt: string, activeStep: number): string[] {
  const contextual = getContextualThoughts(prompt);
  const all = [...BASE_THOUGHTS];
  if (contextual.length > 0) {
    all.splice(2, 0, contextual[0]);
    if (contextual[1]) all.splice(5, 0, contextual[1]);
  }
  return all.slice(0, Math.min(activeStep + 2, all.length));
}
