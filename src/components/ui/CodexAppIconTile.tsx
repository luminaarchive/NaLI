"use client";

/**
 * CodexAppIconTile — Glossy rounded app icon tile centered above hero title.
 * Mimics premium AI product icon tiles (like Codex icon).
 * NaLI-specific: evidence agent glyph ">_" in blue/violet gradient.
 */
export function CodexAppIconTile() {
  return (
    <div className="relative mx-auto mb-8 flex h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-white shadow-xl shadow-indigo-200/40 ring-1 ring-black/[0.04] sm:h-[110px] sm:w-[110px] sm:rounded-[32px]">
      {/* Inner subtle gradient */}
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 sm:rounded-[32px]" />
      {/* Soft inner shadow */}
      <div className="absolute inset-[1px] rounded-[27px] shadow-inner shadow-black/[0.03] sm:rounded-[31px]" />
      {/* NaLI glyph */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30 sm:h-16 sm:w-16">
        <span className="font-mono text-2xl font-bold text-white sm:text-3xl">&gt;_</span>
      </div>
    </div>
  );
}
