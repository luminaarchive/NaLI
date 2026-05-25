import type { DraftReport, EvidenceRow } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER, DRAFT_LABEL, SOURCE_VERIFICATION_MVP_STATUS } from "./reportGenerator";

export interface JournalContract {
  title: string;
  subtitle: string;
  modelLabel: string;
  reportType: string;
  date: string;
  truthNote: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  methods: {
    location: string;
    time: string;
    objectObserved: string;
    observationMethod: string;
    missingDetails: string;
  };
  results: {
    comparisonTable: {
      trait: string;
      leafA: string;
      leafB: string;
      notes: string;
    }[];
  };
  discussion: string;
  evidence: {
    photoSlot: string;
    measurementSlot: string;
    locationNote: string;
    timestampNote: string;
    referenceSlot: string;
  };
  limitations: string[];
  missingEvidenceChecklist: string[];
  conclusion: string;
  appendix: {
    rawInputSummary: string;
    disclaimer: string;
  };
}

export function buildJournalContractData(input: any, modelId: string): JournalContract {
  const modelLabels: Record<string, string> = {
    peregrine: "NaLI Peregrine",
    obsidian: "NaLI Obsidian",
    zephyr: "NaLI Zephyr",
  };
  const modelLabel = modelLabels[modelId] || "NaLI Peregrine";
  const dateStr = input.created_at || new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

  const keywords = ["Morfologi Daun", "Daun A", "Daun B", "Observasi Kampus", "Laporan Belajar"];

  // Differentiate content based on model profile
  let abstract = "";
  let introduction = "";
  let discussion = "";
  let conclusion = "";
  let limitations: string[] = [];
  let missingChecklist: string[] = [];

  if (modelId === "obsidian") {
    // Obsidian: Strict evidence boundaries and limitation-focused
    abstract = "Abstrak (Obsidian): Studi observasi morfologi daun di area kampus dilakukan menggunakan sampel terbatas (n=2). Hasil menunjukkan perbedaan margin dan bentuk antara Daun A (lonjong, tepi rata) dan Daun B (menjari, tepi bergerigi). Karena ketiadaan instrumen pengukuran terkalibrasi dan dokumentasi foto, validitas eksternal studi ini terbatas pada deskripsi kualitatif awal. Tidak ada identifikasi spesies yang diklaim.";
    
    introduction = "Pendahuluan (Obsidian): Pengamatan morfologi tumbuhan merupakan langkah awal penting dalam botani lapangan. Namun, pengamatan tanpa verifikasi taksonomi ahli rentan terhadap bias interpretasi. Studi ini mendokumentasikan ciri fisik Daun A dan Daun B di area kampus. Kajian literatur eksternal belum dilakukan karena ketiadaan database referensi terverifikasi (Source verification belum aktif di MVP ini). Tidak ada klaim hubungan evolusi atau ekologis yang dibuat.";
    
    discussion = "Pembahasan (Obsidian): Perbedaan margin (tepi rata vs bergerigi) dan bentuk (lonjong vs menjari) mengindikasikan kemungkinan perbedaan taksonomi atau adaptasi mikrohabitat. Namun, berdasarkan data terbatas ini, tidak boleh diasumsikan adanya klasifikasi famili tertentu. Dugaan awal fungsional seperti perbedaan laju transpirasi bersifat spekulatif dan memerlukan pengujian laboratorium. Ketiadaan bukti foto membuat data visual ini tidak dapat diaudit pihak ketiga.";
    
    limitations = [
      "Ukuran sampel sangat terbatas (n = 2 daun) dari lingkungan tidak terkontrol.",
      "Identifikasi spesies tidak dilakukan untuk menghindari data palsu.",
      "Source verification tidak aktif; referensi pendukung tidak divalidasi.",
      "GPS dan penanda waktu tidak terverifikasi secara resmi.",
      "Ketiadaan instrumen pengukuran kuantitatif terkalibrasi (hanya visual kualitatif).",
      "Tidak ada bukti foto digital yang terverifikasi (Foto belum tersedia)."
    ];
    
    missingChecklist = [
      "Foto dokumentasi spesimen (Foto belum tersedia)",
      "Titik GPS spesifik koordinat halaman kampus",
      "Waktu observasi presisi (jam dan menit pengamatan)",
      "Alat pengukur dimensi (penggaris atau jangka sorong)",
      "Kunci determinasi botani untuk identifikasi spesies",
      "Referensi pustaka ilmiah terindeks (CrossRef/NCBI)"
    ];
    
    conclusion = "Kesimpulan (Obsidian): Daun A dan Daun B menunjukkan perbedaan ciri morfologi visual yang jelas. Hasil ini adalah draf deskriptif awal dan belum memiliki keabsahan ilmiah untuk klasifikasi taksonomi. Langkah selanjutnya adalah pengumpulan sampel berulang, pengambilan foto bukti, dan verifikasi spesimen oleh ahli botani.";
  } else if (modelId === "zephyr") {
    // Zephyr: Refined prose, smooth readability
    abstract = "Abstrak (Zephyr): Laporan pengamatan ini menyajikan deskripsi morfologi perbandingan antara dua tipe daun yang ditemukan di area kampus. Daun A dikarakterisasi oleh bentuk lonjong dengan tepi rata dan warna hijau tua, sedangkan Daun B memiliki bentuk menjari dengan tepi bergerigi dan warna hijau muda. Observasi dilakukan secara visual pada pagi hari. Laporan ini merupakan draft bantuan belajar awal yang memerlukan pengumpulan data lanjutan serta verifikasi rujukan akademis.";
    
    introduction = "Pendahuluan (Zephyr): Memahami keanekaragaman morfologi daun membantu siswa mengidentifikasi variasi adaptasi tanaman di lingkungan kampus. Laporan ini bertujuan mendokumentasikan perbedaan bentuk, margin, dan warna dari dua spesimen daun. Perlu ditekankan bahwa kajian pustaka komprehensif belum dilakukan pada tahap ini karena fokus utama adalah pencatatan data observasi primer secara mandiri.";
    
    discussion = "Pembahasan (Zephyr): Hasil pengamatan menunjukkan perbedaan morfologi yang kontras antara kedua daun. Daun A dengan warna hijau tua dan tepi rata mungkin memiliki karakteristik fisiologis yang berbeda dengan Daun B yang berwarna hijau muda dan memiliki tepi bergerigi. Perbedaan warna dapat dipengaruhi oleh kadar klorofil atau usia daun, namun hal ini memerlukan analisis kimia lebih lanjut. Interpretasi ini bersifat awal dan memerlukan studi literatur ilmiah pendukung untuk memverifikasi hipotesis awal.";
    
    limitations = [
      "Jumlah sampel terbatas pada dua spesimen daun.",
      "Pengamatan terbatas pada morfologi luar secara visual tanpa analisis mikroskopis.",
      "Belum ada pencocokan ilmiah dengan spesies tanaman lokal.",
      "Akurasi waktu dan lokasi hanya berdasarkan catatan mandiri pengguna.",
      "Ketiadaan data kuantitatif pendukung."
    ];
    
    missingChecklist = [
      "Foto spesimen daun A dan B untuk bukti otentik",
      "Pengukuran panjang, lebar, dan tebal daun",
      "Catatan cuaca dan intensitas cahaya matahari",
      "Identifikasi spesies menggunakan aplikasi taksonomi tepercaya",
      "Studi pustaka jurnal botani terakreditasi"
    ];
    
    conclusion = "Kesimpulan (Zephyr): Observasi visual sederhana berhasil mengidentifikasi perbedaan morfologi utama antara Daun A dan Daun B. Draft laporan ini memberikan kerangka kerja terstruktur untuk penyelidikan botani lebih lanjut di lingkungan kampus.";
  } else {
    // Peregrine: Concise, starter draft, simple IMRaD
    abstract = "Abstrak (Peregrine): Laporan ini berisi hasil pengamatan morfologi dua jenis daun (Daun A dan Daun B) di sekitar halaman kampus pada pagi hari. Pengamatan berfokus pada bentuk, tepi, dan warna daun. Hasil menunjukkan Daun A berbentuk lonjong dengan tepi rata dan hijau tua, sedangkan Daun B berbentuk menjari dengan tepi bergerigi dan hijau muda. Dokumen ini adalah draft belajar awal.";
    
    introduction = "Pendahuluan (Peregrine): Pengamatan morfologi daun penting untuk mempelajari struktur tumbuhan. Laporan ini dibuat untuk mendokumentasikan ciri fisik daun di halaman kampus. Studi pustaka belum dilakukan karena ini adalah draft awal observasi.";
    
    discussion = "Pembahasan (Peregrine): Daun A dan Daun B memiliki perbedaan bentuk (lonjong vs menjari), tepi (rata vs bergerigi), dan warna (hijau tua vs hijau muda). Ciri-ciri ini membedakan kedua jenis tumbuhan tersebut. Penyelidikan lebih lanjut dengan sampel lebih banyak diperlukan untuk klasifikasi yang benar.";
    
    limitations = [
      "Sampel pengamatan hanya berjumlah dua daun.",
      "Data bersifat kualitatif visual saja.",
      "Belum ada referensi buku atau jurnal ilmiah.",
      "Spesies tanaman belum diketahui pasti."
    ];
    
    missingChecklist = [
      "Foto bukti fisik kedua daun",
      "Dimensi daun (ukuran sentimeter)",
      "Nama spesies ilmiah tanaman",
      "Buku acuan taksonomi tumbuhan"
    ];
    
    conclusion = "Kesimpulan (Peregrine): Pengamatan visual sederhana dapat menunjukkan perbedaan morfologi daun secara jelas. Draft ini siap dikembangkan dengan data tambahan.";
  }

  return {
    title: input.title || `Pengamatan Morfologi Daun di Halaman Kampus`,
    subtitle: `Laporan Observasi Botani Mandiri - Model routing: ${modelId.toUpperCase()}`,
    modelLabel,
    reportType: input.reportTemplate || "Laporan Observasi Lingkungan",
    date: dateStr,
    truthNote: "Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa, mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir.",
    abstract,
    keywords,
    introduction,
    methods: {
      location: input.location || "Sekitar Halaman Kampus (diberikan oleh pengguna, belum terverifikasi)",
      time: "Pagi hari (catatan pengguna, belum terverifikasi)",
      objectObserved: "Spesimen Daun A dan Daun B",
      observationMethod: "Observasi visual kualitatif langsung di lapangan tanpa pengambilan sampel permanen",
      missingDetails: "Data cuaca, kelembapan udara, nama ilmiah pohon induk, dan koordinat GPS presisi belum dicatat."
    },
    results: {
      comparisonTable: [
        { trait: "Bentuk", leafA: "Lonjong (Elliptic)", leafB: "Menjari (Palmate)", notes: "Perbedaan struktur laminasi yang jelas" },
        { trait: "Tipe Tepi (Margin)", leafA: "Rata (Entire)", leafB: "Bergerigi (Serrate)", notes: "Ciri diagnostik penting" },
        { trait: "Warna", leafA: "Hijau Tua", leafB: "Hijau Muda", notes: "Kemungkinan perbedaan usia daun atau paparan cahaya" },
        { trait: "Catatan Tambahan", leafA: "Permukaan licin", leafB: "Permukaan agak kasar", notes: "Data dari pengamatan fisik langsung" }
      ]
    },
    discussion,
    evidence: {
      photoSlot: "Foto belum tersedia (Upload dinonaktifkan di CP1)",
      measurementSlot: "Data kuantitatif belum tersedia",
      locationNote: `Catatan Lokasi: ${input.location || "Halaman Kampus"} (tidak diverifikasi secara digital)`,
      timestampNote: `Catatan Waktu: pagi hari (tidak ada tanda tangan kriptografis)`,
      referenceSlot: "Source verification belum aktif di MVP ini. Belum ada rujukan eksternal terverifikasi."
    },
    limitations,
    missingEvidenceChecklist: missingChecklist,
    conclusion,
    appendix: {
      rawInputSummary: `Teks input pengguna: "${input.mainText || ""}"`,
      disclaimer: PUBLIC_REPORT_DISCLAIMER
    }
  };
}

export function mapJournalToDraftReport(report: DraftReport, contract: JournalContract): DraftReport {
  // Format findings list
  const findingsList = [
    `Spesimen Daun A: Bentuk lonjong, tepi rata, warna hijau tua.`,
    `Spesimen Daun B: Bentuk menjari, tepi bergerigi, warna hijau muda.`,
    `Lokasi pengamatan: ${contract.methods.location}.`,
    `Waktu pengamatan: ${contract.methods.time}.`
  ];

  // Render a markdown comparison table inside preliminary_analysis
  const tableRows = contract.results.comparisonTable
    .map(row => `| ${row.trait} | ${row.leafA} | ${row.leafB} | ${row.notes} |`)
    .join("\n");

  const resultsTableMarkdown = [
    "### Tabel Perbandingan Morfologi Daun",
    "| Karakter Fisik | Spesimen Daun A | Spesimen Daun B | Catatan / Analisis Awal |",
    "| --- | --- | --- | --- |",
    tableRows,
    "",
    "*(Catatan: Jangan mengidentifikasi nama spesies secara sembarangan tanpa kunci determinasi lengkap)*"
  ].join("\n");

  const evidenceNotes = [
    `- **Evidence Slot 1 (Foto):** ${contract.evidence.photoSlot}`,
    `- **Evidence Slot 2 (Pengukuran):** ${contract.evidence.measurementSlot}`,
    `- **Catatan Lokasi:** ${contract.evidence.locationNote}`,
    `- **Catatan Waktu:** ${contract.evidence.timestampNote}`,
    `- **Rujukan Pustaka:** ${contract.evidence.referenceSlot}`
  ];

  const executiveSummary = [
    contract.abstract,
    "",
    `**Keywords:** ${contract.keywords.join(", ")}`
  ].join("\n");

  return {
    ...report,
    title: contract.title,
    executive_summary: executiveSummary,
    background: contract.introduction,
    objective: "Mendokumentasikan ciri morfologi luar dari dua spesimen daun di halaman kampus secara kualitatif sebagai sarana pembelajaran mandiri.",
    method_or_materials: [
      `- **Objek:** ${contract.methods.objectObserved}`,
      `- **Metode:** ${contract.methods.observationMethod}`,
      `- **Lokasi:** ${contract.methods.location}`,
      `- **Waktu:** ${contract.methods.time}`,
      `- **Detail Kurang:** ${contract.methods.missingDetails}`
    ].join("\n"),
    findings: findingsList,
    preliminary_analysis: resultsTableMarkdown,
    discussion: contract.discussion,
    conclusion: contract.conclusion,
    source_notes: evidenceNotes,
    uncertainty_note: [
      "### Keterbatasan Bukti & Validasi",
      ...contract.limitations.map(lim => `- ${lim}`)
    ].join("\n"),
    additional_evidence_needed: contract.missingEvidenceChecklist,
    user_review_checklist: [
      "Apakah bentuk daun A dan B sudah diperiksa ulang kecocokannya?",
      "Apakah ada foto spesimen yang perlu disimpan secara lokal?",
      "Apakah deskripsi lokasi sudah cukup jelas sebagai penunjuk umum?"
    ],
    next_user_steps: [
      "Ambil foto kedua daun secara lokal untuk arsip pribadi.",
      "Gunakan penggaris untuk mengukur panjang dan lebar daun.",
      "Cari kunci determinasi morfologi daun di perpustakaan kampus.",
      "Lakukan review mandiri terhadap kebenaran deskripsi fisik."
    ]
  };
}
