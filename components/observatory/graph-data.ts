export interface GraphNode {
  id: string;
  label: string;
  group: "alam" | "sejarah" | "investigasi";
  val: number;
  synopsis: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * JSON Schema Draft 2020-12 validation representation for GraphData structure.
 * Equips the system with self-describing documentation and validation parameters.
 */
export const GRAPH_DATA_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NaLI Shadow Graph Data Schema",
  "type": "object",
  "properties": {
    "nodes": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/GraphNode"
      }
    },
    "links": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/GraphLink"
      }
    }
  },
  "required": ["nodes", "links"],
  "additionalProperties": false,
  "$defs": {
    "GraphNode": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "label": {
          "type": "string"
        },
        "group": {
          "type": "string",
          "enum": ["alam", "sejarah", "investigasi"]
        },
        "val": {
          "type": "integer",
          "minimum": 5,
          "maximum": 30
        },
        "synopsis": {
          "type": "string"
        }
      },
      "required": ["id", "label", "group", "val", "synopsis"],
      "additionalProperties": false
    },
    "GraphLink": {
      "type": "object",
      "properties": {
        "source": {
          "type": "string"
        },
        "target": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "label": {
          "type": "string"
        }
      },
      "required": ["source", "target", "type", "label"],
      "additionalProperties": false
    }
  }
};

export const graphData: GraphData = {
  nodes: [
    // ALAM (Category/Group: 'alam')
    {
      id: "benua-kehilangan-llsvp",
      label: "Benua Kehilangan di Bawah Kaki Kita (LLSVP)",
      group: "alam",
      val: 22,
      synopsis: "Struktur mantel geologi misterius jauh di bawah lempeng bumi Nusantara."
    },
    {
      id: "lautan-canfield",
      label: "Lautan Canfield",
      group: "alam",
      val: 14,
      synopsis: "Anomali kimia samudra purba kaya belerang yang memengaruhi evolusi hayati."
    },
    {
      id: "black-browed-babbler",
      label: "Black-browed Babbler",
      group: "alam",
      val: 18,
      synopsis: "Burung endemik Kalimantan yang hilang selama 172 tahun sebelum ditemukan kembali secara tak terduga."
    },
    {
      id: "echidna-attenborough",
      label: "Echidna Attenborough",
      group: "alam",
      val: 18,
      synopsis: "Mamalia bertelur purba Papua yang dikonfirmasi bertahan hidup di Pegunungan Cyclops."
    },
    {
      id: "lazarus-taxon",
      label: "Lazarus Taxon",
      group: "alam",
      val: 16,
      synopsis: "Metodologi klasifikasi taksonomi bagi spesies yang muncul kembali setelah dianggap punah."
    },
    {
      id: "lebah-raksasa-wallace",
      label: "Lebah Raksasa Wallace",
      group: "alam",
      val: 15,
      synopsis: "Lebah terbesar di dunia yang ditemukan kembali bertahan di kepulauan Maluku Utara."
    },
    {
      id: "nepenthes-pitopangii",
      label: "Nepenthes pitopangii",
      group: "alam",
      val: 12,
      synopsis: "Kantong semar endemik nan langka yang terisolasi di puncak pegunungan Sulawesi Tengah."
    },
    {
      id: "seriwang-sangihe",
      label: "Seriwang Sangihe",
      group: "alam",
      val: 15,
      synopsis: "Burung pemakan serangga biru langka yang bertahan di hutan pegunungan terisolasi Pulau Sangihe."
    },
    {
      id: "spesies-hilang-nusantara",
      label: "Spesies Indonesia yang Masih Hilang",
      group: "alam",
      val: 17,
      synopsis: "Daftar investigasi satwa endemik yang tidak pernah terlihat lagi di alam bebas selama puluhan tahun."
    },
    {
      id: "pesut-mahakam",
      label: "Pesut Mahakam",
      group: "alam",
      val: 19,
      synopsis: "Lumba-lumba air tawar sungai Mahakam yang berjuang melawan punah akibat jalur transportasi kapal."
    },
    {
      id: "anak-krakatau-2018",
      label: "Anak Krakatau 2018",
      group: "alam",
      val: 20,
      synopsis: "Runtuhan tubuh gunung api bawah laut yang memicu tsunami senyap di Selat Sunda."
    },
    {
      id: "anoa",
      label: "Anoa",
      group: "alam",
      val: 15,
      synopsis: "Kerbau kerdil purba endemik Sulawesi yang terancam fragmentasi kawasan hutan."
    },
    {
      id: "babirusa",
      label: "Babirusa",
      group: "alam",
      val: 15,
      synopsis: "Mamalia bertaring aneh yang melengkung menembus kulit moncongnya di Wallacea."
    },
    {
      id: "cenderawasih",
      label: "Cenderawasih",
      group: "alam",
      val: 14,
      synopsis: "Burung surga berbulu indah asal Papua yang terancam akibat perburuan liar kolonial dan modern."
    },
    {
      id: "coelacanth-sulawesi",
      label: "Coelacanth Sulawesi",
      group: "alam",
      val: 21,
      synopsis: "Fosil ikan purba hidup bertulang sirip mirip kaki yang berenang di gua-gua laut dalam Manado Tua."
    },
    {
      id: "dieng",
      label: "Dieng",
      group: "alam",
      val: 16,
      synopsis: "Dataran tinggi vulkanik aktif yang menyimpan bahaya pelepasan gas CO2 beracun."
    },
    {
      id: "harimau-bali",
      label: "Harimau Bali",
      group: "alam",
      val: 18,
      synopsis: "Subspesies harimau terkecil yang punah pertama akibat perburuan massal era kolonial Belanda."
    },
    {
      id: "harimau-jawa",
      label: "Harimau Jawa",
      group: "alam",
      val: 22,
      synopsis: "Spesies predator puncak Jawa yang dinyatakan punah namun menyisakan spekulasi jejak fisik."
    },
    {
      id: "kelud",
      label: "Kelud",
      group: "alam",
      val: 18,
      synopsis: "Sistem danau kawah eksplosif yang dijinakkan melalui pembangunan terowongan drainase air."
    },
    {
      id: "komodo",
      label: "Komodo",
      group: "alam",
      val: 20,
      synopsis: "Kadal purba raksasa penyintas zaman es yang bertahan di ekosistem savana Nusa Tenggara."
    },
    {
      id: "krakatau-1883",
      label: "Krakatau 1883",
      group: "alam",
      val: 24,
      synopsis: "Letusan katastrofik global yang meruntuhkan pulau vulkanik dan mengubah iklim dunia."
    },
    {
      id: "mangrove-indonesia",
      label: "Mangrove Indonesia",
      group: "alam",
      val: 17,
      synopsis: "Benteng pesisir tropis penyimpan cadangan karbon biru terbesar di planet bumi."
    },
    {
      id: "merapi",
      label: "Merapi",
      group: "alam",
      val: 20,
      synopsis: "Gunung api paling aktif di Jawa dengan ancaman kubah lava runtuh dan awan panas piroklastik."
    },
    {
      id: "orangutan-tapanuli",
      label: "Orangutan Tapanuli",
      group: "alam",
      val: 19,
      synopsis: "Kera besar paling terancam punah sedunia yang terisolasi di ekosistem Batang Toru."
    },
    {
      id: "tarsius",
      label: "Tarsius",
      group: "alam",
      val: 13,
      synopsis: "Primata malam kerdil bermata besar pemakan serangga dari belantara Sulawesi."
    },
    {
      id: "terumbu-karang",
      label: "Terumbu Karang",
      group: "alam",
      val: 16,
      synopsis: "Pusat keanekaragaman hayati laut segitiga karang dunia yang terancam pemutihan akibat suhu air."
    },
    {
      id: "toba",
      label: "Toba",
      group: "alam",
      val: 25,
      synopsis: "Supervolcano purba dengan letusan dahsyat yang memicu penyusutan populasi manusia purba global."
    },
    {
      id: "badak-jawa",
      label: "Badak Jawa",
      group: "alam",
      val: 22,
      synopsis: "Mamalia cula satu paling langka di dunia yang bertahan hidup di semenanjung Ujung Kulon."
    },
    {
      id: "tambora-1815",
      label: "Tambora 1815",
      group: "alam",
      val: 25,
      synopsis: "Letusan kolosal VEI 7 yang memicu tsunami regional dan fenomena tahun tanpa musim panas global."
    },
    {
      id: "api-biru-kawah-ijen",
      label: "Api Biru Kawah Ijen",
      group: "alam",
      val: 16,
      synopsis: "Fenomena pembakaran gas belerang bertekanan tinggi saat terpapar oksigen di bibir kawah."
    },
    {
      id: "maleo",
      label: "Maleo",
      group: "alam",
      val: 17,
      synopsis: "Burung endemik penimbun telur berukuran besar di pasir pantai geotermal Sulawesi."
    },
    {
      id: "segara-anakan",
      label: "Segara Anakan",
      group: "alam",
      val: 16,
      synopsis: "Laguna estuari mangrove luas di Jawa Selatan yang terancam pendangkalan laju sedimentasi sungai."
    },

    // NEW ALAM NODES FROM BATCH 1
    {
      id: "jamur-pembunuh-amfibi",
      label: "Jamur Pembunuh Amfibi (Chytrid)",
      group: "alam",
      val: 15,
      synopsis: "Patogen mematikan penyulut krisis keanekaragaman amfibi global di ekosistem tropis."
    },
    {
      id: "bottleneck-genetik-toba",
      label: "Penyusutan Populasi Genetik Toba (Bottleneck)",
      group: "alam",
      val: 22,
      synopsis: "Penyusutan populasi manusia purba global pasca letusan supervolcano Toba."
    },
    {
      id: "megathrust-jawa-selatan",
      label: "Zona Megathrust Jawa Selatan",
      group: "alam",
      val: 23,
      synopsis: "Potensi gempa kolosal subduksi lempeng aktif di sepanjang pesisir selatan Jawa."
    },

    // SEJARAH (Category/Group: 'sejarah')
    {
      id: "selat-yang-hilang-laut-demak",
      label: "Selat yang Hilang (Laut Demak)",
      group: "sejarah",
      val: 21,
      synopsis: "Selat navigasi maritim ramai abad pertengahan yang mendangkal menjadi daratan subur di pantai utara Jawa."
    },
    {
      id: "homo-floresiensis",
      label: "Homo floresiensis",
      group: "sejarah",
      val: 23,
      synopsis: "Spesies hominid kerdil purba penemu perkakas batu di gua Liang Bua, Flores."
    },
    {
      id: "prasasti-yupa",
      label: "Prasasti Yupa",
      group: "sejarah",
      val: 20,
      synopsis: "Monumen batu beraksara tertua di Indonesia penanda sejarah aksara awal di Kutai."
    },
    {
      id: "banda-neira",
      label: "Banda Neira",
      group: "sejarah",
      val: 22,
      synopsis: "Kepulauan vulkanik kecil pusat monopoli rempah pala yang memicu penjajahan kolonial kejam."
    },
    {
      id: "borobudur",
      label: "Borobudur",
      group: "sejarah",
      val: 24,
      synopsis: "Monumen relief batu Buddha terbesar yang direstorasi dari ancaman pelapukan rembesan air."
    },
    {
      id: "peta-lama-nusantara",
      label: "Peta Lama Nusantara",
      group: "sejarah",
      val: 18,
      synopsis: "Dokumentasi kartografi kolonial kuno yang melukiskan ambisi penguasaan rute rempah maritim."
    },
    {
      id: "samalas-1257",
      label: "Samalas 1257",
      group: "sejarah",
      val: 25,
      synopsis: "Letusan mega-vulkanik Lombok abad ke-13 yang tercatat dalam babad geologi dan mengubah iklim abad pertengahan."
    },
    {
      id: "kota-tua-jakarta",
      label: "Kota Tua Jakarta",
      group: "sejarah",
      val: 19,
      synopsis: "Sisa benteng kota kolonial Batavia dengan kanal air pengalir limbah wabah malaria."
    },

    // NEW SEJARAH NODES FROM BATCH 1
    {
      id: "tahun-tanpa-musim-panas",
      label: "Tahun Tanpa Musim Panas (1816)",
      group: "sejarah",
      val: 18,
      synopsis: "Anomali iklim ekstrem global dan kegagalan panen masif akibat abu letusan Tambora 1815."
    },
    {
      id: "palembang-sriwijaya-pantai",
      label: "Palembang & Garis Pantai Sriwijaya Purba",
      group: "sejarah",
      val: 19,
      synopsis: "Transformasi geomorfologi pesisir Sumatra Selatan yang mendangkalkan ibu kota maritim Sriwijaya."
    },
    {
      id: "genetika-wallacea-cengkeh",
      label: "Jejak Genetika Cengkeh & Rempah Wallacea",
      group: "sejarah",
      val: 16,
      synopsis: "Analisis penyebaran genetik tanaman cengkeh asli Maluku melewati batas Kepulauan Wallacea."
    },

    // INVESTIGASI (Category/Group: 'investigasi')
    {
      id: "ekspor-pasir-laut",
      label: "Ekspor Pasir Laut",
      group: "investigasi",
      val: 18,
      synopsis: "Analisis dampak ekologis penambangan pasir pesisir terhadap hilangnya pulau-pulau kecil terluar."
    },
    {
      id: "deforestasi-kalimantan",
      label: "Deforestasi Kalimantan",
      group: "investigasi",
      val: 22,
      synopsis: "Data pemantauan hilangnya kanopi hutan primer akibat perkebunan monokultur kelapa sawit."
    },
    {
      id: "gambut-indonesia",
      label: "Gambut Indonesia",
      group: "investigasi",
      val: 20,
      synopsis: "Investigasi pengeringan lahan gambut basah penyulut kebakaran bara bawah permukaan."
    },
    {
      id: "sampah-plastik-laut",
      label: "Sampah Plastik Laut",
      group: "investigasi",
      val: 18,
      synopsis: "Pemetaan aliran limbah polimer dari muara sungai perkotaan ke ekosistem terumbu karang terluar."
    },
    {
      id: "jakarta-tenggelam",
      label: "Jakarta Tenggelam",
      group: "investigasi",
      val: 23,
      synopsis: "Krisis penurunan permukaan tanah pesisir akibat ekstraksi air tanah dalam masif."
    },
    {
      id: "citarum",
      label: "Citarum",
      group: "investigasi",
      val: 21,
      synopsis: "Investigasi buangan limbah kimia beracun industri tekstil di sepanjang aliran sungai vital Jawa."
    },

    // NEW INVESTIGASI NODES FROM BATCH 1
    {
      id: "intrusi-pantura",
      label: "Intrusi Air Laut Pesisir Pantura",
      group: "investigasi",
      val: 19,
      synopsis: "Rembebasan air asin laut dalam yang mencemari akuifer air bersih di sepanjang pesisir utara Jawa."
    },
    {
      id: "tambang-pasir-silika",
      label: "Penambangan Pasir Silika Pesisir",
      group: "investigasi",
      val: 17,
      synopsis: "Pengerukan pasir kuarsa pesisir untuk industri kaca yang memicu abrasi dan hilangnya pelindung alami."
    },
    {
      id: "kabut-asap-lintas-batas",
      label: "Kabut Asap Lintas Batas (Transboundary Haze)",
      group: "investigasi",
      val: 20,
      synopsis: "Dampak kesehatan regional pelepasan emisi karbon akibat pembakaran lahan gambut Sumatra & Kalimantan."
    },
    {
      id: "tambang-timah-belitung",
      label: "Penambangan Timah Laut Belitung",
      group: "investigasi",
      val: 18,
      synopsis: "Sedimentasi berat lumpur limbah hisap tambang timah lepas pantai yang merusak terumbu karang."
    }
  ],
  links: [
    // 1. Letusan Vulkanik & Iklim Purba
    { source: "krakatau-1883", target: "tambora-1815", type: "katastrofe-global", label: "Hubungan seismik vulkanologi" },
    { source: "samalas-1257", target: "tambora-1815", type: "anomali-iklim", label: "Pemicu zaman es kecil" },
    { source: "toba", target: "samalas-1257", type: "super-erupsi", label: "Catatan letusan purba kolosal" },
    { source: "anak-krakatau-2018", target: "krakatau-1883", type: "siklus-seismik", label: "Reruntuhan tubuh kaldera induk" },
    { source: "merapi", target: "dieng", type: "sistem-vulkanik", label: "Busur vulkanik Jawa Tengah" },
    { source: "api-biru-kawah-ijen", target: "kelud", type: "vulkanologi-aktif", label: "Gunung api aktif Jawa Timur" },

    // 2. Taksonomi Kepunahan & Lazarus
    { source: "harimau-jawa", target: "harimau-bali", type: "taksonomi-punah", label: "Kepunahan predator pulau" },
    { source: "lazarus-taxon", target: "black-browed-babbler", type: "ditemukan-kembali", label: "Spesies bangkit kembali" },
    { source: "lazarus-taxon", target: "echidna-attenborough", type: "ditemukan-kembali", label: "Konfirmasi kebertahanan takson" },
    { source: "lazarus-taxon", target: "spesies-hilang-nusantara", type: "metodologi-pencarian", label: "Kerangka investigasi satwa" },
    { source: "lazarus-taxon", target: "harimau-jawa", type: "bukti-klaim", label: "Penelusuran rumor kepunahan" },
    { source: "lazarus-taxon", target: "lebah-raksasa-wallace", type: "ditemukan-kembali", label: "Penemuan serangga raksasa" },

    // 3. Ekologi Wallacea & Endemisitas Terisolasi
    { source: "anoa", target: "babirusa", type: "endemik-wallacea", label: "Evolusi aneh Sulawesi" },
    { source: "tarsius", target: "anoa", type: "hutan-wallacea", label: "Satwa endemik dataran tinggi" },
    { source: "coelacanth-sulawesi", target: "tarsius", type: "gugus-sulawesi", label: "Relik fauna purba terlindung" },
    { source: "seriwang-sangihe", target: "spesies-hilang-nusantara", type: "peta-ekspedisi", label: "Target wilayah Ujung Utara" },
    { source: "nepenthes-pitopangii", target: "spesies-hilang-nusantara", type: "isolasi-puncak", label: "Target ekspedisi gunung tinggi" },
    { source: "maleo", target: "anoa", type: "geotermal-hutan", label: "Ekosistem terestrial sulawesi" },

    // 4. Laguna & Benteng Pesisir
    { source: "segara-anakan", target: "mangrove-indonesia", type: "estuari-karbon", label: "Benteng estuari Jawa Selatan" },
    { source: "segara-anakan", target: "citarum", type: "aliran-sedimen", label: "Sedimentasi sungai pesisir selatan" },
    { source: "terumbu-karang", target: "mangrove-indonesia", type: "simbiosis-pesisir", label: "Penjaga pantai terumbu luar" },

    // 5. Kartografi & Sejarah Perubahan Daratan
    { source: "selat-yang-hilang-laut-demak", target: "jakarta-tenggelam", type: "perubahan-daratan", label: "Krisis dinamika garis pantai" },
    { source: "selat-yang-hilang-laut-demak", target: "peta-lama-nusantara", type: "bukti-kartografi", label: "Pencocokan peta navigasi kuno" },
    { source: "selat-yang-hilang-laut-demak", target: "kota-tua-jakarta", type: "perdagangan-abad16", label: "Jalur sutra laut Demak" },
    { source: "kota-tua-jakarta", target: "peta-lama-nusantara", type: "rencana-benteng", label: "Konstruksi tata ruang Batavia" },
    { source: "kota-tua-jakarta", target: "jakarta-tenggelam", type: "amblesan-tanah", label: "Beban struktural kota tua" },
    { source: "banda-neira", target: "peta-lama-nusantara", type: "monopoli-rempah", label: "Target rute kartografi VOC" },

    // 6. Investigasi Lingkungan & Polusi Industri
    { source: "deforestasi-kalimantan", target: "gambut-indonesia", type: "krisis-karbon", label: "Pengeringan gambut sawit" },
    { source: "deforestasi-kalimantan", target: "black-browed-babbler", type: "ancaman-habitat", label: "Hilangnya kanopi hutan primer" },
    { source: "deforestasi-kalimantan", target: "orangutan-tapanuli", type: "fragmentasi-koridor", label: "Konversi hutan pegunungan" },
    { source: "pesut-mahakam", target: "deforestasi-kalimantan", type: "sedimentasi-sungai", label: "Dampak limpasan lumpur sawit" },
    { source: "sampah-plastik-laut", target: "terumbu-karang", type: "polusi-polimer", label: "Kerusakan ekosistem karang laut" },
    { source: "sampah-plastik-laut", target: "citarum", type: "aliran-limbah", label: "Sungai pengirim sampah laut utama" },
    { source: "ekspor-pasir-laut", target: "jakarta-tenggelam", type: "kerusakan-pesisir", label: "Pengerukan pulau pasir pesisir" },

    // 7. Prasasti & Peradaban Sungai Purba
    { source: "prasasti-yupa", target: "peta-lama-nusantara", type: "sejarah-aksara", label: "Jalur peradaban tertua Kutai" },
    { source: "borobudur", target: "samalas-1257", type: "endapan-abu", label: "Abu vulkanik penimbun candi" },
    { source: "borobudur", target: "prasasti-yupa", type: "kronologi-batu", label: "Seni pahatan relief batu Nusantara" },
    { source: "homo-floresiensis", target: "komodo", type: "megafauna-flores", label: "Koeksistensi penyintas Liang Bua" },

    // 8. KONEKSI 10 JEMBATAN BARU (BATCH 1)
    // Node: tahun-tanpa-musim-panas
    { source: "tahun-tanpa-musim-panas", target: "tambora-1815", type: "dampak-iklim", label: "Pemicu musim dingin vulkanik" },
    { source: "tahun-tanpa-musim-panas", target: "samalas-1257", type: "anomali-global", label: "Perbandingan dampak pendinginan" },

    // Node: intrusi-pantura
    { source: "intrusi-pantura", target: "jakarta-tenggelam", type: "krisis-ekologi", label: "Penurunan tanah memicu intrusi" },
    { source: "intrusi-pantura", target: "citarum", type: "sumber-air", label: "Krisis air bersih permukaan" },
    { source: "intrusi-pantura", target: "ekspor-pasir-laut", type: "abrasi-pesisir", label: "Pencegahan penetrasi air asin" },

    // Node: jamur-pembunuh-amfibi
    { source: "jamur-pembunuh-amfibi", target: "lazarus-taxon", type: "ancaman-kepunahan", label: "Penyebab kepunahan amfibi" },
    { source: "jamur-pembunuh-amfibi", target: "spesies-hilang-nusantara", type: "pencarian-spesies", label: "Evaluasi populasi terancam" },

    // Node: tambang-pasir-silika
    { source: "tambang-pasir-silika", target: "ekspor-pasir-laut", type: "ekstraksi-pesisir", label: "Penambangan pasir kuarsa" },
    { source: "tambang-pasir-silika", target: "mangrove-indonesia", type: "kerusakan-habitat", label: "Destruksi sabuk hijau pesisir" },

    // Node: palembang-sriwijaya-pantai
    { source: "palembang-sriwijaya-pantai", target: "selat-yang-hilang-laut-demak", type: "sedimentasi-sejarah", label: "Perubahan garis pantai kerajaan" },
    { source: "palembang-sriwijaya-pantai", target: "peta-lama-nusantara", type: "kartografi-kuno", label: "Rujukan pelabuhan pedalaman" },

    // Node: kabut-asap-lintas-batas
    { source: "kabut-asap-lintas-batas", target: "gambut-indonesia", type: "kebakaran-lahan", label: "Pelepasan emisi karbon" },
    { source: "kabut-asap-lintas-batas", target: "deforestasi-kalimantan", type: "kerusakan-udara", label: "Pembukaan lahan sawit" },

    // Node: genetika-wallacea-cengkeh
    { source: "genetika-wallacea-cengkeh", target: "banda-neira", type: "sejarah-rempah", label: "Peta biogeografi rempah" },
    { source: "genetika-wallacea-cengkeh", target: "lebah-raksasa-wallace", type: "biogeografi-wallace", label: "Ekologi serangga penyerbuk" },

    // Node: tambang-timah-belitung
    { source: "tambang-timah-belitung", target: "terumbu-karang", type: "polusi-sedimentasi", label: "Kerusakan terumbu akibat lumpur" },
    { source: "tambang-timah-belitung", target: "sampah-plastik-laut", type: "degradasi-laut", label: "Akumulasi limbah pertambangan" },

    // Node: bottleneck-genetik-toba
    { source: "bottleneck-genetik-toba", target: "toba", type: "penyusutan-populasi", label: "Dampak letusan supervolcano Toba" },
    { source: "bottleneck-genetik-toba", target: "homo-floresiensis", type: "evolusi-hominid", label: "Efek letusan pada manusia purba" },

    // Node: megathrust-jawa-selatan
    { source: "megathrust-jawa-selatan", target: "krakatau-1883", type: "pemicu-tsunami", label: "Siklus kegempaan Selat Sunda" },
    { source: "megathrust-jawa-selatan", target: "anak-krakatau-2018", type: "seismik-pesisir", label: "Aktivitas subduksi lempeng" }
  ]
};
