import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
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
    <>
      <PageHeader
        eyebrow="Kontak"
        title="Punya kabar, koreksi, atau usulan topik?"
        description="Koreksi yang berdasar sangat kami hargai, begitu juga petunjuk untuk penelusuran berikutnya."
      />

      <div className="container-read py-12 sm:py-16 space-y-6">
        <div className="border border-dashed border-ink/70 bg-paper p-6">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">KONTAK SURAT</span>
            <span>{"//"}</span>
            <span>DIRECT EMAIL</span>
          </div>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 font-display text-2xl text-ink transition-colors hover:text-ink-deep sm:text-3xl interactive-link"
          >
            {EMAIL} <span className="link-arrow-diagonal">↗</span>
          </a>
          <p className="mt-3 font-mono text-xs text-gray">
            Untuk koreksi, sertakan rujukan artikel yang dimaksud serta sumber primer/sekunder yang valid.
          </p>
        </div>

        <div className="border border-dashed border-ink/70 bg-paper p-6">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">SALURAN INFORMASI</span>
            <span>{"//"}</span>
            <span>PUBLICATION FEEDS</span>
          </div>
          <ul className="space-y-3 font-mono text-xs text-gray">
            {CHANNELS.map((c) => (
              <li
                key={c.label}
                className="flex items-center justify-between border-b border-dashed border-ink/20 pb-2 last:border-0"
              >
                <span className="text-ink-deep font-semibold">{c.label}</span>
                <span>{c.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
