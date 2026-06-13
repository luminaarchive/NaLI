import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  getAllArticles,
  getAllFieldNotes,
} from "@/lib/content";
import { CATEGORY_LABEL, type Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Peta Eksplorasi",
  description:
    "Daftar lokasi dan topik yang sudah dan sedang ditelusuri NaLI by NatIve di seluruh Indonesia.",
  openGraph: {
    title: "Peta Eksplorasi | NaLI by NatIve",
    description:
      "Daftar lokasi dan topik yang sudah dan sedang ditelusuri NaLI by NatIve.",
    type: "website",
  },
};

const PILLAR_ORDER: Category[] = ["alam", "sejarah", "investigasi"];

export const dynamic = "force-dynamic";

export default async function PetaEksplorasiPage() {
  const articles = await getAllArticles();
  const notes = getAllFieldNotes();
  const locations = [...new Set(notes.map((n) => n.location_label))];

  return (
    <>
      <PageHeader
        eyebrow="Indeks"
        title="Indeks Eksplorasi"
        description="Bukan peta interaktif dan bukan jejak ekspedisi pribadi. Ini indeks lokasi dan topik dalam liputan NaLI, disusun dari sumber terbuka."
      />

      <div className="container-editorial py-12 space-y-12">
        {/* locations */}
        <section className="border border-dashed border-ink/40 bg-paper p-6">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">REGISTRASI LOKASI</span>
            <span>{"//"}</span>
            <span>COVERED GEOGRAPHIES</span>
          </div>
          {locations.length === 0 ? (
            <p className="text-gray font-mono text-sm">Belum ada lokasi tercatat.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <li
                  key={loc}
                  className="border border-dashed border-ink/50 bg-paper px-3 py-1 font-mono text-[0.74rem] text-ink-charcoal uppercase tracking-wider"
                >
                  <span className="text-ink" aria-hidden>◇ </span>
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* topics by pillar */}
        <section className="grid gap-6 md:grid-cols-3">
          {PILLAR_ORDER.map((cat) => {
            const inCat = articles.filter((a) => a.category === cat);
            const refNo = `CAT-${cat.toUpperCase().slice(0, 3)}`;
            return (
              <div key={cat} className="border border-dashed border-ink/40 bg-paper p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-3 mb-4 font-mono text-[0.66rem] uppercase tracking-wider text-ink/70">
                    <span className="bg-ink-wash/30 border border-dashed border-ink/25 px-2 py-0.5 font-semibold text-ink">
                      {CATEGORY_LABEL[cat]}
                    </span>
                    <span>{refNo}</span>
                  </div>
                  {inCat.length === 0 ? (
                    <p className="mt-4 text-xs font-mono text-gray-light">
                      Belum ada topik.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {inCat.map((a) => (
                        <li key={a.slug} className="border-b border-dashed border-ink/10 pb-2 last:border-0 last:pb-0">
                          <Link
                            href={`/articles/${a.slug}`}
                            className="font-mono text-[0.78rem] leading-snug text-ink transition-colors hover:text-ink-deep interactive-link"
                          >
                            {a.title} <span className="link-arrow">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
