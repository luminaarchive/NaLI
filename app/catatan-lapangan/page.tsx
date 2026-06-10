import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MdxBody } from "@/components/MdxBody";
import { getAllFieldNotes } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Catatan Lapangan",
  description:
    "Observasi mentah dari lapangan — sebelum jadi artikel. Tanggal, lokasi, dan apa yang benar-benar terlihat.",
  openGraph: {
    title: "Catatan Lapangan | NaLI by NatIve",
    description: "Observasi mentah dari lapangan — sebelum jadi artikel.",
    type: "website",
  },
};

export default function CatatanLapanganPage() {
  const notes = getAllFieldNotes();

  return (
    <>
      <PageHeader
        eyebrow="Field notes"
        title="Catatan Lapangan"
        description="Observasi mentah dari lapangan — sebelum disusun jadi artikel. Tanggal, lokasi, dan apa yang benar-benar terlihat di tempat."
      />

      <div className="container-read py-12 sm:py-16">
        {notes.length === 0 ? (
          <p className="text-gray">Belum ada catatan lapangan yang dipublikasikan.</p>
        ) : (
          <div className="space-y-16">
            {notes.map((note) => (
              <article key={note.slug} className="border-t-2 border-ink-black pt-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="label text-teal-dark">{note.location_label}</span>
                  <span className="text-gray-light" aria-hidden>
                    ·
                  </span>
                  <time dateTime={note.date} className="font-mono text-xs text-gray">
                    {formatDate(note.date)}
                  </time>
                </div>
                <h2 className="mt-3 font-display text-2xl text-ink-black">
                  {note.title}
                </h2>
                {note.summary && (
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-gray">
                    {note.summary}
                  </p>
                )}
                <div className="mt-5">
                  <MdxBody source={note.content} />
                </div>
                {note.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-teal-bg px-3 py-1 font-mono text-xs text-teal-dark"
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
