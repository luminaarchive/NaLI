import type { DraftReport, EvidenceRow } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";
import { richEvidenceFixture, type LeafReplicate } from "./journalRichEvidenceFixture";
import { processCitations } from "./journalCitationEngine";
import {
  getJournalModelCapability,
  type JournalModelCapability,
  type JournalModelId,
} from "./journalModelCapabilities";

type JournalBuildInput = {
  created_at?: string;
  location?: string;
  mainText?: string;
  reportTemplate?: string;
  title?: string;
};

type ResultRow = {
  object: string;
  shape: string;
  margin: string;
  color: string;
  source: string;
  evidenceStatus: string;
};

type StatsRow = {
  groupName: string;
  meanLength: number;
  meanWidth: number;
  meanPetiole: number;
};

type ArticleProfile = {
  editorialNote: string;
  abstract: string;
  introduction: string;
  literatureFraming: string;
  methodEmphasis: string;
  resultsNarrative: string;
  discussion: string;
  conservationRelevance: string;
  cannotBeConcluded: string;
  limitations: string[];
  futureData: string[];
  futureWork: string;
  conclusion: string;
  audit?: {
    evidenceSufficiencyAssessment: string;
    dataRiskRegister: string[];
    methodologicalVulnerability: string;
    citationBoundaryAudit: string;
    reliabilityScore: string;
    sourceGapAnalysis: string;
  };
  premium?: {
    executiveEditorialSummary: string;
    editorialAbstract: string;
    integratedLiteratureFraming: string;
    integratedDiscussion: string;
    publicationStyleRevisionNotes: string[];
    reviewerReadinessChecklist: string[];
    refinedFigureCaptions: string[];
    refinedTableCaptions: string[];
  };
};

export interface JournalArticle {
  modelId: JournalModelId;
  capabilities: JournalModelCapability;
  sectionTitles: string[];
  upgradeNote?: string;
  audit?: ArticleProfile["audit"];
  premium?: ArticleProfile["premium"];
  cover: {
    journalTitle: string;
    seriesTitle: string;
    issueLine: string;
    editionLine: string;
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
    publicExportStatus: string;
    doi: string;
    issn: string;
    author: string;
    affiliation: string;
    articleCategory: string;
    shortCategory: string;
    editorialNote: string;
  };
  infoBlock: {
    category: string;
    materialBasis: string;
    status: string;
    handling: string;
    received: string;
    accepted: string;
    published: string;
    verificationStatus: string;
    exportStatus: string;
  };
  abstract: { text: string; keywords: string[] };
  introduction: string;
  literatureReview: string;
  materialsAndMethods: {
    objectObserved: string;
    location: string;
    time: string;
    method: string;
    profileEmphasis: string;
    observationDesign: string;
    recordingProtocol: string;
    missingDetails: string;
    reproducibility: string;
  };
  results: {
    comparisonTable: ResultRow[];
    narrative: string;
    replicatesTable?: LeafReplicate[];
    statsTable?: StatsRow[];
  };
  discussion: string;
  conservationRelevance: string;
  cannotBeConcluded: string;
  evidence: {
    figureCaption: string;
    photoSlot: string;
    measurementSlot: string;
    locationSlot: string;
    timestampSlot: string;
    referenceSlot: string;
    figures: typeof richEvidenceFixture.figures;
  };
  limitations: string[];
  futureDataRequired: string[];
  futureWork: string;
  conclusion: string;
  annexure: {
    rawInputSummary: string;
    evidenceTable: EvidenceRow[];
    checklist: string[];
  };
  references: string[];
}

function paragraphs(...items: string[]) {
  return items.join("\n\n");
}

const profiles: Record<JournalModelId, ArticleProfile> = {
  peregrine: {
    editorialNote:
      "Catatan praktikum ringkas untuk memahami bahan awal. Output sengaja dibatasi dan bukan audit bukti lengkap.",
    abstract: paragraphs(
      "Starter brief ini menata catatan pengguna tentang dua kelompok daun dalam local QA fixture. Daun A dilaporkan lonjong dengan tepi rata dan warna hijau tua; Daun B dilaporkan menjari dengan tepi bergerigi dan warna hijau muda.",
      "Output hanya merangkum perbandingan visual dasar dan kebutuhan dokumentasi berikutnya. Ia tidak menetapkan spesies, tidak memvalidasi sumber, dan tidak menggantikan pencatatan praktikum pengguna.",
    ),
    introduction: paragraphs(
      "Background for Practicum. Pengamatan bentuk, tepi, dan warna tampak daun adalah latihan awal untuk mencatat karakter visual. Catatan ini disusun dari bahan pengguna bergaya fixture lokal, bukan hasil pemeriksaan eksternal.",
      "Tujuan starter note adalah membantu pengguna melihat apa yang sudah tercatat dan apa yang masih perlu dikumpulkan sebelum draf yang lebih serius dapat disusun.",
    ),
    literatureFraming:
      "Background for Practicum. Istilah morfologi perlu diperiksa kembali melalui sumber yang benar-benar dibaca pengguna. Source verification belum aktif di MVP ini.",
    methodEmphasis:
      "Metode starter: salin ciri yang dilaporkan, pisahkan dua kelompok, dan tandai kekurangan foto atau catatan ukur tanpa melakukan interpretasi lanjut.",
    resultsNarrative:
      "Starter Results. Tabel ringkas menunjukkan perbedaan visual yang dilaporkan antara Daun A dan Daun B. Temuan hanya merupakan ringkasan bahan fixture yang belum diverifikasi.",
    discussion:
      "Catatan awal ini cukup untuk memandu dokumentasi ulang. Perbandingan tidak dapat digunakan untuk mengidentifikasi spesies atau menyatakan penyebab biologis.",
    conservationRelevance:
      "Praktikum pencatatan yang jujur membantu pengguna membangun kebiasaan dokumentasi vegetasi kampus tanpa menambah klaim yang belum didukung.",
    cannotBeConcluded:
      "Nama spesies, status konservasi, penyebab perbedaan bentuk atau warna, dan lokasi presisi tidak dapat disimpulkan.",
    limitations: [
      "Bahan adalah local QA fixture yang belum diverifikasi eksternal.",
      "Foto berskala dan bukti lokasi presisi belum tersedia.",
      "Sumber yang disebut pengguna belum diverifikasi oleh NaLI.",
    ],
    futureData: [
      "Tambahkan foto berskala.",
      "Periksa kembali catatan sumber.",
      "Catat metode pengamatan dengan jelas.",
    ],
    futureWork:
      "Langkah berikutnya adalah mengumpulkan dokumentasi visual dan catatan pengukuran pengguna sebelum memilih penyusunan yang lebih mendalam.",
    conclusion:
      "Starter note ini merangkum dua deskripsi daun yang berbeda secara visual. Ia berguna sebagai titik mulai praktikum, tetapi sengaja tidak berkembang menjadi artikel jurnal atau audit bukti.",
  },
  obsidian: {
    editorialNote:
      "Evidence audit yang menguji kecukupan bahan, batas klaim, risiko data, dan langkah mitigasi tanpa menjanjikan publikasi.",
    abstract: paragraphs(
      "Audit bukti ini menilai catatan morfologi dua kelompok daun dan enam baris pengukuran dalam local QA fixture. Fokusnya bukan membuat narasi panjang, melainkan menentukan klaim mana yang ditopang oleh catatan dan mana yang harus ditahan.",
      "Dua kelompok mempunyai deskripsi visual dan pengukuran berulang yang dapat ditabulasi, tetapi tidak disertai foto berskala, voucher spesimen, koordinat terverifikasi, atau sumber eksternal yang telah diperiksa. Karena itu, hasil memadai untuk audit latihan dan tidak memadai untuk identifikasi spesies atau klaim ekologis.",
      "Dokumen menyertakan inventaris bukti, matriks ukuran, risk register, batas kesimpulan, dan pemeriksaan batas sitasi agar pengguna dapat memperbaiki pengumpulan bukti secara transparan.",
    ),
    introduction: paragraphs(
      "Scope and Claim Boundary. Obsidian membaca bahan sebagai rekaman yang perlu diuji, bukan sebagai hasil terverifikasi. Ciri visual dan angka fixture dapat dilaporkan kembali sebagai data yang disediakan, sementara identitas taksonomi dan penjelasan kausal tetap di luar batas.",
      "Tujuan audit adalah mengungkap kesenjangan antara data yang tersedia dan klaim yang mungkin ingin dibuat pengguna. Setiap tabel mempertahankan label local QA fixture dan status belum diverifikasi.",
    ),
    literatureFraming:
      "Citation Boundary Audit. Dua rujukan hanya ditampilkan apabila disebut dalam masukan pengguna; keduanya tetap berlabel user-supplied reference placeholder dan belum diverifikasi. Audit tidak menambahkan DOI, penerbit, atau klaim validitas.",
    methodEmphasis:
      "Metode audit memeriksa inventaris bahan, konsistensi unit pengukuran, keberadaan bukti pendamping, serta apakah klaim dapat dilacak kembali ke catatan fixture.",
    resultsNarrative: paragraphs(
      "Measurement Tables. Enam baris replikasi dan ringkasan rerata disajikan sebagai catatan yang diberikan untuk QA. Angka tersebut tidak digeneralisasi ke populasi tanaman apa pun.",
      "Kontras bentuk dan tepi daun tercatat konsisten di dalam fixture, tetapi tidak menjadi dasar penetapan spesies.",
    ),
    discussion:
      "Pembahasan konservatif menempatkan tabel sebagai bukti deskriptif terbatas. Pengguna dapat mengaudit kembali transkripsi angka dan menambah foto berskala; tanpa langkah itu, interpretasi di luar ciri yang dilaporkan harus ditahan.",
    conservationRelevance:
      "Audit dokumentasi vegetasi dapat memperkuat praktik pembelajaran dan pencatatan yang bertanggung jawab, selama hasil tidak disebut sebagai inventaris terverifikasi.",
    cannotBeConcluded:
      "Cannot Be Concluded: identitas spesies, status konservasi, lokasi GPS, validitas rujukan, penyebab biologis perbedaan morfologi, dan keterwakilan statistik.",
    limitations: [
      "Foto bukti berskala belum tersedia.",
      "Asal spesimen dan koordinat tidak diverifikasi.",
      "Pengukuran fixture tidak dilengkapi bukti kalibrasi alat.",
      "Rujukan pengguna belum diverifikasi dan tidak membuktikan klaim.",
    ],
    futureData: [
      "Foto setiap sampel dengan skala dan label replikasi.",
      "Catatan alat, prosedur ukur, dan transkripsi asli.",
      "Sumber yang dibaca pengguna dengan kutipan yang dapat diperiksa.",
      "Catatan lokasi umum yang aman dan dapat ditinjau.",
    ],
    futureWork:
      "Perbaikan berikutnya harus menutup gap bukti sebelum mengembangkan pembahasan: cocokkan tabel dengan catatan asli, lampirkan foto berskala, dan catat sumber yang benar-benar diperiksa.",
    conclusion:
      "Obsidian menemukan data deskriptif yang cukup untuk latihan audit terstruktur, namun belum cukup untuk klaim taksonomi atau ekologis. Nilai dokumen ini terletak pada risk register dan batas klaim yang dapat ditindaklanjuti.",
    audit: {
      evidenceSufficiencyAssessment:
        "Evidence Sufficiency Assessment: cukup untuk membandingkan ciri dan ukuran yang dilaporkan dalam fixture; tidak cukup untuk identifikasi, generalisasi, atau validasi sumber.",
      dataRiskRegister: [
        "R1 - Foto tidak tersedia: bentuk dan tepi tidak dapat diperiksa ulang secara visual.",
        "R2 - Kalibrasi tidak tercatat: presisi nilai ukur belum dapat diaudit.",
        "R3 - Rujukan belum diperiksa: dukungan literatur belum dapat dinilai.",
        "R4 - Lokasi tidak diverifikasi: tidak boleh dibuat klaim distribusi.",
      ],
      methodologicalVulnerability:
        "Methodological Vulnerability: ukuran sampel kecil, tidak ada bukti visual, dan tidak ada rekam kalibrasi membuat inferensi di luar deskripsi fixture tidak layak.",
      citationBoundaryAudit:
        "Citation Boundary Audit: sumber yang dicantumkan berasal dari masukan pengguna dan belum diverifikasi; tidak ada DOI atau sitasi baru yang dibuat.",
      reliabilityScore:
        "Data reliability score: 2/5 (deterministic QA rating). Nilai ini menilai kelengkapan dokumentasi fixture, bukan kebenaran biologis.",
      sourceGapAnalysis:
        "Source gap analysis: pengguna perlu menyediakan sumber yang benar-benar dibaca dan relevan sebelum framing literatur dapat dikembangkan.",
    },
  },
  zephyr: {
    editorialNote:
      "Naskah premium dengan harmoni struktur, transisi editorial, dan penjelasan batas bukti yang tetap konservatif.",
    abstract: paragraphs(
      "Editorial Abstract. Naskah ini menyusun catatan morfologi daun bergaya fixture menjadi draf jurnal panjang dengan alur editorial yang jelas. Dua kelompok daun dicatat memiliki bentuk, tepi, dan warna tampak yang berbeda; tabel ukuran disajikan semata sebagai data yang diberikan untuk local QA.",
      "Struktur premium menghubungkan latar pembelajaran, metodologi dokumentasi, hasil, dan pembahasan terintegrasi sambil mempertahankan garis batas: tidak ada identifikasi spesies, verifikasi rujukan, atau klaim sebab-akibat yang dilakukan.",
      "Alih-alih menutupi kekurangan bahan, naskah menempatkan kekosongan foto, verifikasi sumber, dan dokumentasi metode sebagai agenda revisi editorial. Hasilnya adalah draf panjang yang siap diedit pengguna secara bertanggung jawab, bukan karya final.",
    ),
    introduction: paragraphs(
      "Catatan lapangan yang sederhana dapat menjadi awal naskah yang rapi bila setiap klaim tetap memiliki asal yang jelas. Draf ini memulai dari laporan pengguna mengenai Daun A dan Daun B, kemudian menata bukti yang tersedia sebagai bahan pembacaan komparatif.",
      "Pertanyaan editorial yang memandu naskah bukanlah spesies apa yang ditemukan, melainkan bagaimana deskripsi dan ukuran yang diberikan dapat disajikan tanpa melampaui buktinya. Pendekatan itu menjaga nilai belajar dan integritas dokumen.",
      "Local QA fixture dipakai untuk menguji kualitas susunan dokumen; ia bukan dokumentasi observasi terverifikasi. Pernyataan ini menjadi dasar setiap transisi dan simpulan di dalam naskah.",
    ),
    literatureFraming: paragraphs(
      "Integrated Literature Framing. Bahasa morfologi dapat diposisikan di dalam tradisi deskripsi botani hanya setelah sumber dibaca dan dikutip pengguna. Rujukan yang disebut dalam bahan ditampilkan sebagai placeholder sumber pengguna yang belum diverifikasi.",
      "Framing literatur dalam draf ini karena itu berfungsi sebagai peta revisi: pengguna perlu memeriksa definisi istilah, relevansi sumber, dan kecocokan kutipan sebelum mempertahankannya dalam naskah lanjutan.",
    ),
    methodEmphasis:
      "Metode editorial mempertahankan rantai bukti: deskripsi fixture, tabel pengukuran yang diberi label, ruang dokumentasi visual, dan pernyataan eksplisit tentang detail yang hilang.",
    resultsNarrative: paragraphs(
      "Tabel morfologi mencatat dua pola deskriptif yang berbeda. Tabel pengukuran dan ringkasan rerata memudahkan pengguna menelusuri kembali enam baris data yang diberikan tanpa mengubahnya menjadi klaim populasi.",
      "Refined table captions memisahkan dengan jelas hasil yang dilaporkan dari interpretasi. Figure plates merupakan ilustrasi QA berlabel, bukan foto spesimen atau bukti identifikasi.",
    ),
    discussion: paragraphs(
      "Integrated Discussion. Perbedaan bentuk dan tepi daun dapat dideskripsikan dengan yakin hanya sebagai perbedaan di dalam bahan fixture. Penyajian angka menambah ketertelusuran dokumen, namun ketiadaan foto berskala dan verifikasi sumber menahan kesimpulan lebih luas.",
      "Alur editorial menghubungkan temuan dengan tindakan revisi: dokumentasi visual harus mendahului pemeriksaan ulang karakter; catatan alat harus mendahului evaluasi reliabilitas; pembacaan sumber harus mendahului framing ilmiah yang lebih jauh.",
      "Dengan demikian, kekuatan premium tidak datang dari klaim tambahan, melainkan dari naskah yang lebih mudah ditinjau, disunting, dan dipertanggungjawabkan oleh pengguna.",
    ),
    conservationRelevance:
      "Dokumentasi vegetasi kampus yang disiplin dapat mendukung pembelajaran kepedulian biodiversitas, tetapi draf ini tidak menyatakan inventaris, tren, atau status konservasi.",
    cannotBeConcluded:
      "Identitas spesies, status konservasi, GPS, validitas bibliografis, hubungan ekologis, dan verifikasi lapangan tetap tidak dapat disimpulkan.",
    limitations: [
      "Fixture belum memiliki foto spesimen yang dapat diperiksa.",
      "Rujukan yang disebut pengguna belum diverifikasi.",
      "Pengukuran disajikan sebagai bahan QA, bukan dataset penelitian tervalidasi.",
      "Naskah memerlukan penyuntingan dan pemeriksaan sumber oleh pengguna.",
    ],
    futureData: [
      "Tambahkan dokumentasi visual berskala dengan label sampel.",
      "Lampirkan catatan metode dan instrumen yang benar-benar digunakan.",
      "Baca dan verifikasi sumber sebelum mempertahankan kutipan.",
      "Revisi simpulan setelah batas bukti dikonfirmasi.",
    ],
    futureWork:
      "Agenda editorial berikutnya mengutamakan verifikasi oleh pengguna: lengkapi bukti primer, perbaiki sitasi berdasarkan sumber yang telah dibaca, lalu selaraskan judul, abstrak, tabel, dan kesimpulan dengan bukti akhir.",
    conclusion: paragraphs(
      "Premium Conclusion. Draf ini menghasilkan naskah komparatif yang terstruktur dari bahan fixture tanpa mengarang identitas, sumber, atau verifikasi. Ciri dan pengukuran yang dilaporkan dapat dibaca secara runtut bersama batasnya.",
      "Nilai Zephyr terletak pada integrasi editorial: abstrak, pembahasan, caption, agenda revisi, dan checklist penelaah membentuk jalur penyuntingan yang panjang dan koheren sambil membiarkan manusia memegang keputusan akhir.",
    ),
    premium: {
      executiveEditorialSummary:
        "Executive Editorial Summary: naskah siap memasuki revisi berbasis bukti setelah pengguna melengkapi foto, metode, dan sumber; seluruh kesimpulan saat ini tetap terbatas pada local QA fixture.",
      editorialAbstract:
        "Editorial Abstract: pengantar, metode, hasil, pembahasan, dan agenda revisi diharmonisasikan sebagai draf jurnal premium yang tetap menyatakan kekurangan bukti.",
      integratedLiteratureFraming:
        "Integrated Literature Framing: sumber pengguna diposisikan sebagai bahan yang harus diverifikasi, bukan otoritas yang telah disahkan NaLI.",
      integratedDiscussion:
        "Integrated Discussion: narasi menghubungkan tabel, figure plate, keterbatasan, dan langkah revisi tanpa mengubah deskripsi fixture menjadi temuan terverifikasi.",
      publicationStyleRevisionNotes: [
        "Publication-style Revision Notes: validasi semua sumber yang dipertahankan dan hilangkan placeholder yang tidak dapat diperiksa.",
        "Tambahkan foto berskala serta jelaskan instrumen dan prosedur pengukuran.",
        "Selaraskan kembali judul dan simpulan setelah bukti tambahan tersedia.",
      ],
      reviewerReadinessChecklist: [
        "Reviewer-readiness Checklist: sumber telah dibaca dan cocok dengan kutipan.",
        "Bukti visual berlabel mendukung setiap deskripsi utama.",
        "Batas inferensi dinyatakan dalam abstrak, pembahasan, dan simpulan.",
        "Tidak ada identifikasi, DOI, atau status verifikasi yang tidak didukung.",
      ],
      refinedFigureCaptions: [
        "Figure 1. Editorial comparison plate for user-reported leaf forms; illustrative local QA fixture only, not specimen evidence.",
        "Figure 2. Measurement-reading guide for supplied replicate rows; values remain unverified user-style fixture data.",
        "Figure 3. Editorial traceability map linking supplied evidence, declared limits, and revision actions; editorial aid only.",
      ],
      refinedTableCaptions: [
        "Table 1. Descriptive characters transcribed from the supplied local QA fixture with verification boundaries retained.",
        "Table 2. Supplied replicate measurements and descriptive summaries, presented without population inference.",
      ],
    },
  },
};

function modelId(value: string): JournalModelId {
  return value === "obsidian" || value === "zephyr" ? value : "peregrine";
}

export function buildJournalArticle(input: JournalBuildInput, requestedModel: string): JournalArticle {
  const selected = modelId(requestedModel);
  const capabilities = getJournalModelCapability(selected);
  const profile = profiles[selected];
  const year = new Date().getFullYear();
  const dateStr =
    input.created_at || new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  const location = input.location || richEvidenceFixture.location;
  const hasUserRefs =
    typeof input.mainText === "string" && /Botany Guide|Flora Kampus|references|referensi/i.test(input.mainText);
  const suppliedReferences = hasUserRefs ? richEvidenceFixture.references.slice(0, capabilities.maxReferences) : [];
  const processedIntro = processCitations(profile.introduction, suppliedReferences);
  const processedFraming = processCitations(profile.literatureFraming, suppliedReferences);
  const processedDiscussion = processCitations(profile.discussion, suppliedReferences);
  const comparisonTable: ResultRow[] = richEvidenceFixture.groups.map((group) => ({
    object: group.name,
    shape: group.shape,
    margin: group.marginType,
    color: group.colorNote,
    source: "Catatan pengguna (local QA fixture)",
    evidenceStatus: "Belum diverifikasi (source verification inactive)",
  }));
  const rawReplicates = richEvidenceFixture.groups.flatMap((group) => group.replicates);
  const statsTable = richEvidenceFixture.groups.map((group) => ({
    groupName: group.name,
    meanLength: group.stats.meanLength,
    meanWidth: group.stats.meanWidth,
    meanPetiole: group.stats.meanPetiole,
  }));
  const isStarter = selected === "peregrine";

  return {
    modelId: selected,
    capabilities,
    sectionTitles: [...capabilities.sectionTitles],
    upgradeNote: capabilities.upgradeNote,
    audit: profile.audit,
    premium: profile.premium,
    cover: {
      journalTitle: "NaLI Nature & Evidence Journal",
      seriesTitle: "Nature / Evidence / Learning",
      issueLine: `Volume 1 / Issue 1 / ${year}`,
      editionLine: "CP1 Founder/Admin QA Edition",
      year,
      coverSubtitle: "Draft Artikel Observasi Morfologi Daun",
      brandNote: "Prepared by NaLI — Native Field Intelligence Services",
      truthNote: "Draft only; source verification inactive; public export locked.",
    },
    metadata: {
      title: input.title || "Pengamatan Morfologi Daun di Sekitar Kampus",
      modelLabel: `NaLI ${selected.charAt(0).toUpperCase()}${selected.slice(1)}`,
      reportType: input.reportTemplate || "Laporan Observasi Lingkungan",
      generatedDate: dateStr,
      documentStatus: "Draft bantuan belajar/penulisan berbasis bukti.",
      sourceVerificationStatus: "Inactive (Source verification belum aktif di MVP ini)",
      publicExportStatus: "Public PDF/DOCX export locked",
      doi: "Not assigned in CP1",
      issn: "Not applicable",
      author: "Generated draft from user-provided materials",
      affiliation: "NaLI Nature & Evidence Journal / CP1 editorial draft",
      articleCategory: capabilities.articleType,
      shortCategory: capabilities.costLabel,
      editorialNote: profile.editorialNote,
    },
    infoBlock: {
      category: capabilities.articleType,
      materialBasis: "User-provided descriptive notes [local QA fixture]",
      status: "Draft article",
      handling: "Founder/admin local QA only",
      received: "Not applicable",
      accepted: "Not applicable",
      published: "Not published",
      verificationStatus: "Unverified (not externally verified)",
      exportStatus: "Public export locked",
    },
    abstract: {
      text: profile.abstract,
      keywords: isStarter
        ? ["praktikum dasar", "catatan pengguna", "local QA fixture"]
        : selected === "obsidian"
          ? ["evidence audit", "claim boundary", "risk register", "local QA fixture"]
          : ["editorial draft", "integrated discussion", "revision notes", "local QA fixture"],
    },
    introduction: processedIntro.processedText,
    literatureReview: processedFraming.processedText,
    materialsAndMethods: {
      objectObserved: "Spesimen Daun A dan Daun B sebagaimana dideskripsikan pengguna [local QA fixture]",
      location,
      time: richEvidenceFixture.dateTime,
      method: isStarter
        ? "Ringkasan deskriptif ciri yang dilaporkan pengguna; tanpa analisis pengukuran lengkap."
        : "Komparasi deskriptif dan pembacaan tabel pengukuran fixture tanpa identifikasi spesies eksternal.",
      profileEmphasis: profile.methodEmphasis,
      observationDesign: isStarter
        ? "Catatan membandingkan dua kelompok secara visual dan mencatat kebutuhan bukti lanjutan."
        : "Enam baris replikasi fixture dikelompokkan sebagai Daun A dan Daun B; tabel dipertahankan sebagai catatan yang belum diverifikasi.",
      recordingProtocol: isStarter
        ? "Pengguna perlu menyimpan foto dan catatan asli sebelum membuat analisis lanjut."
        : "Transkripsi angka harus dicocokkan kembali dengan catatan asli dan foto berskala sebelum digunakan lebih jauh.",
      missingDetails:
        "Foto orisinal, koordinat terverifikasi, kalibrasi instrumen, dan verifikasi sumber belum tersedia.",
      reproducibility: "Reproduksibilitas belum dapat ditetapkan tanpa bukti primer dan pemeriksaan manusia.",
    },
    results: {
      comparisonTable,
      narrative: profile.resultsNarrative,
      replicatesTable: isStarter ? undefined : rawReplicates,
      statsTable: isStarter ? undefined : statsTable,
    },
    discussion: processedDiscussion.processedText,
    conservationRelevance: profile.conservationRelevance,
    cannotBeConcluded: profile.cannotBeConcluded,
    evidence: {
      figureCaption: isStarter
        ? "Figure 1. Starter visual placeholder for user-supplied evidence."
        : "Figure 1. Evidence plate labelled as local QA fixture and not externally verified.",
      photoSlot: "Foto belum disediakan. Ruang dokumentasi tetap kosong sampai pengguna menambahkan bukti.",
      measurementSlot: isStarter
        ? "Tabel pengukuran lengkap tidak ditampilkan pada starter output."
        : "Data kuantitatif adalah local QA fixture dan belum diverifikasi secara eksternal.",
      locationSlot: `Lokasi umum: ${location} (disampaikan pengguna; belum diverifikasi).`,
      timestampSlot: `Waktu: ${richEvidenceFixture.dateTime} (local QA fixture; belum diverifikasi).`,
      referenceSlot: "Source verification belum aktif di MVP ini.",
      figures: richEvidenceFixture.figures.slice(0, capabilities.maxFigures),
    },
    limitations: profile.limitations,
    futureDataRequired: profile.futureData,
    futureWork: profile.futureWork,
    conclusion: profile.conclusion,
    annexure: {
      rawInputSummary:
        "Fixture: Daun A dilaporkan lonjong, rata, hijau tua; Daun B dilaporkan menjari, bergerigi, hijau muda. Semua isi berstatus local QA fixture.",
      evidenceTable: [
        {
          id: "M01",
          material_type: "catatan",
          summary: "Daun A: lonjong, tepi rata, warna hijau tua.",
          user_provided: true,
          verification_status: "local QA fixture (not externally verified)",
        },
        {
          id: "M02",
          material_type: "catatan",
          summary: "Daun B: menjari, tepi bergerigi, warna hijau muda.",
          user_provided: true,
          verification_status: "local QA fixture (not externally verified)",
        },
      ],
      checklist: isStarter
        ? ["Tambahkan foto berskala.", "Periksa catatan asli dan sumber pengguna."]
        : [
            "Cocokkan kembali tabel dengan catatan asli.",
            "Tambahkan foto berskala untuk tiap sampel.",
            "Periksa langsung setiap sumber yang dipertahankan.",
            "Pertahankan pernyataan batas bukti saat menyunting.",
          ],
    },
    references: processedIntro.bibliography,
  };
}

function markdownTable(rows: ResultRow[]) {
  return rows
    .map(
      (row) =>
        `| ${row.object} | ${row.shape} | ${row.margin} | ${row.color} | ${row.source} | ${row.evidenceStatus} |`,
    )
    .join("\n");
}

export function mapJournalArticleToDraftReport(report: DraftReport, article: JournalArticle): DraftReport {
  const comparison = [
    "### Table 1. Reported visual characters (local QA fixture)",
    "| Objek | Bentuk | Tepi | Warna tampak | Sumber | Status |",
    "| --- | --- | --- | --- | --- | --- |",
    markdownTable(article.results.comparisonTable),
  ];
  const measurements = article.results.replicatesTable
    ? [
        "",
        "### Table 2. Supplied replicate measurements (local QA fixture)",
        "| ID | Panjang (cm) | Lebar (cm) | Tangkai (cm) | Bentuk | Tepi |",
        "| --- | --- | --- | --- | --- | --- |",
        ...article.results.replicatesTable.map(
          (row) =>
            `| ${row.id} | ${row.lengthCm} | ${row.widthCm} | ${row.petioleLengthCm} | ${row.shape} | ${row.marginType} |`,
        ),
      ]
    : [];
  const editorialReadiness =
    article.modelId === "zephyr" && article.premium
      ? [
          "",
          "### Table E1. Premium reviewer-readiness controls",
          "| Editorial control | Status |",
          "| --- | --- |",
          ...article.premium.reviewerReadinessChecklist.map((item) => `| ${item} | Perlu verifikasi pengguna |`),
        ]
      : [];
  const modelDiscussion =
    article.modelId === "obsidian" && article.audit
      ? [
          "EVIDENCE SUFFICIENCY ASSESSMENT",
          article.audit.evidenceSufficiencyAssessment,
          "CANNOT BE CONCLUDED",
          article.cannotBeConcluded,
          "DATA RISK REGISTER",
          ...article.audit.dataRiskRegister.map((risk) => `- ${risk}`),
          "METHODOLOGICAL VULNERABILITY",
          article.audit.methodologicalVulnerability,
          "CITATION BOUNDARY AUDIT",
          article.audit.citationBoundaryAudit,
        ]
      : article.modelId === "zephyr" && article.premium
        ? [
            "INTEGRATED DISCUSSION",
            article.discussion,
            "PUBLICATION-STYLE REVISION NOTES",
            ...article.premium.publicationStyleRevisionNotes.map((note) => `- ${note}`),
            "REVIEWER-READINESS CHECKLIST",
            ...article.premium.reviewerReadinessChecklist.map((item) => `- ${item}`),
          ]
        : ["SHORT LIMITATION CHECKLIST", ...article.limitations.map((item) => `- ${item}`), article.upgradeNote || ""];

  return {
    ...report,
    title: article.metadata.title,
    executive_summary: [
      article.metadata.articleCategory,
      article.metadata.editorialNote,
      article.abstract.text,
      article.metadata.documentStatus,
    ].join("\n\n"),
    background: [article.sectionTitles[1], article.introduction, article.literatureReview].join("\n\n"),
    objective:
      "Menyajikan bahan yang dilaporkan pengguna secara jujur sambil mempertahankan status belum diverifikasi.",
    method_or_materials: [
      article.materialsAndMethods.method,
      article.materialsAndMethods.profileEmphasis,
      article.materialsAndMethods.missingDetails,
    ].join("\n\n"),
    findings: article.results.comparisonTable.map(
      (row) =>
        `${row.object}: ${row.shape}, tepi ${row.margin}, warna tampak ${row.color}; local QA fixture, belum diverifikasi.`,
    ),
    preliminary_analysis: [...comparison, ...measurements, ...editorialReadiness, "", article.results.narrative].join(
      "\n",
    ),
    discussion: modelDiscussion.join("\n\n"),
    conclusion: article.conclusion,
    source_notes: [
      article.evidence.photoSlot,
      article.evidence.measurementSlot,
      article.evidence.locationSlot,
      article.evidence.referenceSlot,
      ...article.references,
    ],
    uncertainty_note: ["KETERBATASAN BUKTI", ...article.limitations.map((item) => `- ${item}`)].join("\n"),
    additional_evidence_needed: article.futureDataRequired,
    user_review_checklist: article.annexure.checklist,
    human_review_reminder: PUBLIC_REPORT_DISCLAIMER,
    next_user_steps: article.futureDataRequired,
  };
}
