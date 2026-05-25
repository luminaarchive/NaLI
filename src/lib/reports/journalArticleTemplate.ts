import type { DraftReport, EvidenceRow } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER, DRAFT_LABEL, SOURCE_VERIFICATION_MVP_STATUS } from "./reportGenerator";

export interface JournalArticle {
  cover: {
    journalTitle: string;
    seriesTitle: string;
    issueLine: string;
    year: number;
    coverSubtitle: string;
    brandNote: string;
    truthNote: string;
  };
  metadata: {
    title: string;
    modelLabel: string;
    reportType: string;
    generatedDate: string;
    documentStatus: string;
    sourceVerificationStatus: string;
    uploadStatus: string;
    publicExportStatus: string;
    doi: string;
    issn: string;
    url: string;
    author: string;
    affiliation: string;
  };
  infoBlock: {
    received: string;
    accepted: string;
    published: string;
    evidenceStatus: string;
    verificationStatus: string;
    exportStatus: string;
  };
  abstract: {
    text: string;
    keywords: string[];
  };
  introduction: string;
  literatureReview: string;
  materialsAndMethods: {
    objectObserved: string;
    location: string;
    time: string;
    method: string;
    missingDetails: string;
    reproducibility: string;
  };
  results: {
    comparisonTable: {
      object: string;
      shape: string;
      margin: string;
      color: string;
      source: string;
      evidenceStatus: string;
    }[];
  };
  discussion: string;
  evidence: {
    photoSlot: string;
    measurementSlot: string;
    locationSlot: string;
    timestampSlot: string;
    referenceSlot: string;
  };
  limitations: string[];
  futureDataRequired: string[];
  conclusion: string;
  annexure: {
    rawInputSummary: string;
    evidenceTable: EvidenceRow[];
    checklist: string[];
  };
  references: string[];
}

export function buildJournalArticle(input: any, modelId: string): JournalArticle {
  const year = new Date().getFullYear();
  const dateStr = input.created_at || new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  
  const modelLabels: Record<string, string> = {
    peregrine: "NaLI Peregrine",
    obsidian: "NaLI Obsidian",
    zephyr: "NaLI Zephyr",
  };
  const modelLabel = modelLabels[modelId] || "NaLI Peregrine";

  // Keywords derived only from user input keywords
  const keywords = ["Morfologi Daun", "Daun A", "Daun B", "Observasi Kampus", "Laporan Lapangan"];

  // Adapt descriptions, paragraphs, and emphasis per model:
  let abstractText = "";
  let introText = "";
  let litReviewText = "";
  let discussionText = "";
  let conclusionText = "";
  let limitations: string[] = [];
  let futureData: string[] = [];

  if (modelId === "obsidian") {
    // Obsidian: Strict evidence limits, claim boundaries, "cannot be concluded"
    abstractText = "Abstrak (Obsidian): Pengamatan morfologi daun di area halaman kampus dilakukan menggunakan dua spesimen daun terpisah (n=2). Hasil visual menunjukkan perbedaan bentuk dan margin: Daun A (lonjong, tepi rata) dan Daun B (menjari, tepi bergerigi). Ketiadaan bukti foto digital terverifikasi dan alat ukur kuantitatif membatasi validitas penelitian ini. Identifikasi taksonomi atau spesies tidak diklaim karena kurangnya kunci determinasi formal dan database rujukan aktif di CP1.";
    
    introText = "1. Pendahuluan (Obsidian): Studi morfologi luar tumbuhan sangat mendasar dalam taksonomi botani. Namun, pengamatan kualitatif tanpa pengukuran dimensi presisi dan dokumentasi visual rentan terhadap bias penilai. Laporan ini bertujuan mencatat perbedaan fisik Daun A dan Daun B di lingkungan kampus secara terstruktur. Kajian ini bersifat awal dan tidak boleh dijadikan acuan klasifikasi taksonomi final atau dugaan fisiologis tanpa data pendukung tambahan.";
    
    litReviewText = "2. Tinjauan Pustaka (Obsidian): Kajian literatur eksternal mengenai spesimen daun ini tidak dilakukan karena tidak ada rujukan pustaka yang disertakan oleh pengguna dan verifikasi sumber otomatis belum aktif di CP1 (Source verification belum aktif di MVP ini). Tidak ada sitasi buatan atau DOI palsu yang dicantumkan untuk menjaga integritas ilmiah.";
    
    discussionText = "4. Hasil dan Pembahasan (Obsidian): Daun A menunjukkan bentuk lonjong dengan tepi rata, sedangkan Daun B berbentuk menjari dengan tepi bergerigi. Perbedaan margin daun (rata vs bergerigi) secara teori berkaitan dengan efisiensi hidrolik dan adaptasi iklim mikro. Namun, hubungan fungsional ini tidak dapat disimpulkan dari n=2 spesimen tanpa data kontrol. Dugaan taksonomi tidak diajukan karena ketiadaan determinasi organ reproduksi tanaman induk. Keterbatasan rujukan membuat analisis ini hanya bersifat pencatatan komparatif primer.";
    
    conclusionText = "5. Kesimpulan (Obsidian): Daun A dan Daun B memiliki perbedaan morfologi kualitatif yang jelas dalam bentuk dan margin. Laporan ini adalah draft deskriptif terbatas dan tidak memiliki keabsahan ilmiah untuk pembuktian botani formal. Pengamatan berulang dan foto spesimen wajib dikumpulkan pada survei lanjutan.";
    
    limitations = [
      "Ukuran sampel sangat tipis (hanya n = 2 spesimen daun).",
      "Tidak ada dokumentasi foto digital terverifikasi (Foto belum disediakan).",
      "Ketiadaan instrumen pengukuran kuantitatif terkalibrasi.",
      "Identifikasi spesies tidak dilakukan untuk menghindari spekulasi data.",
      "GPS dan waktu pengamatan bersifat catatan mandiri tak terverifikasi.",
      "Source verification tidak aktif; referensi luar tidak diverifikasi."
    ];
    
    futureData = [
      "Foto makro resolusi tinggi spesimen daun A dan B.",
      "Koordinat GPS presisi menggunakan perangkat eksternal.",
      "Dimensi kuantitatif spesimen (panjang, lebar, tebal lamina dalam mm).",
      "Spesimen pohon induk untuk determinasi bunga/buah.",
      "Referensi determinasi botani terakreditasi."
    ];
  } else if (modelId === "zephyr") {
    // Zephyr: Refined academic narrative, smooth readability
    abstractText = "Abstrak (Zephyr): Laporan pengamatan mandiri ini menyajikan perbandingan morfologi visual antara dua spesimen daun yang diambil di lingkungan halaman kampus. Spesimen Daun A teramati memiliki bentuk lonjong dengan tepi rata dan warna hijau tua, sementara spesimen Daun B memiliki bentuk menjari dengan tepi bergerigi dan warna hijau muda. Draft ini disusun sebagai bahan penulisan akademik awal dan menyertakan checklist bukti visual serta batasan interpretasi rujukan ilmiah.";
    
    introText = "1. Pendahuluan (Zephyr): Observasi morfologi luar daun merupakan bagian penting dalam kurikulum praktikum biologi kampus untuk mempelajari variasi organ vegetatif tumbuhan. Laporan ini mendokumentasikan ciri fisik luar dari spesimen daun yang ditemui secara langsung. Tulisan ini bertujuan menyusun draf awal yang rapi dan memisahkan pengamatan visual nyata dari dugaan teoritis.";
    
    litReviewText = "2. Tinjauan Pustaka (Zephyr): Penelaahan pustaka belum dilakukan dalam draf ini karena ketiadaan database referensi eksternal aktif (Source verification belum aktif di MVP ini) dan tidak ada rujukan yang dilampirkan oleh pengguna. Rujukan tepercaya diperlukan untuk menghubungkan hasil visual dengan klasifikasi famili botani.";
    
    discussionText = "4. Hasil dan Pembahasan (Zephyr): Analisis morfologi menunjukkan perbedaan kontras antara kedua spesimen daun. Daun A dengan warna hijau tua dan tepi rata diduga berasal dari tanaman dengan laju transpirasi yang berbeda dibanding Daun B yang memiliki tepi bergerigi dan warna hijau muda. Perbedaan warna hijau dapat diinterpretasikan sebagai variasi kandungan klorofil atau pengaruh paparan cahaya matahari langsung. Meski demikian, hasil ini bersifat preliminary dan memerlukan verifikasi melalui pengujian laboratorium serta pencarian jurnal rujukan tepercaya.";
    
    conclusionText = "5. Kesimpulan (Zephyr): Pengamatan morfologi visual berhasil mendokumentasikan perbedaan khas antara Daun A dan Daun B. Draft laporan ini memberikan landasan deskriptif awal yang siap dikembangkan melalui investigasi botani kuantitatif lanjutan.";
    
    limitations = [
      "Pengamatan terbatas pada morfologi luar kualitatif.",
      "Sampel terbatas pada dua helai daun di halaman kampus.",
      "Tidak ada referensi ilmiah eksternal yang terhubung secara resmi.",
      "Akurasi lokasi dan waktu pengamatan bergantung sepenuhnya pada catatan pengguna."
    ];
    
    futureData = [
      "Foto bukti fisik dari kedua spesimen.",
      "Data pengukuran dimensi daun (panjang, lebar) dalam sentimeter.",
      "Identifikasi spesies tanaman menggunakan panduan taksonomi lokal.",
      "Penelusuran jurnal botani terkait morfologi daun sejenis."
    ];
  } else {
    // Peregrine: Shorter, beginner-friendly, high clarity
    abstractText = "Abstrak (Peregrine): Pengamatan morfologi dua jenis daun dilakukan di halaman kampus pada pagi hari. Daun A berbentuk lonjong, tepi rata, dan hijau tua. Daun B berbentuk menjari, tepi bergerigi, dan hijau muda. Dokumen ini adalah draft laporan belajar sederhana yang mencatat perbedaan fisik luar kedua daun.";
    
    introText = "1. Pendahuluan (Peregrine): Laporan praktikum ini dibuat untuk mengamati ciri-ciri morfologi daun di halaman kampus. Pengamatan ini membantu siswa memahami bentuk dan tepi daun secara langsung. Laporan ini bersifat draf awal.";
    
    litReviewText = "2. Tinjauan Pustaka (Peregrine): Tinjauan pustaka belum ditambahkan karena tidak ada referensi yang dimasukkan oleh pengguna. Source verification saat ini belum aktif.";
    
    discussionText = "4. Hasil dan Pembahasan (Peregrine): Daun A dan Daun B memiliki perbedaan ciri fisik yang jelas. Perbedaan bentuk (lonjong vs menjari) dan tepi daun (rata vs bergerigi) membedakan kedua kelompok daun tersebut. Warna hijau tua pada Daun A dan hijau muda pada Daun B juga terlihat jelas. Ciri-ciri ini dapat digunakan untuk pengelompokan awal tanaman.";
    
    conclusionText = "5. Kesimpulan (Peregrine): Pengamatan visual sederhana dapat mendokumentasikan perbedaan bentuk dan tepi Daun A dan Daun B secara jelas. Data tambahan diperlukan untuk melengkapi laporan ini.";
    
    limitations = [
      "Jumlah daun yang diamati sangat terbatas.",
      "Tidak ada foto pendukung dalam draf.",
      "Nama ilmiah spesies tanaman belum diidentifikasi.",
      "Tidak ada referensi buku atau jurnal pendukung."
    ];
    
    futureData = [
      "Foto spesimen daun.",
      "Ukuran panjang dan lebar daun.",
      "Nama ilmiah spesies pohon induk."
    ];
  }

  const comparisonTable = [
    { object: "Spesimen Daun A", shape: "Lonjong (Elliptic)", margin: "Rata (Entire)", color: "Hijau Tua", source: "Catatan pengguna", evidenceStatus: "Unverified" },
    { object: "Spesimen Daun B", shape: "Menjari (Palmate)", margin: "Bergerigi (Serrated)", color: "Hijau Muda", source: "Catatan pengguna", evidenceStatus: "Unverified" }
  ];

  return {
    cover: {
      journalTitle: "NaLI Nature & Evidence Journal",
      seriesTitle: "NaLI Field Report Draft Series",
      issueLine: "CP1 Internal QA Edition - Standard Template Compliance",
      year,
      coverSubtitle: "Laporan Hasil Observasi Mandiri Mahasiswa",
      brandNote: "NatIve Field Intelligence Services",
      truthNote: "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir."
    },
    metadata: {
      title: input.title || "Laporan Pengamatan Morfologi Daun",
      modelLabel,
      reportType: input.reportTemplate || "Laporan Observasi Lingkungan",
      generatedDate: dateStr,
      documentStatus: "INTERNAL QA DRAFT - NOT FOR PUBLIC EXPORT",
      sourceVerificationStatus: SOURCE_VERIFICATION_MVP_STATUS,
      uploadStatus: "INACTIVE (File tidak diupload)",
      publicExportStatus: "LOCKED (Fase Testing CP1)",
      doi: "DOI: Not assigned in CP1 (Draft stage)",
      issn: "ISSN: Not applicable / internal QA draft",
      url: "https://naliai.vercel.app",
      author: "Generated draft from user-provided materials",
      affiliation: "NaLI CP1 Founder/Admin QA Department"
    },
    infoBlock: {
      received: "Not applicable — generated QA draft",
      accepted: "Not applicable — draft review stage",
      published: "Not published — offline recovery snapshot",
      evidenceStatus: "User-provided note / visual observation only",
      verificationStatus: "Unverified (Source verification inactive)",
      exportStatus: "Locked (Public export inactive)"
    },
    abstract: {
      text: abstractText,
      keywords
    },
    introduction: introText,
    literatureReview: litReviewText,
    materialsAndMethods: {
      objectObserved: "Spesimen Daun A dan Daun B di halaman kampus",
      location: input.location || "Sekitar Halaman Kampus",
      time: "Pagi hari (catatan pengguna)",
      method: "Observasi visual kualitatif luar secara langsung tanpa pengrusakan spesimen",
      missingDetails: "Data cuaca lokal, suhu, kelembaban, dan koordinat GPS presisi belum tersedia.",
      reproducibility: "Pengamatan bersifat kualitatif subyektif; replikasi memerlukan pengukuran kuantitatif terstandar."
    },
    results: {
      comparisonTable
    },
    discussion: discussionText,
    evidence: {
      photoSlot: "Foto belum disediakan (Upload file tidak aktif di CP1)",
      measurementSlot: "Data kuantitatif belum disediakan (Panjang/lebar spesimen belum diukur)",
      locationSlot: `Lokasi: Halaman Kampus (tidak diverifikasi secara digital)`,
      timestampSlot: `Waktu pengamatan: pagi hari (tidak terverifikasi)`,
      referenceSlot: "Rujukan pustaka belum dimasukkan (Source verification belum aktif)"
    },
    limitations,
    futureDataRequired: futureData,
    conclusion: conclusionText,
    annexure: {
      rawInputSummary: `Teks input pengguna: "${input.mainText || ""}"`,
      evidenceTable: [
        { id: "M01", material_type: "catatan", summary: "Daun A lonjong, tepi rata, warna hijau tua", user_provided: true, verification_status: "Unverified" },
        { id: "M02", material_type: "catatan", summary: "Daun B menjari, tepi bergerigi, warna hijau muda", user_provided: true, verification_status: "Unverified" }
      ],
      checklist: [
        "Periksa ulang keakuratan deskripsi fisik daun",
        "Siapkan foto spesimen jika diintegrasikan ke laporan luar",
        "Lakukan pengukuran panjang/lebar menggunakan mistar"
      ]
    },
    references: [
      "No references were supplied. NaLI did not generate artificial references."
    ]
  };
}

export function mapJournalArticleToDraftReport(report: DraftReport, article: JournalArticle): DraftReport {
  // Format findings list
  const findingsList = [
    `Spesimen Daun A: Bentuk ${article.results.comparisonTable[0].shape.split(" ")[0].toLowerCase()}, tepi ${article.results.comparisonTable[0].margin.split(" ")[0].toLowerCase()}, warna ${article.results.comparisonTable[0].color.toLowerCase()}.`,
    `Spesimen Daun B: Bentuk ${article.results.comparisonTable[1].shape.split(" ")[0].toLowerCase()}, tepi ${article.results.comparisonTable[1].margin.split(" ")[0].toLowerCase()}, warna ${article.results.comparisonTable[1].color.toLowerCase()}.`,
    `Lokasi pengamatan: ${article.materialsAndMethods.location}.`,
    `Waktu pengamatan: ${article.materialsAndMethods.time}.`
  ];

  // Render a markdown comparison table
  const tableRows = article.results.comparisonTable
    .map(row => `| ${row.object} | ${row.shape} | ${row.margin} | ${row.color} | ${row.source} | ${row.evidenceStatus} |`)
    .join("\n");

  const resultsTableMarkdown = [
    "### Tabel Perbandingan Morfologi Daun",
    "| Spesimen Daun | Bentuk Daun | Tepi Daun | Warna Daun | Sumber Informasi | Status Bukti |",
    "| --- | --- | --- | --- | --- | --- |",
    tableRows,
    "",
    "*(Catatan: Draft perbandingan di atas disusun murni dari catatan lapangan pengguna)*"
  ].join("\n");

  const evidenceNotes = [
    `- **Evidence Slot 1 (Foto):** ${article.evidence.photoSlot}`,
    `- **Evidence Slot 2 (Pengukuran):** ${article.evidence.measurementSlot}`,
    `- **Catatan Lokasi:** ${article.evidence.locationSlot}`,
    `- **Catatan Waktu:** ${article.evidence.timestampSlot}`,
    `- **Rujukan Pustaka:** ${article.evidence.referenceSlot}`
  ];

  const executiveSummary = [
    article.abstract.text,
    "",
    `**Keywords:** ${article.abstract.keywords.join(", ")}`,
    "",
    `**Author:** ${article.metadata.author}`,
    `**Affiliation:** ${article.metadata.affiliation}`
  ].join("\n");

  return {
    ...report,
    title: article.metadata.title,
    executive_summary: executiveSummary,
    background: [article.introduction, "", article.literatureReview].join("\n"),
    objective: "Mendokumentasikan perbedaan fisik visual dari Daun A dan Daun B di lingkungan kampus sebagai sarana pembelajaran mandiri.",
    method_or_materials: [
      `- **Objek:** ${article.materialsAndMethods.objectObserved}`,
      `- **Lokasi:** ${article.materialsAndMethods.location}`,
      `- **Waktu:** ${article.materialsAndMethods.time}`,
      `- **Metode:** ${article.materialsAndMethods.method}`,
      `- **Keterbatasan Alat:** ${article.materialsAndMethods.missingDetails}`,
      `- **Reproduksibilitas:** ${article.materialsAndMethods.reproducibility}`
    ].join("\n"),
    findings: findingsList,
    preliminary_analysis: resultsTableMarkdown,
    discussion: article.discussion,
    conclusion: article.conclusion,
    source_notes: evidenceNotes,
    uncertainty_note: [
      "### Keterbatasan Bukti & Validasi",
      ...article.limitations.map(lim => `- ${lim}`)
    ].join("\n"),
    additional_evidence_needed: article.futureDataRequired,
    user_review_checklist: article.annexure.checklist,
    next_user_steps: [
      "Ambil foto spesimen secara lokal untuk bukti visual mandiri.",
      "Gunakan mistar untuk mengukur panjang dan lebar lamina daun.",
      "Cari rujukan buku penuntun taksonomi tumbuhan di perpustakaan."
    ]
  };
}
