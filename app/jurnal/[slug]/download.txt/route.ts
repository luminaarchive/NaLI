import { getJournalEntryBySlug, getJournalSlugs } from "@/lib/jurnal";
import { getSourceBySlug } from "@/lib/content";
import { JOURNAL_CATEGORY_LABEL, CONFIDENCE_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }));
}

type Params = { slug: string };

function buildText(slug: string): string | null {
  const e = getJournalEntryBySlug(slug);
  if (!e) return null;

  const sources = e.sourceIds.map((id) => {
    const s = getSourceBySlug(id);
    if (!s) return `- ${id}`;
    const link = s.url ?? (s.doi ? `https://doi.org/${s.doi}` : s.archiveUrl ?? `${SITE.url}/arsip-sumber/${s.slug}`);
    return `- ${s.title}${s.year ? ` (${s.year})` : ""}\n  ${link}`;
  });

  const lines = [
    `NaLI by NatIve, Jurnal Riset Terbuka Indonesia`,
    `${SITE.url}/jurnal/${e.slug}`,
    ``,
    `JUDUL`,
    e.title,
    ``,
    `DEK`,
    e.dek,
    ``,
    `SINOPSIS`,
    e.synopsis,
    ``,
    `KATEGORI`,
    JOURNAL_CATEGORY_LABEL[e.category],
    ``,
    `TOPIK`,
    e.topics.join(", "),
    ``,
    `GEOGRAFI`,
    e.geography.join(", "),
    ``,
    `TINGKAT KEYAKINAN`,
    CONFIDENCE_LABEL[e.confidence],
    ``,
    `INTI`,
    e.keyTakeaway,
    ``,
    `ISI`,
    e.body,
    ``,
    `BATASAN`,
    ...e.limitations.map((l) => `- ${l}`),
    ``,
    `SUMBER`,
    ...sources,
    ``,
    `COVER`,
    `Judul: ${e.cover.title}`,
    `Jenis cover: ${e.cover.coverKind}`,
    `Sumber visual: ${e.cover.sourceTitle}`,
    `Penerbit/lembaga: ${e.cover.publisherOrInstitution}`,
    ...(e.cover.creator ? [`Pencipta: ${e.cover.creator}`] : []),
    `URL sumber: ${e.cover.sourceUrl}`,
    `Lisensi: ${e.cover.license}`,
    `Dasar penayangan: ${e.cover.displayBasis}`,
    `Atribusi: ${e.cover.attribution}`,
    ...(e.cover.fallbackReason ? [`Alasan fallback: ${e.cover.fallbackReason}`] : []),
    ``,
    `DICEK`,
    e.checkedAt,
    ``,
    `LISENSI / CATATAN PENGGUNAAN`,
    `Catatan ini diterbitkan terbuka oleh NaLI by NatIve untuk dibaca dan dirujuk. Sebutkan sumber asli`,
    `yang tercantum saat mengutip. Cover adalah visual penjelas internal NaLI, bukan foto lapangan.`,
    ``,
  ];

  return lines.join("\n");
}

export function GET(_req: Request, { params }: { params: Params }) {
  const text = buildText(params.slug);
  if (text === null) {
    return new Response("Entri jurnal tidak ditemukan.", { status: 404 });
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
