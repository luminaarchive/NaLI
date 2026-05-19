"use client";

/**
 * CodexProductPreview — Large app window mockup rising from bottom of hero.
 * Shows a simplified NaLI report interface preview.
 * Width: ~1120px, Height: ~420px, with glassmorphic styling and
 * macOS traffic lights. The upper portion rises into view from the bottom
 * of the first viewport.
 */
export function CodexProductPreview() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[1140px] px-4 sm:mt-20 sm:px-0">
      {/* Soft glow shadow beneath the window */}
      <div
        className="absolute -inset-6 top-12 rounded-[36px]"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 30%, transparent 70%)",
          filter: "blur(25px)",
        }}
      />

      {/* Main window — dark translucent glassmorphic */}
      <div
        className="relative overflow-hidden rounded-t-[20px] sm:rounded-t-[24px]"
        style={{
          background: "rgba(15, 23, 42, 0.85)", // Dark slate background
          backdropFilter: "blur(40px) saturate(1.2)",
          WebkitBackdropFilter: "blur(40px) saturate(1.2)",
          boxShadow:
            "0 -8px 60px rgba(0,0,0,0.4), 0 -1px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(255,255,255,0.05) inset",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          minHeight: "400px",
        }}
      >
        {/* macOS traffic lights bar */}
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-4 text-xs font-medium text-gray-400">
            NaLI — Create Report
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-gray-300">
              Open
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-gray-300">
              Export
            </span>
          </div>
        </div>

        {/* App interface — 3 column layout */}
        <div className="flex" style={{ minHeight: "360px" }}>
          {/* Left sidebar */}
          <div
            className="hidden w-[210px] shrink-0 p-4 sm:block"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <div className="mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Workspace
              </span>
            </div>
            <div className="space-y-0.5">
              {[
                { label: "New report", active: true, icon: "✎" },
                { label: "Evidence queue", active: false, icon: "◈" },
                { label: "Sources", active: false, icon: "◇" },
                { label: "Export", active: false, icon: "↗" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium ${
                    item.active
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <span className="text-[11px] opacity-60">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-7">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Recent
              </span>
              <div className="mt-2 space-y-0.5">
                {["Field Survey Draft", "Species Report Q2", "Patrol Log"].map(
                  (name) => (
                    <div
                      key={name}
                      className="rounded-lg px-3 py-1.5 text-[12px] text-gray-400 hover:bg-white/5 hover:text-gray-300"
                    >
                      {name}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Center content — chat/reasoning panel */}
          <div
            className="flex-1 p-5 sm:p-6"
            style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-400">NaLI</span>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-gray-400">report</span>
            </div>

            <h3 className="mb-1.5 text-base font-semibold text-gray-200">
              Create NaLI report
            </h3>
            <p className="mb-5 text-[13px] text-gray-400">
              Draft from uploaded notes, sources, and observations.
            </p>

            {/* Simulated reasoning blocks */}
            <div className="mb-4 space-y-3">
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[11px] font-medium text-gray-400">
                    Analyzing uploaded notes...
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-[5px] w-full rounded-full bg-gray-700/60" />
                  <div className="h-[5px] w-4/5 rounded-full bg-gray-700/40" />
                  <div className="h-[5px] w-3/4 rounded-full bg-gray-700/30" />
                </div>
              </div>
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <span className="text-[11px] font-medium text-gray-400">
                    Building evidence table...
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-[5px] w-full rounded-full bg-gray-700/50" />
                  <div className="h-[5px] w-2/3 rounded-full bg-gray-700/35" />
                </div>
              </div>
            </div>

            {/* Command input */}
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <p className="text-[13px] text-gray-500">
                Draft from uploaded notes...
              </p>
            </div>
          </div>

          {/* Right panel — evidence/source detail */}
          <div className="hidden w-[280px] shrink-0 p-5 lg:block">
            <div className="mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Evidence
              </span>
            </div>

            {/* Evidence chips */}
            <div className="mb-5 flex flex-wrap gap-1.5">
              {[
                { label: "Notes", bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
                { label: "Source", bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
                { label: "File", bg: "rgba(6,182,212,0.15)", color: "#22d3ee" },
                { label: "Review", bg: "rgba(16,185,129,0.15)", color: "#34d399" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: chip.bg, color: chip.color }}
                >
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Evidence cards */}
            <div className="space-y-2.5">
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="mb-2 h-[5px] w-14 rounded-full bg-indigo-500/60" />
                <div className="space-y-1.5">
                  <div className="h-[5px] w-full rounded-full bg-gray-700/50" />
                  <div className="h-[5px] w-3/4 rounded-full bg-gray-700/35" />
                  <div className="h-[5px] w-5/6 rounded-full bg-gray-700/40" />
                </div>
              </div>
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="mb-2 h-[5px] w-18 rounded-full bg-violet-500/60" />
                <div className="space-y-1.5">
                  <div className="h-[5px] w-full rounded-full bg-gray-700/45" />
                  <div className="h-[5px] w-2/3 rounded-full bg-gray-700/30" />
                  <div className="h-[5px] w-4/5 rounded-full bg-gray-700/35" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

