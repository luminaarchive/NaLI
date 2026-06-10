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

export default function PetaEksplorasiPage() {
  const articles = getAllArticles();
  const notes = getAllFieldNotes();
  const locations = [...new Set(notes.map((n) => n.location_label))];

  return (
    <>
      <PageHeader
        eyebrow="Indeks"
        title="Peta Eksplorasi"
        description="Bukan peta interaktif — sebuah indeks. Lokasi yang sudah dijejaki dan topik yang sedang ditelusuri."
      />

      <div className="container-editorial py-12">
        {/* locations */}
        <section>
          <h2 className="font-display text-2xl text-ink-black">Lokasi lapangan</h2>
          {locations.length === 0 ? (
            <p className="mt-3 text-gray">Belum ada lokasi tercatat.</p>
          ) : (
            <ul className="mt-5 flex flex-wrap gap-3">
              {locations.map((loc) => (
                <li
                  key={loc}
                  className="rounded-full border border-rule bg-white px-4 py-2 text-sm text-ink-charcoal"
                >
                  <span className="text-teal-dark" aria-hidden>
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
              <div key={cat} className="border-t-2 border-ink-black pt-5">
                <p className="label text-teal-dark">{CATEGORY_LABEL[cat]}</p>
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
                          className="text-sm leading-snug text-ink-charcoal transition-colors hover:text-teal-dark"
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
