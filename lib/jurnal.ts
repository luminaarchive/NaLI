import type {
  AccessType,
  JournalPublication,
  PublicationCover,
  PublicationType,
  RawPublication,
} from "./types";
import { publications as rawPublications } from "@/content/jurnal";
import coversManifest from "@/content/jurnal/pub-covers.json";
import officialMetadataManifest from "@/content/jurnal/official-metadata.json";

const COVERS = coversManifest as Record<string, PublicationCover>;
const OFFICIAL_METADATA = officialMetadataManifest as Record<string, any>;

function sourceCard(pub: RawPublication): PublicationCover {
  return {
    title: pub.title,
    sourceUrl: pub.sourceUrl,
    publisherOrInstitution: pub.publisherOrInstitution,
    license: "Tidak menampilkan gambar",
    displayBasis: "Cover asli tidak ditampilkan karena lisensi belum jelas",
    attribution: `${pub.publisherOrInstitution}${pub.year ? `, ${pub.year}` : ""}`,
    alt: `Kartu sumber untuk ${pub.title}`,
    caption: `${pub.title}. Cover asli tidak ditampilkan karena lisensi belum jelas.`,
    checkedAt: pub.checkedAt,
    isRealSourceCover: false,
    fallbackReason: "Cover belum diverifikasi lisensinya.",
  };
}

function buildDownload(pub: RawPublication): JournalPublication["download"] {
  const metadataUrl = `/jurnal/${pub.slug}/download.txt`;
  if (pub.pdfUrl) {
    const kind =
      pub.publicationType === "dataset"
        ? "official_dataset"
        : pub.publicationType === "report" ||
            pub.publicationType === "institutional_document" ||
            pub.publicationType === "archive_record" ||
            pub.publicationType === "museum_record"
          ? "official_document"
          : "official_pdf";
    return {
      primaryKind: kind,
      primaryUrl: pub.pdfUrl,
      label: kind === "official_dataset" ? "Unduh dataset" : "Download PDF",
      note: "Tautan ke PDF/dokumen resmi dari penerbit, repositori, atau lembaga aslinya.",
      metadataUrl,
      fileSize: pub.fileSize,
    };
  }
  return {
    primaryKind: "external_source_only",
    primaryUrl: pub.officialPageUrl ?? pub.sourceUrl,
    label: "Buka sumber asli",
    note: "PDF resmi tidak tersedia; buka halaman publikasi di sumber aslinya.",
    metadataUrl,
    fileSize: pub.fileSize,
  };
}

function resolve(pub: RawPublication): JournalPublication {
  const official = OFFICIAL_METADATA[pub.slug] ?? {};
  const merged: RawPublication = {
    ...pub,
    volume: official.volume || undefined,
    issue: official.issue || undefined,
    pages: official.pages || undefined,
    license: official.license || undefined,
    peerReviewed: official.peerReviewed ?? undefined,
  };
  return {
    ...merged,
    cover: COVERS[pub.slug] ?? sourceCard(merged),
    download: buildDownload(merged),
  };
}

let _cache: JournalPublication[] | null = null;

/** All Jurnal publication records, de-duplicated by slug, sorted by title. */
export function getAllPublications(): JournalPublication[] {
  if (_cache) return _cache;
  const bySlug = new Map<string, JournalPublication>();
  for (const pub of rawPublications) {
    if (!bySlug.has(pub.slug)) bySlug.set(pub.slug, resolve(pub));
  }
  _cache = [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title, "id"));
  return _cache;
}

export function getPublicationCount(): number {
  return getAllPublications().length;
}

export function getPublicationSlugs(): string[] {
  return getAllPublications().map((p) => p.slug);
}

export function getPublicationBySlug(slug: string): JournalPublication | undefined {
  return getAllPublications().find((p) => p.slug === slug);
}

export function getPublicationTypes(): { type: PublicationType; count: number }[] {
  const m = new Map<PublicationType, number>();
  for (const p of getAllPublications()) m.set(p.publicationType, (m.get(p.publicationType) ?? 0) + 1);
  return [...m.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}

export function getPublicationPublishers(): string[] {
  const s = new Set<string>();
  for (const p of getAllPublications()) s.add(p.publisherOrInstitution);
  return [...s].sort((a, b) => a.localeCompare(b, "id"));
}

export function getPublicationTopics(): string[] {
  const s = new Set<string>();
  for (const p of getAllPublications()) for (const t of p.topics) s.add(t);
  return [...s].sort((a, b) => a.localeCompare(b, "id"));
}

export function getPublicationAccessTypes(): AccessType[] {
  const s = new Set<AccessType>();
  for (const p of getAllPublications()) s.add(p.accessType);
  return [...s];
}
