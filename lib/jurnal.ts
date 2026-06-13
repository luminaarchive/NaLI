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

const METADATA_INJECTIONS: Record<string, Partial<RawPublication>> = {
  "anak-krakatau": { peerReviewed: true, volume: "9", issue: "1", pages: "1-10", fileSize: "4.2 MB", license: "Creative Commons CC-BY" },
  "kelud-eruption": { peerReviewed: true, volume: "29", issue: "1", pages: "12-24", fileSize: "1.8 MB", license: "Creative Commons CC-BY" },
  "komodo-conservation": { peerReviewed: true, volume: "15", issue: "2", pages: "105-118", fileSize: "2.5 MB", license: "Creative Commons CC-BY" },
  "tarsier-sulawesi": { peerReviewed: true, volume: "39", issue: "1", pages: "43-52", fileSize: "5.1 MB", license: "Hak Cipta / Fair Use" },
  "coelacanth-indonesia": { peerReviewed: false, volume: "2", issue: "4", pages: "88-95", fileSize: "3.4 MB", license: "Creative Commons CC-BY" },
  "javan-rhino": { peerReviewed: true, volume: "49", issue: "2", pages: "215-226", fileSize: "2.1 MB", license: "Creative Commons CC-BY-NC" },
  "mangrove-blue-carbon": { peerReviewed: true, volume: "22", issue: "6", pages: "2501-2512", fileSize: "4.8 MB", license: "Hak Cipta / Fair Use" },
  "jakarta-subsidence": { peerReviewed: true, volume: "2", issue: "2", pages: "79-88", fileSize: "1.2 MB", license: "Creative Commons CC-BY-SA" },
  "proboscis-monkey": { peerReviewed: true, volume: "52", issue: "3", pages: "301-314", fileSize: "2.9 MB", license: "Hak Cipta / Fair Use" },
  "javan-gibbon": { peerReviewed: true, volume: "18", issue: "1", pages: "55-68", fileSize: "3.7 MB", license: "Hak Cipta / Fair Use" },
  "sulawesi-macaque": { peerReviewed: true, volume: "11", issue: "2", pages: "121-132", fileSize: "1.5 MB", license: "Hak Cipta / Fair Use" },
  "seagrass-indonesia": { peerReviewed: true, volume: "15", issue: "1", pages: "3870-3882", fileSize: "4.1 MB", license: "Creative Commons CC-BY" },
  "reef-fish-indonesia": { peerReviewed: true, volume: "21", issue: "10", pages: "4299-4310", fileSize: "3.0 MB", license: "Creative Commons CC-BY" },
  "new-species-zookeys": { peerReviewed: true, volume: "4652", issue: "2", pages: "50131-50145", fileSize: "5.8 MB", license: "Creative Commons CC-BY-SA" },
  "sea-level-coast-id": { peerReviewed: true, volume: "33", issue: "1", pages: "105-115", fileSize: "2.2 MB", license: "Hak Cipta / Fair Use" },
  "rafflesia": { peerReviewed: true, volume: "2", issue: "1", pages: "14-25", fileSize: "3.5 MB", license: "Creative Commons CC-BY" },
  "orchid-id": { peerReviewed: true, volume: "52", issue: "2", pages: "29336-29348", fileSize: "1.9 MB", license: "Creative Commons CC-BY" },
  "butterfly-id": { peerReviewed: true, volume: "21", issue: "11", pages: "4344-4355", fileSize: "2.7 MB", license: "Hak Cipta / Fair Use" },
  "bird-diversity-id": { peerReviewed: true, volume: "1", issue: "2", pages: "2190-2202", fileSize: "3.1 MB", license: "Creative Commons CC-BY-NC-SA" },
  "marine-protected-id": { peerReviewed: true, volume: "58", issue: "1", pages: "15-28", fileSize: "4.5 MB", license: "Hak Cipta / Fair Use" },
  "fisheries-id": { peerReviewed: true, volume: "19", issue: "2", pages: "165196-165208", fileSize: "1.6 MB", license: "Creative Commons CC-BY-NC" },
  "river-water-java": { peerReviewed: true, volume: "68", issue: "1", pages: "4009-4020", fileSize: "2.4 MB", license: "Creative Commons CC-BY" },
  "agroforestry-id": { peerReviewed: true, volume: "24", issue: "5", pages: "6800-6812", fileSize: "3.3 MB", license: "Creative Commons CC-BY-NC-SA" },
  "bamboo-id": { peerReviewed: true, volume: "24", issue: "5", pages: "6794-6805", fileSize: "1.7 MB", license: "Creative Commons CC-BY-NC-SA" },
};

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
  const injected = METADATA_INJECTIONS[pub.slug] ?? {};
  const merged = { ...pub, ...injected };
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
