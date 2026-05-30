"use client";

import { useEffect, useState } from "react";

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
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#050F12" />

      {/* Letter N - two verticals + diagonal */}
      <path
        d="M10 30 L10 10 L20 25 L30 10 L30 30"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bioluminescent pulse wave through the center of N */}
      <path
        d="M6 20 L13 20 L16 14 L20 26 L24 20 L34 20"
        stroke="#00FFB3"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={animated ? "nali-pulse-wave" : ""}
      />
    </svg>
  );
}

export function NaLIChatLogoAnimated({ size = 32 }: { size?: number }) {
  const br = Math.round(size / 4) + 3;
  return (
    <div
      className="nali-logo-glow-wrapper"
      style={{ width: size, height: size, borderRadius: br }}
    >
      <div className="nali-swoosh-ring" style={{ borderRadius: br }} />
      <NaLIChatLogo size={size} animated={true} />
    </div>
  );
}

interface ThoughtLineProps {
  text: string;
  isActive: boolean;
  delay: number;
}

function ThoughtLine({ text, isActive, delay }: ThoughtLineProps) {
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

export { ThoughtLine };
