import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug } from "@/lib/publications-db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return { title: "Tidak ditemukan" };
  return {
    title: pub.title,
    description:
      (pub.abstract ?? "").slice(0, 180) ||
      `Entri pustaka terbuka: ${pub.title}.`,
    alternates: { canonical: `/pustaka/${pub.slug}` },
  };
}

export default async function PublicationDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) notFound();

  const fullText = pub.oa_url || pub.pdf_url || pub.landing_url || (pub.doi ? `https://doi.org/${pub.doi}` : null);

  return (
    <div className="theme-arsip relative">
      <article className="container-editorial max-w-3xl py-14">
        <Link
          href="/pustaka"
          className="font-mono text-[0.7rem] uppercase tracking-widest text-ink/70 hover:text-ink"
        >
          &larr; Pustaka Terbuka
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-widest text-ink/70">
          <span>{pub.year ?? "Tahun n/a"}</span>
          <span>Akses terbuka</span>
          {pub.language && <span>{pub.language}</span>}
        </div>

        <h1 className="mt-4 font-display text-3xl font-black leading-tight text-ink sm:text-4xl">
          {pub.title}
        </h1>

        {pub.authors.length > 0 && (
          <p className="mt-4 font-mono text-[0.8rem] leading-relaxed text-gray">
            {pub.authors.join(", ")}
          </p>
        )}
        {pub.venue && (
          <p className="mt-1 font-mono text-[0.75rem] uppercase tracking-wide text-gray/80">
            {pub.venue}
          </p>
        )}

        {pub.abstract && (
          <section className="mt-8">
            <h2 className="label text-ink/80">Abstrak</h2>
            <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-charcoal">
              {pub.abstract}
            </p>
            <p className="mt-3 font-mono text-[0.66rem] leading-relaxed text-gray/80">
              Abstrak direkonstruksi dari metadata OpenAlex (CC0). Untuk metode, data, dan
              kesimpulan, baca naskah lengkap pada sumber resmi.
            </p>
          </section>
        )}

        {(pub.topics.length > 0 || pub.geography.length > 0) && (
          <section className="mt-8 flex flex-wrap gap-2">
            {[...pub.topics, ...pub.geography].slice(0, 12).map((t) => (
              <span
                key={t}
                className="border border-ink/25 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wide text-ink/80"
              >
                {t}
              </span>
            ))}
          </section>
        )}

        <section className="mt-10 border-t border-ink/15 pt-8">
          {fullText ? (
            <a
              href={fullText}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block border border-ink bg-ink px-6 py-3 font-mono text-[0.72rem] uppercase tracking-widest text-paper transition hover:bg-ink-deep"
            >
              Baca teks lengkap (sumber resmi) &rarr;
            </a>
          ) : (
            <p className="font-mono text-[0.78rem] text-gray">Tautan teks lengkap belum tersedia.</p>
          )}
          {pub.doi && (
            <p className="mt-4 font-mono text-[0.72rem] text-gray">
              DOI:{" "}
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-ink underline"
              >
                {pub.doi}
              </a>
            </p>
          )}
          {pub.license && (
            <p className="mt-1 font-mono text-[0.72rem] text-gray">Lisensi: {pub.license}</p>
          )}
          <p className="mt-6 font-mono text-[0.66rem] leading-relaxed text-gray/80">
            NaLI hanya menautkan ke salinan akses terbuka yang sudah dihosting resmi. Kami
            tidak menyimpan atau menyajikan ulang naskah berhak cipta.
          </p>
        </section>
      </article>
    </div>
  );
}
