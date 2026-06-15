import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getTimelineEvents } from "@/lib/timeline";
import { CATEGORY_LABEL, type Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Linimasa",
  description:
    "Garis waktu peristiwa yang ditelusuri NaLI, disusun dari tulisan yang menyebut tahunnya secara eksplisit. Tiap titik tersambung ke artikel dan sumbernya.",
  alternates: { canonical: "/linimasa" },
  openGraph: {
    title: "Linimasa | NaLI by NatIve",
    description:
      "Garis waktu peristiwa Indonesia yang ditelusuri NaLI, tersambung ke artikel dan sumber.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const DOT: Record<string, string> = {
  alam: "bg-[#2DD4A7]",
  sejarah: "bg-[#3B82F6]",
  investigasi: "bg-[#F97316]",
  "catatan-lapangan": "bg-gray/60",
};

export default async function LinimasaPage() {
  const events = await getTimelineEvents();

  return (
    <div className="theme-sejarah relative">
      <PageHeader
        eyebrow="Modul 4"
        title="Linimasa"
        description="Hanya peristiwa yang tahunnya benar-benar tertulis di tulisannya yang kami letakkan di sini. Sisanya menunggu bukti yang lebih jelas."
      />

      <div className="container-editorial py-12 sm:py-16">
        {events.length === 0 ? (
          <p className="font-mono text-sm text-gray">Belum ada peristiwa bertanggal pasti.</p>
        ) : (
          <ol className="relative border-l border-dashed border-ink/40 pl-6 sm:pl-8">
            {events.map((e) => (
              <li key={e.id} className="relative mb-10 last:mb-0">
                <span
                  className={`absolute -left-[1.6rem] top-1.5 inline-block h-3 w-3 rounded-full ring-2 ring-paper sm:-left-[2.1rem] ${
                    DOT[e.kategori] ?? "bg-ink"
                  }`}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-2xl font-bold tabular-nums text-ink">
                    {e.tahun}
                  </span>
                  <span className="label text-ink/70">
                    {CATEGORY_LABEL[e.kategori as Category] ?? e.kategori}
                  </span>
                </div>
                <Link
                  href={`/articles/${e.articleSlug}`}
                  className="mt-1 block font-display text-xl leading-tight text-ink-black transition-colors hover:text-ink-deep"
                >
                  {e.peristiwa}
                </Link>
                {e.ringkasan && (
                  <p className="mt-2 max-w-2xl font-mono text-[0.8rem] leading-relaxed text-gray">
                    {e.ringkasan}
                  </p>
                )}
                {e.sumberId.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.sumberId.slice(0, 4).map((sid) => (
                      <Link
                        key={sid}
                        href={`/arsip-sumber/${sid}`}
                        className="border border-dashed border-ink/40 px-2 py-1 font-mono text-[0.68rem] text-ink/80 transition-colors hover:bg-ink-wash"
                      >
                        sumber: {sid}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
