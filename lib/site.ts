export const SITE = {
  name: "NaLI by NatIve",
  shortName: "NaLI",
  // Free production domain (Vercel). Swap for a custom domain when one is bought.
  url: "https://nalibynative.vercel.app",
  tagline:
    "Field journal dan research publication berbasis AI untuk membongkar dan menceritakan alam, sejarah, dan fenomena tersembunyi Indonesia.",
  description:
    "NaLI by NatIve — jurnal lapangan dan publikasi riset berbasis AI tentang alam, sejarah, dan investigasi Indonesia. Setiap klaim diberi label tingkat keyakinan dan didukung sumber.",
  locale: "id_ID",
  author: "Ansyahri Darma Tri Jati",
} as const;

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/articles", label: "Artikel" },
  { href: "/alam", label: "Alam" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/investigasi", label: "Investigasi" },
  { href: "/catatan-lapangan", label: "Catatan Lapangan" },
  { href: "/arsip-sumber", label: "Arsip Sumber" },
  { href: "/tentang", label: "Tentang" },
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
      "Ekologi, satwa, dan fenomena lanskap Indonesia — diceritakan dari lapangan, dirujuk ke jurnal.",
  },
  {
    key: "sejarah",
    index: "02",
    title: "Sejarah",
    href: "/sejarah",
    blurb:
      "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang — dibaca ulang dengan hati-hati.",
  },
  {
    key: "investigasi",
    index: "03",
    title: "Investigasi",
    href: "/investigasi",
    blurb:
      "Penelusuran berbasis sumber publik. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu.",
  },
];
