"use client";

import { useEffect, useState } from "react";

/* pixel-art sun: 3×3 core + dotted rays (1px grid squares) */
function PixelSun() {
  const px: [number, number][] = [
    // core
    [3, 3], [4, 3], [5, 3],
    [3, 4], [4, 4], [5, 4],
    [3, 5], [4, 5], [5, 5],
    // dotted rays
    [4, 0], [4, 8], [0, 4], [8, 4],
    [1, 1], [7, 1], [1, 7], [7, 7],
  ];
  return (
    <svg viewBox="0 0 9 9" className="h-3.5 w-3.5" aria-hidden>
      {px.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

/* pixel-art half moon (◑) */
function PixelMoon() {
  const px: [number, number][] = [
    [3, 1], [4, 1],
    [2, 2], [3, 2], [4, 2],
    [2, 3], [3, 3], [4, 3],
    [2, 4], [3, 4], [4, 4],
    [2, 5], [3, 5], [4, 5],
    [2, 6], [3, 6], [4, 6],
    [3, 7], [4, 7],
  ];
  return (
    <svg viewBox="0 0 9 9" className="h-3.5 w-3.5" aria-hidden>
      {/* outline of the full disc */}
      <rect x="5" y="1" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="2" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="3" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="4" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="5" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="6" width="1" height="1" fill="currentColor" opacity="0.35" />
      <rect x="5" y="7" width="1" height="1" fill="currentColor" opacity="0.35" />
      {px.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

const STORAGE_KEY = "nali-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode etc. — non-fatal */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-theme-toggle
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="flex items-center gap-2 border border-ink/70 bg-paper px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink-wash"
    >
      {/* shows the CURRENT mode, like the reference: ☼ LIGHT / ◑ DARK */}
      {theme === "dark" ? <PixelMoon /> : <PixelSun />}
      <span className="min-w-[2.6rem] text-left">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
