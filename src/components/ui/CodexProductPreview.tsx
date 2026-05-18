"use client";

/**
 * CodexProductPreview — Dark app window mockup rising from bottom of hero.
 * Shows a simplified NaLI report interface preview.
 */
export function CodexProductPreview() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-[1060px] px-4 sm:mt-20 sm:px-6">
      <div className="relative overflow-hidden rounded-t-2xl border border-black/[0.08] bg-[#0f0f12] shadow-2xl shadow-black/20">
        {/* macOS traffic dots */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-3 text-xs font-medium text-white/40">NaLI — Create Report</span>
        </div>

        {/* App interface preview */}
        <div className="flex min-h-[280px] sm:min-h-[340px]">
          {/* Sidebar */}
          <div className="hidden w-[200px] shrink-0 border-r border-white/[0.06] bg-white/[0.02] p-4 sm:block">
            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Workspace</span>
            </div>
            <div className="space-y-1">
              {["New report", "Evidence queue", "Sources", "Export"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium ${
                    i === 0
                      ? "bg-white/[0.08] text-white"
                      : "text-white/35 hover:text-white/50"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-400">NaLI</span>
              <span className="text-xs text-white/20">/</span>
              <span className="text-xs text-white/40">report</span>
            </div>

            {/* Command input */}
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-sm text-white/30">Draft from uploaded notes...</p>
            </div>

            {/* Evidence cards preview */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-2 h-2 w-16 rounded-full bg-indigo-500/20" />
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                  <div className="h-2 w-3/4 rounded-full bg-white/[0.04]" />
                  <div className="h-2 w-5/6 rounded-full bg-white/[0.05]" />
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-2 h-2 w-20 rounded-full bg-violet-500/20" />
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                  <div className="h-2 w-2/3 rounded-full bg-white/[0.04]" />
                  <div className="h-2 w-4/5 rounded-full bg-white/[0.05]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
