import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getAllArticles, getAllSources } from "@/lib/content";
import { getAllPublications } from "@/lib/jurnal";

/* -------------------------------------------------------------------------- */
/*  /cari : server-rendered search results.                                    */
/*                                                                            */
/*  Backs the WebSite SearchAction (sitelinks search box) and gives readers a  */
/*  real, shareable, no-JS search page alongside the Cmd+K modal. Result pages */
/*  are noindex (thin/duplicate by nature); the page itself stays crawlable.   */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cari",
  description: "Cari artikel, jurnal, dan sumber di arsip NaLI.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cari" },
};

interface Hit {
  type: "Artikel" | "Jurnal" | "Sumber";
  title: string;
  href: string;
  excerpt: string;
}

async function search(q: string): Promise<Hit[]> {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];

  const [articles, sources, jurnal] = [
    await getAllArticles(),
    getAllSources(),
    getAllPublications(),
  ];

  const matches = (hay: (string | undefined)[]) =>
    hay.some((h) => h && h.toLowerCase().includes(needle));

  const hits: Hit[] = [];
  for (const a of articles) {
    if (matches([a.title, a.summary, a.subtitle, ...(a.tags ?? [])]))
      hits.push({ type: "Artikel", title: a.title, href: `/articles/${a.slug}`, excerpt: a.summary || a.subtitle || "" });
  }
  for (const j of jurnal) {
    if (matches([j.title, j.synopsis, ...(j.topics ?? [])]))
      hits.push({ type: "Jurnal", title: j.title, href: `/jurnal/${j.slug}`, excerpt: j.synopsis || "" });
  }
  for (const s of sources) {
    if (matches([s.title, s.content, ...(s.topics ?? [])]))
      hits.push({ type: "Sumber", title: s.title, href: `/arsip-sumber/${s.slug}`, excerpt: (s.content || "").slice(0, 160) });
  }
  return hits;
}

export default async function CariPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const hits = q ? await search(q) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Pencarian"
        title="Cari di arsip NaLI"
        description="Telusuri artikel, katalog jurnal, dan entri arsip sumber. Tekan Cmd/Ctrl + K di mana saja untuk pencarian kilat."
      />

      <div className="container-editorial py-10 sm:py-14">
        <form action="/cari" method="get" className="flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Kata kunci, mis. harimau jawa, samalas, pesut"
            aria-label="Kata kunci pencarian"
            className="w-full border border-dashed border-ink/60 bg-paper px-3 py-2.5 font-mono text-[0.84rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 bg-ink px-5 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
          >
            Cari
          </button>
        </form>

        {q && (
          <p className="mt-6 font-mono text-[0.78rem] text-gray">
            {hits.length} hasil untuk &ldquo;{q}&rdquo;.
          </p>
        )}

        {q && hits.length === 0 && (
          <p className="mt-6 font-mono text-[0.84rem] text-ink-charcoal">
            Tidak ada yang cocok. Coba kata kunci lain, atau jelajahi lewat{" "}
            <Link href="/peta-eksplorasi" className="text-ink-deep underline underline-offset-2">
              peta pengetahuan
            </Link>
            .
          </p>
        )}

        {hits.length > 0 && (
          <ul className="mt-8 divide-y divide-dashed divide-ink/30 border-t border-dashed border-ink/30">
            {hits.map((h) => (
              <li key={h.href} className="py-5">
                <Link href={h.href} className="group block">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink/55">
                    {h.type}
                  </span>
                  <span className="mt-1 block font-display text-lg font-bold leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
                    {h.title}
                  </span>
                  {h.excerpt && (
                    <span className="mt-1 line-clamp-2 block font-mono text-[0.78rem] leading-relaxed text-gray">
                      {h.excerpt}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
