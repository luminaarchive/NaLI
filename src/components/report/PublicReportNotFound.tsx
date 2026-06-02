import { NaLIChatLogo } from "@/components/report/NaLIChatLogo";

/**
 * Read-only "report not found" view for the public /r/[id] route. Rendered inline
 * by the page (wrapped by the segment's dark layout) so it stays visible and
 * leak-free for invalid, expired, or un-shared tokens.
 */
export function PublicReportNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center text-center" style={{ width: 380, maxWidth: "100%" }}>
        <NaLIChatLogo size={40} />
        <h1 className="mt-5 font-serif text-2xl font-semibold text-[#f5f0e8]">Laporan tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/45">
          Link mungkin salah, sudah kedaluwarsa, atau laporan ini tidak lagi dibagikan.
        </p>
        <a
          href="https://naliai.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block text-[11px] text-white/30 transition hover:text-white/55"
        >
          Dibuat dengan NaLI · naliai.vercel.app
        </a>
      </div>
    </main>
  );
}
