import type { Metadata } from "next";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { PageHeader } from "@/components/PageHeader";
import {
  getAllArticles,
  getAllFieldNotes,
} from "@/lib/content";
import { buildReadingPaths } from "@/lib/reading-paths";
import { ReadingPaths } from "@/components/ReadingPaths";
import { CATEGORY_LABEL, type Category } from "@/lib/types";

const GalaxyGraph = nextDynamic(() => import("@/components/observatory/GalaxyGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] bg-[#0a1411] flex flex-col items-center justify-center text-[#46cfa8] font-mono border border-[#9ecdbf]/30">
      <div className="animate-pulse">MEMBANGUN GALAKSI PENGETAHUAN...</div>
      <div className="text-[10px] text-[#9ecdbf]/50 mt-2">MENYALAKAN INTI NEURAL & ORBIT SIMPUL</div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Peta Eksplorasi",
  description:
    "Daftar lokasi dan topik yang sudah dan sedang ditelusuri NaLI di seluruh Indonesia.",
  openGraph: {
    title: "Peta Eksplorasi | NaLI",
    description:
      "Daftar lokasi dan topik yang sudah dan sedang ditelusuri NaLI.",
    type: "website",
  },
};

const PILLAR_ORDER: Category[] = ["alam", "sejarah", "investigasi"];

export const dynamic = "force-dynamic";

export default async function PetaEksplorasiPage() {
  const articles = await getAllArticles();
  const notes = getAllFieldNotes();
  const locations = [...new Set(notes.map((n) => n.location_label))];
  const readingPaths = buildReadingPaths(articles);

  return (
    <>
      <PageHeader
        eyebrow="Indeks"
        title="Peta Eksplorasi"
        description="Bagaimana artikel, sumber, seri, dan topik NaLI saling terhubung. Jelajahi graf di layar lebar, atau telusuri indeks lokasi dan topik di bawah."
      />

      <div className="container-editorial py-12">
        {/* suggested reading paths: curated journeys, leads on mobile where the
            WebGL graph is hidden (Step 1.3) */}
        {readingPaths.length > 0 && (
          <div className="mb-14">
            <ReadingPaths paths={readingPaths} />
          </div>
        )}

        {/* interactive knowledge graph (desktop) */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-ink-black">Galaksi pengetahuan</h2>
          <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
            Bola dunia riset NaLI: tiap bintang adalah satu liputan yang mengorbit inti
            neural di pusatnya. Putar untuk menjelajah, klik untuk memilih, klik dua kali
            untuk membuka artikelnya. Galaksi ini terus hidup dan bertumbuh tiap kami terbit.
          </p>
          <div className="mt-5">
            <GalaxyGraph />
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
