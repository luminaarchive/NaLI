import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageBackdrop } from "@/components/PageBackdrop";
import { DynamicWaveBackground } from "@/components/ui/dynamic-wave-canvas-background";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { Rss } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi NaLI, kabar, koreksi, atau usulan topik.",
  openGraph: {
    title: "Kontak | NaLI",
    description: "Hubungi NaLI, kabar, koreksi, atau usulan topik.",
    type: "website",
  },
};

const EMAIL = SITE.email;

export default function KontakPage() {
  return (
    <div className="theme-kontak relative">
      <PageBackdrop light="opacity-[0.40]">
        <DynamicWaveBackground colorLow={[14, 22, 46]} colorHigh={[86, 128, 214]} />
      </PageBackdrop>
      <PageHeader
        eyebrow="Kontak"
        title="Punya kabar, koreksi, atau usulan topik?"
        description="Koreksi yang berdasar sangat kami hargai, begitu juga petunjuk untuk penelusuran berikutnya."
      />

      <div className="container-read relative bg-paper/90 py-12 sm:py-16">
        <div className="border border-dashed border-ink/70 bg-paper p-7">
          <p className="label">Email</p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-2 inline-block font-display text-2xl text-ink transition-colors hover:text-ink-deep sm:text-3xl"
          >
            {EMAIL}
          </a>
          <p className="mt-3 text-sm text-gray">
            Untuk koreksi, sertakan tautan tulisan dan sumber yang mendukung.
          </p>
        </div>

        <div className="mt-10">
          <p className="label">Tempat kami menerbitkan</p>
          <ul className="mt-4 space-y-3">
            {SOCIAL_LINKS.map((c) => (
              <li
                key={c.platform}
                className="flex items-center justify-between gap-4 border-b border-dashed border-ink/40 pb-3"
              >
                <span className="flex flex-col">
                  {c.status === "active" && c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-ink transition-colors hover:text-ink-deep"
                    >
                      {c.platform}
                      {c.handle ? ` ${c.handle}` : ""} ↗
                    </a>
                  ) : (
                    <span className="text-ink-black">{c.platform}</span>
                  )}
                  <span className="text-sm text-gray">{c.note}</span>
                </span>
                {c.status === "coming-soon" && (
                  <span className="shrink-0 border border-dashed border-ink/40 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-gray-light">
                    Segera hadir
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <p className="label">Ikuti lewat RSS</p>
          <a
            href="/feed.xml"
            className="mt-3 inline-flex items-center gap-2 border border-dashed border-ink/60 px-4 py-2 font-mono text-[0.78rem] text-ink transition-colors hover:bg-ink-wash"
          >
            <Rss className="h-4 w-4" strokeWidth={1.7} aria-hidden />
            feed.xml
          </a>
        </div>
      </div>
    </div>
  );
}
