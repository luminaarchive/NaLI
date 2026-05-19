"use client";

/**
 * CodexProductPreview — Large dark app window mockup rising from the bottom of the hero.
 * Shows a simplified NaLI report interface preview.
 * Much more visible and prominent than previous version.
 * Width: 1050-1180px, Height: 360-440px, positioned to rise from bottom.
 */
export function CodexProductPreview() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[1120px] px-4 sm:mt-20 sm:px-0">
      {/* Soft shadow beneath */}
      <div
        className="absolute -inset-4 top-8 rounded-[32px] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(15,15,20,0.25) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Main window */}
      <div
        className="relative overflow-hidden rounded-t-[20px] sm:rounded-t-[24px]"
        style={{
          background: "linear-gradient(180deg, #1a1a22 0%, #0f0f14 100%)",
          boxShadow:
            "0 -8px 60px rgba(0,0,0,0.2), 0 -2px 20px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.03) inset",
          border: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "none",
          minHeight: "380px",
        }}
      >
        {/* macOS traffic lights bar */}
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-4 text-xs font-medium text-white/30">
            NaLI — Create Report
          </span>
        </div>

        {/* App interface */}
        <div className="flex" style={{ minHeight: "340px" }}>
          {/* Sidebar */}
          <div
            className="hidden w-[220px] shrink-0 p-5 sm:block"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <div className="mb-6">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25"
              >
                Workspace
              </span>
            </div>
            <div className="space-y-0.5">
              {[
                { label: "New report", active: true, icon: "+" },
                { label: "Evidence queue", active: false, icon: "◈" },
                { label: "Sources", active: false, icon: "◇" },
                { label: "Export", active: false, icon: "↗" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                    item.active
                      ? "bg-white/[0.07] text-white/90"
                      : "text-white/30"
                  }`}
                >
                  <span className="text-[11px] opacity-60">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Recent section */}
            <div className="mt-8">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20">
                Recent
              </span>
              <div className="mt-3 space-y-0.5">
                {["Field Survey Draft", "Species Report Q2"].map((name) => (
                  <div
                    key={name}
                    className="rounded-lg px-3 py-1.5 text-[12px] text-white/20"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6 sm:p-8">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-400/80">
                NaLI
              </span>
              <span className="text-xs text-white/15">/</span>
              <span className="text-xs text-white/30">report</span>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-white/80 sm:text-xl">
              Create NaLI report
            </h3>
            <p className="mb-6 text-sm text-white/25">
              Draft from uploaded notes, sources, and field observations.
            </p>

            {/* Command input mockup */}
            <div
              className="mb-6 rounded-xl p-4"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <p className="text-sm text-white/25">
                Draft from uploaded notes...
              </p>
            </div>

            {/* Evidence chips row */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Notes", color: "rgba(99,102,241,0.15)", textColor: "rgba(129,140,248,0.8)" },
                { label: "Source", color: "rgba(139,92,246,0.12)", textColor: "rgba(167,139,250,0.8)" },
                { label: "File", color: "rgba(6,182,212,0.12)", textColor: "rgba(34,211,238,0.7)" },
                { label: "Review", color: "rgba(16,185,129,0.12)", textColor: "rgba(52,211,153,0.7)" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-medium"
                  style={{
                    background: chip.color,
                    color: chip.textColor,
                  }}
                >
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Preview cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-xl p-4"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                <div className="mb-3 h-1.5 w-14 rounded-full bg-indigo-500/20" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-white/[0.05]" />
                  <div className="h-1.5 w-3/4 rounded-full bg-white/[0.03]" />
                  <div className="h-1.5 w-5/6 rounded-full bg-white/[0.04]" />
                </div>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  border: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                <div className="mb-3 h-1.5 w-18 rounded-full bg-violet-500/20" />
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-white/[0.05]" />
                  <div className="h-1.5 w-2/3 rounded-full bg-white/[0.03]" />
                  <div className="h-1.5 w-4/5 rounded-full bg-white/[0.04]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
