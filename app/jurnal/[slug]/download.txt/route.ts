import { getPublicationBySlug, getPublicationSlugs } from "@/lib/jurnal";
import { ACCESS_TYPE_LABEL, PUBLICATION_TYPE_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPublicationSlugs().map((slug) => ({ slug }));
}

type Params = { slug: string };

function citation(pub: NonNullable<ReturnType<typeof getPublicationBySlug>>): string {
  const authors = pub.authors && pub.authors.length > 0 ? `${pub.authors.join("; ")}. ` : "";
  const year = pub.year ? `(${pub.year}). ` : "";
  const doi = pub.doi ? ` https://doi.org/${pub.doi}` : ` ${pub.sourceUrl}`;
  return `${authors}${year}${pub.title}. ${pub.publisherOrInstitution}.${doi}`;
}

function buildText(slug: string): string | null {
  const pub = getPublicationBySlug(slug);
  if (!pub) return null;

  const lines = [
    `NaLI by NatIve, Jurnal: Katalog Jurnal dan Publikasi Ilmiah Terbuka`,
    `${SITE.url}/jurnal/${pub.slug}`,
    `Berkas metadata yang disusun NaLI. Ini bukan naskah asli publikasi.`,
    ``,
    `JUDUL`,
    pub.title,
    ...(pub.originalTitle && pub.originalTitle !== pub.title ? [`Judul asli: ${pub.originalTitle}`] : []),
    ``,
    `JENIS PUBLIKASI`,
    PUBLICATION_TYPE_LABEL[pub.publicationType],
    ``,
    `PENERBIT / LEMBAGA`,
    pub.publisherOrInstitution,
    ...(pub.authors && pub.authors.length > 0 ? [``, `PENULIS`, pub.authors.join("; ")] : []),
    ``,
    `TAHUN`,
    pub.publicationDate ?? pub.year ?? "Tidak dicatat",
    ``,
    `URL SUMBER`,
    pub.sourceUrl,
    ...(pub.doi ? [``, `DOI`, `https://doi.org/${pub.doi}`] : []),
    ...(pub.pdfUrl ? [``, `PDF (akses terbuka)`, pub.pdfUrl] : []),
    ``,
    `AKSES`,
    ACCESS_TYPE_LABEL[pub.accessType],
    ``,
    `SINOPSIS (RINGKASAN NaLI)`,
    pub.synopsis,
    ``,
    `KENAPA PENTING`,
    pub.whyItMatters,
    ``,
    `TOPIK`,
    pub.topics.join(", "),
    ``,
    `GEOGRAFI`,
    pub.geography.join(", "),
    ``,
    `COVER`,
    `Visual: ${pub.cover.title}`,
    `Penerbit/lembaga: ${pub.cover.publisherOrInstitution}`,
    ...(pub.cover.creator ? [`Pencipta: ${pub.cover.creator}`] : []),
    `Sumber visual: ${pub.cover.sourceUrl}`,
    `Lisensi: ${pub.cover.license}`,
    `Dasar penayangan: ${pub.cover.displayBasis}`,
    ...(pub.cover.fallbackReason ? [`Catatan cover: ${pub.cover.fallbackReason}`] : []),
    ``,
    `BATASAN`,
    ...pub.limitations.map((l) => `- ${l}`),
    ``,
    `DICEK`,
    pub.checkedAt,
    ``,
    `RUJUKAN`,
    citation(pub),
    ``,
    `CATATAN PENGGUNAAN`,
    `Berkas ini hanya metadata dan ringkasan yang disusun NaLI untuk membantu menemukan publikasi asli.`,
    `Naskah lengkap tetap milik dan tanggung jawab penerbit aslinya; baca di URL sumber.`,
    ``,
  ];

  return lines.join("\n");
}

export function GET(_req: Request, { params }: { params: Params }) {
  const text = buildText(params.slug);
  if (text === null) {
    return new Response("Publikasi tidak ditemukan.", { status: 404 });
  }
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `inline; filename="nali-jurnal-${params.slug}.txt"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
