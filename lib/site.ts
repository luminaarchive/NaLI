export const SITE = {
  name: "NaLI",
  shortName: "NaLI",
  // Primary custom domain (Hostinger registrar, DNS at Hostinger, served by
  // Vercel). All other domains (www + the *.vercel.app aliases) 308-redirect here.
  url: "https://nalibynative.com",
  tagline:
    "Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia, disusun dari jurnal, arsip, laporan lembaga, dataset, dan dokumentasi pihak ketiga.",
  description:
    "NaLI, jurnal riset terbuka (open-source evidence journal) tentang alam, sejarah, dan investigasi Indonesia. Setiap klaim membawa sumber, label tingkat keyakinan, dan batasan.",
  locale: "id_ID",
  author: "NaLI",
  // Single source of truth for the public contact address (still a placeholder
  // until the founder wires a real mailbox, see /kontak + /koreksi).
  email: "halo@nali.native.id",
} as const;

// Reader-first order: lead with what to read, not the internal control room.
// Kept lean on purpose until content volume catches up with the V2 surfaces
// (those are reachable from the homepage and /ruang-kendali hub).
export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/articles", label: "Artikel" },
  { href: "/jurnal", label: "Jurnal" },
  { href: "/pustaka", label: "Pustaka" },
  { href: "/arsip-sumber", label: "Arsip Sumber" },
  { href: "/seri", label: "Seri" },
  { href: "/ruang-kendali", label: "Ruang Kendali" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

/**
 * Distribution channels (X, Instagram, TikTok). BUG-002: until the founder has
 * live accounts, status stays "coming-soon" and the UI renders "Segera hadir"
 * instead of a dead link. To activate, fill `handle` + `url` and flip status to
 * "active".
 */
export interface SocialLink {
  platform: string;
  handle?: string;
  url?: string;
  note: string;
  status: "active" | "coming-soon";
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "X (Twitter)",
    note: "Thread dan tulisan pendek",
    status: "coming-soon",
  },
  {
    platform: "Instagram",
    note: "Fact card visual dan carousel",
    status: "coming-soon",
  },
  {
    platform: "TikTok",
    note: "Video pendek 30-60 detik",
    status: "coming-soon",
  },
];

/** Secondary links (footer "Publikasi" column), categories + trust pages. */
export const SECONDARY_LINKS: { href: string; label: string }[] = [
  { href: "/alam", label: "Alam" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/investigasi", label: "Investigasi" },
  { href: "/catatan-lapangan", label: "Catatan Riset" },
  { href: "/metodologi", label: "Metodologi" },
  { href: "/pedoman-sumber", label: "Pedoman Sumber" },
  { href: "/koreksi", label: "Koreksi" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/peta-eksplorasi", label: "Indeks Eksplorasi" },
];

export const PILLARS: {
  key: "alam" | "sejarah" | "investigasi";
  index: string;
  title: string;
  href: string;
  blurb: string;
}[] = [
  {
    key: "alam",
    index: "01",
    title: "Alam",
    href: "/alam",
    blurb:
      "Ekologi, satwa, dan fenomena lanskap Indonesia, dibaca dari jurnal, penilaian lembaga, dan observasi peneliti.",
  },
  {
    key: "sejarah",
    index: "02",
    title: "Sejarah",
    href: "/sejarah",
    blurb:
      "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang, dibaca ulang dari arsip dan historiografi dengan hati-hati.",
  },
  {
    key: "investigasi",
    index: "03",
    title: "Investigasi",
    href: "/investigasi",
    blurb:
      "Penelusuran berbasis sumber publik dan dataset. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu.",
  },
];
