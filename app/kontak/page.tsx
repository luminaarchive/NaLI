import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageBackdrop } from "@/components/PageBackdrop";
import { DynamicWaveBackground } from "@/components/ui/dynamic-wave-canvas-background";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi NaLI by NatIve, kabar, koreksi, atau usulan topik.",
  openGraph: {
    title: "Kontak | NaLI by NatIve",
    description: "Hubungi NaLI by NatIve, kabar, koreksi, atau usulan topik.",
    type: "website",
  },
};

const EMAIL = SITE.email;

const CHANNELS = [
  { label: "X (Twitter)", note: "Thread dan tulisan pendek" },
  { label: "Instagram", note: "Fact card visual & carousel" },
  { label: "TikTok", note: "Video pendek 30–60 detik" },
];

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

      <div className="container-read relative bg-paper/72 py-12 backdrop-blur-sm sm:py-16">
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
            {CHANNELS.map((c) => (
              <li
                key={c.label}
                className="flex items-center justify-between border-b border-dashed border-ink/40 pb-3"
              >
                <span className="text-ink-black">{c.label}</span>
                <span className="text-sm text-gray">{c.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
