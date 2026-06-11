import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getAllSources } from "@/lib/content";
import { SOURCE_TYPE_LABEL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Arsip Sumber",
  description:
    "Daftar sumber yang dipakai NaLI by NatIve — jurnal, arsip, buku, media, dan laporan. Transparansi rujukan.",
  openGraph: {
    title: "Arsip Sumber | NaLI by NatIve",
    description:
      "Daftar sumber yang dipakai NaLI by NatIve — jurnal, arsip, buku, media, dan laporan.",
    type: "website",
  },
};

export default function ArsipSumberPage() {
  const sources = getAllSources();

  return (
    <>
      <PageHeader
        eyebrow="Transparansi"
        title="Arsip Sumber"
        description="Rujukan yang menopang tulisan kami — terbuka untuk diperiksa. Jurnal, arsip, buku, media, dan laporan."
      />

      <div className="container-editorial py-12">
        {sources.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Arsip sumber masih kosong.</p>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
              {sources.length} entri sumber
            </p>

            {/* table (sm+) */}
            <div className="mt-6 hidden overflow-hidden border border-ink/60 sm:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-wash">
                    {["Sumber", "Tipe", "Penulis", "Tahun", "Keandalan"].map((h) => (
                      <th
                        key={h}
                        className="border border-ink/40 px-4 py-3 text-left font-mono text-[0.68rem] uppercase tracking-label text-ink-deep"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.slug} className="align-top font-mono text-[0.8rem] odd:bg-ink-wash/40">
                      <td className="border border-ink/30 px-4 py-3">
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-teal"
                          >
                            {s.title}
                          </a>
                        ) : (
                          <span className="text-ink-charcoal">{s.title}</span>
                        )}
                        {s.related_topic && (
                          <span className="mt-1 block font-mono text-xs text-gray-light">
                            {s.related_topic}
                          </span>
                        )}
                      </td>
                      <td className="border border-ink/30 px-4 py-3">
                        <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink">
                          {SOURCE_TYPE_LABEL[s.type]}
                        </span>
                      </td>
                      <td className="border border-ink/30 px-4 py-3 text-gray">
                        {s.author ?? "—"}
                      </td>
                      <td className="border border-ink/30 px-4 py-3 font-mono text-gray">
                        {s.year ?? "—"}
                      </td>
                      <td className="border border-ink/30 px-4 py-3 text-xs text-gray">
                        {s.reliability ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* stacked (mobile) */}
            <ul className="mt-6 space-y-4 sm:hidden">
              {sources.map((s) => (
                <li key={s.slug} className="border border-dashed border-ink/60 bg-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink">
                      {SOURCE_TYPE_LABEL[s.type]}
                    </span>
                    {s.year && (
                      <span className="font-mono text-xs uppercase tracking-wider text-ink/70">{s.year}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink-charcoal">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-teal"
                      >
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                  </p>
                  {s.author && <p className="mt-1 text-xs text-gray">{s.author}</p>}
                  {s.reliability && (
                    <p className="mt-2 font-mono text-xs text-gray-light">{s.reliability}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
