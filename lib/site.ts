export const SITE = {
  name: "NaLI by NatIve",
  shortName: "NaLI",
  // Production domain on Vercel. Swap for a custom domain when one is bought.
  url: "https://nalijournal.vercel.app",
  tagline:
    "Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia, disusun dari jurnal, arsip, laporan lembaga, dataset, dan dokumentasi pihak ketiga.",
  description:
    "NaLI by NatIve, jurnal riset terbuka (open-source evidence journal) tentang alam, sejarah, dan investigasi Indonesia. Setiap klaim membawa sumber, label tingkat keyakinan, dan batasan.",
  locale: "id_ID",
  author: "Ansyahri Darma Tri Jati",
  // Single source of truth for the public contact address (still a placeholder
  // until the founder wires a real mailbox, see /kontak + /koreksi).
  email: "halo@nali.native.id",
} as const;

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/articles", label: "Artikel" },
  { href: "/seri", label: "Seri" },
  { href: "/arsip-sumber", label: "Arsip Sumber" },
  { href: "/metodologi", label: "Metodologi" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

/** Secondary links (footer "Publikasi" column), categories + trust pages. */
export const SECONDARY_LINKS: { href: string; label: string }[] = [
  { href: "/alam", label: "Alam" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/investigasi", label: "Investigasi" },
  { href: "/catatan-lapangan", label: "Catatan Riset" },
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
