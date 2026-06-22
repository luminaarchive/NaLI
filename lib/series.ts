/**
 * Editorial series. Articles reference these by slug via frontmatter `series: [...]`.
 * Keeping NaLI's output as a coherent publication rather than scattered posts.
 */
export interface Series {
  slug: string;
  title: string;
  /** Short editorial promise. */
  promise: string;
  status: "active" | "planned";
}

export const SERIES: Series[] = [
  {
    slug: "misteri-nusantara",
    title: "Misteri Nusantara",
    promise:
      "Manusia kerdil di Flores, lukisan gua tertua di dunia, situs megalit yang diperdebatkan, dan daratan yang hilang di bawah laut. Teka-teki Indonesia yang paling menggugah rasa ingin tahu, dibaca dari bukti nyata, dengan garis tegas antara yang sudah terbukti dan yang masih gelap.",
    status: "active",
  },
  {
    slug: "spesies-hilang-bertahan",
    title: "Spesies yang Hilang dan Bertahan",
    promise:
      "Satwa Indonesia yang dinyatakan punah, nyaris punah, atau diam-diam bertahan, dibaca dari jurnal, penilaian IUCN, dan catatan museum, dengan standar pembuktian yang ketat.",
    status: "active",
  },
  {
    slug: "fenomena-alam-disalahpahami",
    title: "Fenomena Alam Indonesia yang Sering Disalahpahami",
    promise:
      "Gunung api, danau kawah, dan peristiwa geologi yang viral tapi keliru dijelaskan, diluruskan dengan data lembaga vulkanologi dan literatur ilmiah.",
    status: "active",
  },
  {
    slug: "sungai-pesisir-krisis-lingkungan",
    title: "Sungai, Pesisir, dan Krisis Lingkungan",
    promise:
      "Sungai tercemar, laguna menyempit, pesisir tenggelam, apa yang bisa dan tidak bisa dibuktikan dari dokumen resmi, dataset, dan kajian publik.",
    status: "active",
  },
  {
    slug: "kota-arsip-memori-kolonial",
    title: "Kota, Arsip, dan Memori Kolonial",
    promise:
      "Kota pelabuhan, kanal, dan jalur dagang Nusantara dibaca ulang dari arsip kolonial, katalog museum, dan historiografi, fakta dipisahkan tegas dari folklor.",
    status: "active",
  },
  {
    slug: "wallacea-evolusi",
    title: "Wallacea dan Keunikan Evolusi",
    promise:
      "Garis Wallace, fauna peralihan, dan keanehan evolusi di Sulawesi dan Maluku, kenapa wilayah ini menjadi laboratorium hidup bagi biologi.",
    status: "planned",
  },
  {
    slug: "arsip-nusantara",
    title: "Arsip Nusantara",
    promise:
      "Naskah, babad, peta tua, dan dokumen yang jarang dibuka, dirujuk ke koleksi lembaga dan dibaca dengan kehati-hatian terhadap bias sumbernya.",
    status: "planned",
  },
  {
    slug: "investigasi-sumber-terbuka",
    title: "Investigasi Berbasis Sumber Terbuka",
    promise:
      "Risiko lingkungan dan konflik sumber daya ditelusuri dari dokumen publik dan data satelit, tanpa menuduh tanpa bukti, dengan ruang hak jawab.",
    status: "planned",
  },
];

const BY_SLUG = new Map(SERIES.map((s) => [s.slug, s]));

export function getSeries(slug: string): Series | undefined {
  return BY_SLUG.get(slug);
}
