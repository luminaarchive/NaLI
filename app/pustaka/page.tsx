import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PustakaSearch } from "@/components/pustaka/PustakaSearch";
import {
  listPublications,
  getPublicationCount,
  publicationsEnabled,
  PAGE_SIZE,
} from "@/lib/publications-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pustaka Terbuka",
  description:
    "Katalog metadata karya ilmiah akses terbuka (open access) yang relevan dengan Indonesia. Tiap entri menautkan ke teks lengkap yang sudah dihosting legal. Kami tidak mengunggah ulang naskah berhak cipta.",
  alternates: { canonical: "/pustaka" },
  openGraph: {
    title: "Pustaka Terbuka | NaLI",
    description:
      "Katalog metadata karya ilmiah akses terbuka. Tiap entri menautkan ke teks lengkap yang sudah dihosting legal.",
    type: "website",
  },
};

function fmtCount(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default async function PustakaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [{ rows, total }, libTotal] = await Promise.all([
    listPublications({ q, page }),
    getPublicationCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const mkHref = (p: number) =>
    `/pustaka?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) }).toString()}`;

  return (
    <div className="theme-arsip relative">
      <PageHeader
        eyebrow="Akses terbuka"
        title="Pustaka Terbuka"
        description={
          publicationsEnabled
            ? `Pintu ke ${fmtCount(libTotal)} karya ilmiah akses terbuka yang relevan dengan Indonesia. Kami menyimpan metadata (lisensi CC0) dan menautkan ke teks lengkap yang sudah dihosting legal. Tidak ada naskah berhak cipta yang kami unggah ulang.`
            : "Pustaka terbuka belum tersambung. Setel kredensial Supabase, lalu jalankan harvester akses-terbuka untuk mengisinya."
        }
      />

      <div className="container-editorial relative bg-paper/92 py-12">
        <PustakaSearch initial={q} />

        <p className="mt-6 text-center font-mono text-[0.72rem] uppercase tracking-widest text-gray">
          {q
            ? `${fmtCount(total)} hasil untuk "${q}"`
            : `${fmtCount(total)} entri dalam pustaka`}
        </p>

        {rows.length === 0 ? (
          <p className="mt-10 text-center font-mono text-[0.85rem] text-gray">
            {publicationsEnabled
              ? "Belum ada entri yang cocok. Coba kata kunci lain."
              : "Pustaka masih kosong sampai harvester dijalankan."}
          </p>
        ) : (
          <ul className="mt-10 grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <li key={p.id} className="bg-paper">
                <Link
                  href={`/pustaka/${p.slug}`}
                  className="flex h-full flex-col gap-3 p-5 transition hover:bg-ink-wash/40"
                >
                  <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-widest text-ink/70">
                    <span>{p.year ?? "Tahun n/a"}</span>
                    <span>Akses terbuka</span>
                  </div>
                  <h2 className="font-display text-[1.05rem] font-bold leading-snug text-ink">
                    {p.title}
                  </h2>
                  {p.authors.length > 0 && (
                    <p className="font-mono text-[0.72rem] leading-relaxed text-gray">
                      {p.authors.slice(0, 3).join(", ")}
                      {p.authors.length > 3 ? ", dkk." : ""}
                    </p>
                  )}
                  {p.venue && (
                    <p className="mt-auto font-mono text-[0.68rem] uppercase tracking-wide text-gray/80">
                      {p.venue}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3 font-mono text-[0.72rem] uppercase tracking-widest">
            {page > 1 ? (
              <Link href={mkHref(page - 1)} className="border border-ink/40 px-4 py-2 text-ink hover:bg-ink-wash/40">
                Sebelumnya
              </Link>
            ) : (
              <span className="border border-ink/15 px-4 py-2 text-gray/50">Sebelumnya</span>
            )}
            <span className="text-gray">
              Hal {fmtCount(page)} / {fmtCount(totalPages)}
            </span>
            {page < totalPages ? (
              <Link href={mkHref(page + 1)} className="border border-ink/40 px-4 py-2 text-ink hover:bg-ink-wash/40">
                Berikutnya
              </Link>
            ) : (
              <span className="border border-ink/15 px-4 py-2 text-gray/50">Berikutnya</span>
            )}
          </nav>
        )}

        <p className="mx-auto mt-12 max-w-2xl text-center font-mono text-[0.68rem] leading-relaxed text-gray/80">
          Pustaka ini hanya mengatalogkan karya berlisensi akses terbuka dan menautkan ke
          salinan resmi. NaLI tidak menyimpan atau menyajikan ulang naskah berhak cipta.
        </p>
      </div>
    </div>
  );
}
