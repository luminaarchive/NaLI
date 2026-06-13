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

      <div className="container-read py-12 sm:py-16">
        {/* explicit scope, no fake first-party fieldwork */}
        <div className="mb-12 border border-dashed border-ink/60 bg-ink-wash/40 p-5">
          <p className="font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
            <span className="font-semibold text-ink-deep">Bukan klaim observasi pribadi NaLI.</span>{" "}
            Halaman ini merangkum bukti lapangan dari peneliti, lembaga, arsip, foto
            berlisensi, dan sumber publik yang dapat ditelusuri. NaLI belum melakukan
            observasi lapangan langsung.
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="text-gray">Belum ada catatan riset yang dipublikasikan.</p>
        ) : (
          <div className="space-y-16">
            {notes.map((note) => (
              <article key={note.slug} className="border-t border-dashed border-ink/70 pt-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="label text-ink">{note.location_label}</span>
                  <span className="text-gray-light" aria-hidden>
                    ·
                  </span>
                  <time dateTime={note.date} className="font-mono text-xs text-gray">
                    {formatDate(note.date)}
                  </time>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink">
                  {note.title}
                </h2>

                {note.evidenceType && note.evidenceType.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {note.evidenceType.map((e) => (
                      <span
                        key={e}
                        className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink"
                      >
                        {EVIDENCE_LABEL[e] ?? e}
                      </span>
                    ))}
                  </div>
                )}

                {note.summary && (
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-gray">
                    {note.summary}
                  </p>
                )}
                <div className="mt-5">
                  <MdxBody source={note.content} />
                </div>

                {note.limitations && note.limitations.length > 0 && (
                  <div className="mt-5 border-l-2 border-dashed border-ink/40 pl-4">
                    <p className="label text-ink/70">Batasan</p>
                    <ul className="mt-2 space-y-1.5">
                      {note.limitations.map((l) => (
                        <li key={l} className="font-mono text-[0.78rem] leading-relaxed text-gray">
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.sources && note.sources.length > 0 && (
                  <div className="mt-5">
                    <p className="label text-ink/70">Sumber</p>
                    <ul className="mt-2 space-y-1.5">
                      {note.sources.map((s, i) => (
                        <li key={i} className="font-mono text-[0.78rem] leading-snug text-ink-charcoal">
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-teal">
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                          <span className="ml-2 text-ink/50">· {SOURCE_TYPE_LABEL[s.type]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-dashed border-ink/50 px-3 py-1 font-mono text-xs text-ink"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
