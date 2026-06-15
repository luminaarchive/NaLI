import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  getAllArticles,
  getAllFieldNotes,
} from "@/lib/content";
import { buildKnowledgeGraph } from "@/lib/graph";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
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
  const graph = await buildKnowledgeGraph();

  return (
    <>
      <PageHeader
        eyebrow="Indeks"
        title="Peta Eksplorasi"
        description="Bagaimana artikel, sumber, seri, dan topik NaLI saling terhubung. Jelajahi graf di layar lebar, atau telusuri indeks lokasi dan topik di bawah."
      />

      <div className="container-editorial py-12">
        {/* interactive knowledge graph (desktop) */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-ink-black">Graf pengetahuan</h2>
          <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
            Tiap simpul adalah artikel, sumber, seri, atau topik. Garis menandai relasi.
            Klik untuk membuka, seret untuk menata, saring lewat filter.
          </p>
          <div className="mt-5">
            <KnowledgeGraph graph={graph} />
          </div>
          <p className="mt-3 font-mono text-[0.7rem] text-gray-light md:hidden">
            Graf interaktif tampil di layar lebar. Di perangkat kecil, gunakan indeks di bawah.
          </p>
        </section>

        {/* locations */}
        <section>
          <h2 className="font-display text-2xl text-ink-black">Lokasi dalam liputan</h2>
          {locations.length === 0 ? (
            <p className="mt-3 text-gray">Belum ada lokasi tercatat.</p>
          ) : (
            <ul className="mt-5 flex flex-wrap gap-3">
              {locations.map((loc) => (
                <li
                  key={loc}
                  className="border border-dashed border-ink/60 bg-paper px-4 py-2 font-mono text-[0.8rem] text-ink-charcoal"
                >
                  <span className="text-ink" aria-hidden>
                    ◇{" "}
                  </span>
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* topics by pillar */}
        <section className="mt-14 grid gap-10 md:grid-cols-3">
          {PILLAR_ORDER.map((cat) => {
            const inCat = articles.filter((a) => a.category === cat);
            return (
              <div key={cat} className="border-t border-dashed border-ink/60 pt-5">
                <p className="label text-ink">{CATEGORY_LABEL[cat]}</p>
                {inCat.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-light">
                    Belum ada topik.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {inCat.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/articles/${a.slug}`}
                          className="font-mono text-[0.8rem] leading-snug text-ink transition-colors hover:text-ink-deep"
                        >
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
