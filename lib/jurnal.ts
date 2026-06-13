import type {
  AccessType,
  JournalPublication,
  PublicationCover,
  PublicationType,
  RawPublication,
} from "./types";
import { publications as rawPublications } from "@/content/jurnal";
import coversManifest from "@/content/jurnal/pub-covers.json";

const COVERS = coversManifest as Record<string, PublicationCover>;

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

function resolve(pub: RawPublication): JournalPublication {
  return {
    ...pub,
    cover: COVERS[pub.slug] ?? sourceCard(pub),
    download: {
      enabled: true,
      downloadKind: "metadata_txt",
      downloadUrl: `/jurnal/${pub.slug}/download.txt`,
      note: "Berkas metadata yang disusun NaLI: ringkasan publikasi, bukan naskah aslinya.",
    },
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
