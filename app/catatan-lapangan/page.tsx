import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MdxBody } from "@/components/MdxBody";
import { getAllFieldNotes } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { SOURCE_TYPE_LABEL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catatan Riset",
  description:
    "Catatan awal dari sumber terbuka, laporan peneliti, arsip, dokumentasi pihak ketiga, dan data publik, sebelum disusun jadi artikel. Bukan klaim observasi pribadi NaLI.",
  openGraph: {
    title: "Catatan Riset | NaLI by NatIve",
    description:
      "Catatan awal dari sumber terbuka sebelum jadi artikel. Bukan klaim observasi pribadi NaLI.",
    type: "website",
  },
};

const EVIDENCE_LABEL: Record<string, string> = {
  journal: "Jurnal",
  government_report: "Laporan pemerintah",
  museum_record: "Catatan museum",
  archive: "Arsip",
  researcher_observation: "Observasi peneliti",
  licensed_photo: "Foto berlisensi",
  map: "Peta",
  dataset: "Dataset",
  media: "Media",
};

export default function CatatanRisetPage() {
  const notes = getAllFieldNotes();

  return (
    <>
      <PageHeader
        eyebrow="Riset terbuka"
        title="Catatan Riset"
        description="Catatan awal dari sumber terbuka: laporan peneliti, observasi lembaga, arsip, dokumentasi lapangan pihak ketiga, dan data publik, sebelum disusun menjadi artikel panjang."
      />

      <div className="container-read py-12 sm:py-16 space-y-8">
        {/* explicit scope, no fake first-party fieldwork */}
        <div className="border border-dashed border-ink/60 bg-paper p-5">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">BATASAN OBSERVASI</span>
            <span>{"//"}</span>
            <span>NO FIRST-PARTY FIELDWORK</span>
          </div>
          <p className="font-mono text-[0.76rem] leading-relaxed text-gray">
            <span className="font-semibold text-ink-deep uppercase tracking-wider text-[0.7rem] block mb-1">Bukan klaim observasi pribadi NaLI.</span>{" "}
            Halaman ini merangkum bukti lapangan dari peneliti, lembaga, arsip, foto
            berlisensi, dan sumber publik yang dapat ditelusuri. NaLI belum melakukan
            observasi lapangan langsung.
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="text-gray font-mono text-sm bg-paper p-6 border border-dashed border-ink/40 text-center">Belum ada catatan riset yang dipublikasikan.</p>
        ) : (
          <div className="space-y-8">
            {notes.map((note) => {
              const refNo = `NL-NTE-${note.slug.slice(0, 8).toUpperCase()}`;
              return (
                <article key={note.slug} className="border border-dashed border-ink/40 bg-paper p-5 scroll-mt-24 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink/20 pb-3 mb-4 font-mono text-[0.66rem] uppercase tracking-wider text-ink/70">
                      <div className="flex items-center gap-2">
                        <span className="bg-ink-wash/30 border border-dashed border-ink/25 px-2 py-0.5 font-semibold text-ink">CATATAN DATA</span>
                        <span>{"//"}</span>
                        <span>{note.location_label}</span>
                      </div>
                      <span>REF NO. {refNo}</span>
                    </div>

                    <h2 className="mt-3 font-display text-xl font-bold uppercase text-ink">
                      {note.title}
                    </h2>
                    <div className="mt-2 font-mono text-[0.68rem] text-gray uppercase tracking-wider">
                      Tanggal rilis: {formatDate(note.date)}
                    </div>

                    {note.evidenceType && note.evidenceType.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {note.evidenceType.map((e) => (
                          <span
                            key={e}
                            className="border border-dashed border-ink/40 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink/75 bg-paper"
                          >
                            {EVIDENCE_LABEL[e] ?? e}
                          </span>
                        ))}
                      </div>
                    )}

                    {note.summary && (
                      <p className="mt-4 text-[0.9rem] leading-relaxed text-gray font-sans border-l-2 border-ink-wash pl-3">
                        {note.summary}
                      </p>
                    )}
                    <div className="mt-5">
                      <MdxBody source={note.content} />
                    </div>

                    {note.limitations && note.limitations.length > 0 && (
                      <div className="mt-6 border-t border-dashed border-ink/20 pt-4">
                        <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-wider text-ink/70 mb-3">
                          <span className="bg-ink-wash/30 border border-dashed border-ink/25 px-2 py-0.5 font-semibold text-ink">BATASAN BUKTI</span>
                          <span>{"//"}</span>
                          <span>LIMITATIONS</span>
                        </div>
                        <ul className="space-y-1.5 font-mono text-[0.74rem] text-gray">
                          {note.limitations.map((l) => (
                            <li key={l} className="flex gap-2">
                              <span>•</span>
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.sources && note.sources.length > 0 && (
                      <div className="mt-6 border-t border-dashed border-ink/20 pt-4">
                        <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-wider text-ink/70 mb-3">
                          <span className="bg-ink-wash/30 border border-dashed border-ink/25 px-2 py-0.5 font-semibold text-ink">JEJAK SUMBER</span>
                          <span>{"//"}</span>
                          <span>SOURCES</span>
                        </div>
                        <ul className="space-y-2 font-mono text-[0.74rem] text-gray">
                          {note.sources.map((s, i) => (
                            <li key={i} className="flex flex-wrap items-center gap-2">
                              <span className="text-ink/40 select-none bg-ink-wash/10 border border-dashed border-ink/25 px-1.5 py-0.5 font-mono text-[0.62rem]">#{i + 1}</span>
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-teal hover:underline interactive-link">
                                  {s.title} <span className="link-arrow-diagonal">↗</span>
                                </a>
                              ) : (
                                s.title
                              )}
                              <span className="border border-dashed border-ink/30 px-1.5 py-0.5 text-[0.6rem] uppercase bg-paper">{SOURCE_TYPE_LABEL[s.type]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.tags.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-1.5 border-t border-dashed border-ink/20 pt-4">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-dashed border-ink/40 bg-paper px-2 py-0.5 font-mono text-[0.62rem] text-ink uppercase tracking-wider"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
