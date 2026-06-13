import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxBody } from "@/components/MdxBody";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import {
  getJournalEntryBySlug,
  getJournalSlugs,
  getRelatedJournalEntries,
} from "@/lib/jurnal";
import { getSourceBySlug } from "@/lib/content";
import { JOURNAL_CATEGORY_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const entry = getJournalEntryBySlug(params.slug);
  if (!entry) return { title: "Entri jurnal tidak ditemukan" };
  return {
    title: entry.title,
    description: entry.dek,
    alternates: { canonical: `/jurnal/${entry.slug}` },
    openGraph: {
      title: `${entry.title} | Jurnal, NaLI by NatIve`,
      description: entry.dek,
      type: "article",
    },
  };
}

export default function JurnalEntryPage({ params }: { params: Params }) {
  const entry = getJournalEntryBySlug(params.slug);
  if (!entry) notFound();

  const sources = entry.sourceIds
    .map((id) => getSourceBySlug(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const related = getRelatedJournalEntries(entry);
  const coverImage = entry.cover.localPath ?? entry.cover.imageUrl ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.dek,
    dateModified: entry.checkedAt,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Jurnal NaLI", url: `${SITE.url}/jurnal` },
  };

  return (
    <article className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-read py-12 sm:py-16">
        <Link href="/jurnal" className="label text-gray transition-colors hover:text-ink-deep">
          ← Jurnal
        </Link>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink">
            {JOURNAL_CATEGORY_LABEL[entry.category]}
          </span>
          <ConfidenceBadge confidence={entry.confidence} size="sm" />
          {entry.readingMinutes && (
            <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/60">
              {entry.readingMinutes} menit baca
            </span>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-ink-black sm:text-4xl">
          {entry.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray">{entry.dek}</p>

        {/* mandatory visible cover near the top: real source image, or source-card fallback */}
        <figure className="mt-7" data-jurnal-cover="true">
          {coverImage ? (
            <div className="overflow-hidden border border-dashed border-ink/55 bg-ink-wash/30">
              <Image
                src={coverImage}
                alt={entry.cover.alt}
                width={1200}
                height={800}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          ) : (
            <div
              className="border border-dashed border-ink/55 bg-ink-wash/40 p-6"
              data-jurnal-cover-fallback="true"
            >
              <p className="label text-ink/60">Kartu sumber</p>
              <p className="mt-2 font-display text-xl font-semibold leading-snug text-ink-black">
                {entry.cover.sourceTitle}
              </p>
              <p className="mt-1 font-mono text-[0.74rem] text-ink/60">{entry.cover.publisherOrInstitution}</p>
              <p className="mt-3 font-mono text-[0.7rem] text-ink/50">
                Cover asli tidak ditampilkan karena lisensi belum jelas
              </p>
            </div>
          )}
          <figcaption className="mt-3" data-jurnal-cover-credit="true">
            <p className="font-mono text-[0.76rem] leading-relaxed text-ink-charcoal">{entry.cover.caption}</p>
            <p className="mt-1 font-mono text-[0.68rem] leading-relaxed text-ink/60">
              {entry.cover.creator ? `${entry.cover.creator}. ` : ""}
              {entry.cover.publisherOrInstitution}.{" "}
              <a href={entry.cover.sourceUrl} className="link-teal" data-jurnal-cover-source="true">
                Sumber visual
              </a>
              {". "}
              {entry.cover.displayBasis}
              {entry.cover.checkedAt ? <span className="text-ink/40"> Dicek {entry.cover.checkedAt}.</span> : null}
            </p>
          </figcaption>
        </figure>

        {/* human synopsis */}
        <section className="mt-7 border-l-2 border-dashed border-ink/50 pl-4" data-jurnal-synopsis="true">
          <h2 className="label text-ink/70">Sinopsis</h2>
          <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-charcoal">{entry.synopsis}</p>
        </section>

        {/* download */}
        <div className="mt-6">
          <a
            href={`/jurnal/${entry.slug}/download.txt`}
            className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep"
            download={`nali-jurnal-${entry.slug}.txt`}
          >
            Unduh catatan (TXT) <span aria-hidden>↓</span>
          </a>
        </div>

        <div className="mt-8">
          <MdxBody source={entry.body} />
        </div>

        {/* key takeaway */}
        <section className="mt-10 border border-dashed border-ink/60 bg-ink-wash/40 p-5">
          <h2 className="label text-ink/70">Intinya</h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-charcoal">{entry.keyTakeaway}</p>
        </section>

        {/* sources */}
        {sources.length > 0 && (
          <section className="mt-8">
            <h2 className="label text-ink/70">Sumber</h2>
            <ul className="mt-3 space-y-2">
              {sources.map((s) => (
                <li key={s.slug} className="font-mono text-[0.82rem] leading-relaxed">
                  <Link
                    href={`/arsip-sumber/${s.slug}`}
                    className="text-ink-deep underline decoration-ink/40 decoration-1 underline-offset-2 hover:decoration-ink-deep"
                  >
                    {s.title}
                  </Link>
                  {s.year ? <span className="text-ink/50"> · {s.year}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* limitations */}
        {entry.limitations.length > 0 && (
          <section className="mt-8 border-l-2 border-dashed border-ink/50 pl-4">
            <h2 className="label text-ink/70">Batasan</h2>
            <ul className="mt-2 space-y-1.5">
              {entry.limitations.map((l) => (
                <li key={l} className="font-mono text-[0.8rem] leading-relaxed text-gray">
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 font-mono text-[0.72rem] text-ink/50">Dicek {entry.checkedAt}.</p>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-dashed border-ink/40 pt-8">
            <h2 className="label text-ink/70">Entri lain di kategori ini</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/jurnal/${r.slug}`}
                    className="flex h-full flex-col border border-dashed border-ink/50 bg-paper p-4 transition-colors hover:bg-ink-wash"
                  >
                    <span className="font-display text-base font-semibold leading-snug text-ink-black">
                      {r.title}
                    </span>
                    <span className="mt-1 text-[0.82rem] leading-relaxed text-gray">{r.dek}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
