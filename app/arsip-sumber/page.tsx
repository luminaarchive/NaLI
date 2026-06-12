import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getAllSources } from "@/lib/content";
import { SOURCE_TYPE_LABEL, type SourceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Arsip Sumber",
  description:
    "Daftar sumber yang dipakai NaLI by NatIve — jurnal, arsip, buku, media, dan laporan. Setiap entri punya halaman keterangannya sendiri.",
  openGraph: {
    title: "Arsip Sumber | NaLI by NatIve",
    description:
      "Daftar sumber yang dipakai NaLI by NatIve — jurnal, arsip, buku, media, dan laporan.",
    type: "website",
  },
};

function excerpt(text: string | undefined, n = 120): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n).trimEnd()}…` : clean;
}

export default function ArsipSumberPage() {
  const sources = getAllSources();

  // count by type for the index strip
  const counts = new Map<SourceType, number>();
  for (const s of sources) counts.set(s.type, (counts.get(s.type) ?? 0) + 1);

  return (
    <>
      <PageHeader
        eyebrow="Transparansi"
        title="Arsip Sumber"
        description="Rujukan yang menopang tulisan kami — terbuka untuk diperiksa. Klik entri mana pun untuk membaca keterangannya."
      />

      <div className="container-editorial py-12">
        {sources.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Arsip sumber masih kosong.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
                {sources.length} entri sumber
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {[...counts.entries()].map(([type, n]) => (
                  <li
                    key={type}
                    className="font-mono text-[0.68rem] uppercase tracking-wider text-gray"
                  >
                    {SOURCE_TYPE_LABEL[type]} · {n}
                  </li>
                ))}
              </ul>
            </div>

            {/* table (sm+) */}
            <div className="mt-6 hidden overflow-hidden border border-ink/60 sm:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-wash">
                    {["No.", "Sumber", "Tipe", "Penulis", "Tahun", ""].map((h) => (
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
                  {sources.map((s, i) => (
                    <tr
                      key={s.slug}
                      className="group align-top font-mono text-[0.8rem] odd:bg-ink-wash/40 hover:bg-ink-wash"
                    >
                      <td className="border border-ink/30 px-4 py-3 font-mono text-[0.7rem] text-ink/60">
                        {String(i + 1).padStart(3, "0")}
                      </td>
                      <td className="border border-ink/30 px-4 py-3">
                        <Link
                          href={`/arsip-sumber/${s.slug}`}
                          className="font-semibold text-ink-deep underline decoration-ink/40 decoration-1 underline-offset-2 group-hover:decoration-ink-deep"
                        >
                          {s.title}
                        </Link>
                        {(s.related_topic || s.content) && (
                          <span className="mt-1 block max-w-xl font-mono text-xs text-gray-light">
                            {s.related_topic ? `${s.related_topic} — ` : ""}
                            {excerpt(s.content)}
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
                      <td className="border border-ink/30 px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/arsip-sumber/${s.slug}`}
                          className="font-mono text-[0.68rem] uppercase tracking-wider text-ink hover:underline"
                        >
                          Baca →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* stacked (mobile) */}
            <ul className="mt-6 space-y-4 sm:hidden">
              {sources.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/arsip-sumber/${s.slug}`}
                    className="block border border-dashed border-ink/60 bg-paper p-4 transition-colors hover:bg-ink-wash"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink">
                        {SOURCE_TYPE_LABEL[s.type]}
                      </span>
                      {s.year && (
                        <span className="font-mono text-xs uppercase tracking-wider text-ink/70">
                          {s.year}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-charcoal">{s.title}</p>
                    {s.author && <p className="mt-1 font-mono text-xs text-gray">{s.author}</p>}
                    {s.content && (
                      <p className="mt-2 font-mono text-xs leading-relaxed text-gray-light">
                        {excerpt(s.content, 100)}
                      </p>
                    )}
                    <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-wider text-ink">
                      Baca keterangan →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
