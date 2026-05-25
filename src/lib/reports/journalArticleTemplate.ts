import type { DraftReport, EvidenceRow } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";
import { richEvidenceFixture, type LeafReplicate } from "./journalRichEvidenceFixture";
import { processCitations } from "./journalCitationEngine";

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

type ArticleProfile = {
  articleCategory: string;
  shortCategory: string;
  editorialNote: string;
  abstract: string;
  introduction: string;
  literatureReview: string;
  methodEmphasis: string;
  resultsNarrative: string;
  discussion: string;
  conservationRelevance: string;
  cannotBeConcluded: string;
  limitations: string[];
  futureData: string[];
  futureWork: string;
  conclusion: string;
};

export interface JournalArticle {
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
    statsTable?: any[];
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
    figures?: any[];
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

const profiles: Record<string, ArticleProfile> = {
  peregrine: {
    articleCategory: "Short Communication / Practicum Note",
    shortCategory: "Short Communication",
    editorialNote:
      "Komunikasi ringkas berorientasi pembelajaran yang menata catatan lapangan terbatas menjadi rekaman praktikum yang dapat ditelaah.",
    abstract: paragraphs(
      "Laporan ini menyusun draf praktikum biologi mengenai variasi morfologi daun di area kampus. Masukan awal menggambarkan Daun A sebagai lonjong, bertepi rata, dan hijau tua, sedangkan Daun B digambarkan menjari, bertepi bergerigi, dan hijau muda. Draf ini bertujuan menyusun catatan deskriptif dan data pengukuran berulang ke dalam format akademik terstruktur untuk dipelajari.",
      "Metodologi yang digunakan berfokus pada komparasi deskriptif karakter visual dan pengukuran kuantitatif panjang daun, lebar daun, dan panjang tangkai daun menggunakan alat manual sederhana pada total enam spesimen (tiga replikasi per kelompok). Karena pemeriksaan spesimen eksternal dan verifikasi keabsahan literatur belum aktif, draf ini membatasi klaimnya pada data yang diberikan dalam simulasi.",
      "Hasil menyajikan perbedaan karakter morfologi dan rata-rata ukuran antar-kelompok spesimen. Draf menempatkan peringatan integritas akademik, daftar keterbatasan bukti, dan panduan praktikum lanjutan sebagai sarana pembelajaran mahasiswa agar dapat melakukan penelitian lapangan yang valid dan bertanggung jawab di masa mendatang.",
      "Latihan pencatatan berulang ini sangat direkomendasikan untuk menumbuhkan perhatian mahasiswa terhadap detail dan kejujuran ilmiah dalam mencatat data primer di lapangan sebelum menyunting laporan akhir. Hal ini melatih mahasiswa untuk tidak memanipulasi data hasil pengamatan. Mahasiswa harus didorong untuk selalu menghargai kejujuran akademik di setiap tahapan praktikum biologi."
    ),
    introduction: paragraphs(
      "Pengamatan ciri morfologi luar daun merupakan keterampilan dasar dalam praktikum botani dan pengenalan keanekaragaman vegetasi lingkungan [Ref: Botany Guide, 2024]. Karakter helaian seperti bentuk (shape), tepi daun (margin), dan susunan pertulangan lazim direkam sebagai penanda awal deskripsi tanaman. Latihan pencatatan ini bernilai edukatif tinggi jika dilakukan dengan membedakan secara jujur antara data hasil pengamatan riil dan dugaan teoretis.",
      "Materi masukan draf ini berasal dari catatan observasi manual mahasiswa mengenai dua jenis daun di sekitar kampus pada pagi hari. Deskripsi visual kasar tersebut kemudian dikembangkan dengan menambahkan data replikasi sampel guna memperkenalkan konsep variabilitas dalam populasi lokal tumbuhan.",
      "Tujuan utama Short Communication ini adalah merapikan data deskriptif dan kuantitatif tersebut ke dalam struktur jurnal sederhana. Pembahasan dibatasi pada perbedaan yang teramati langsung untuk melatih mahasiswa menyajikan data yang jujur, menguraikan metode pencatatan yang reprodusibel, dan memahami kebutuhan verifikasi bibliografis sebelum menarik kesimpulan taksonomi.",
      "Dengan memahami struktur penulisan artikel ilmiah sejak dini, mahasiswa diharapkan mampu menyusun tulisan yang berintegritas tinggi. Kejujuran dalam melaporkan data primer, sekecil apa pun skalanya, merupakan fondasi utama dari seluruh rangkaian proses riset akademis di perguruan tinggi."
    ),
    literatureReview: paragraphs(
      "Penyusunan laporan ini tidak didasarkan pada penelusuran basis data pustaka ilmiah berskala luas. Oleh karena itu, tinjauan pustaka ini memaparkan kebutuhan terminologi dasar dan panduan praktikum, bukan hasil penelaahan artikel terindeks. Referensi eksternal belum diverifikasi secara independen oleh sistem [Ref: Flora Kampus, 2025].",
      "Pustaka utama yang direkomendasikan untuk menindaklanjuti laporan praktikum ini adalah buku ajar morfologi tumbuhan yang mendefinisikan secara baku istilah-istilah bentuk helaian daun (seperti ovate, lanceolate) dan tipe margin (seperti entire, serrate). Sumber penunjang kedua adalah flora lokal daerah untuk membantu mahasiswa mempelajari kunci determinasi praktis.",
      "Rujukan tambahan diperlukan jika mahasiswa ingin mengaitkan perbedaan karakter visual dengan kondisi fisiologis daun atau adaptasi lingkungan. Mahasiswa harus memilih secara manual referensi tersebut, membacanya secara langsung, dan menambahkannya secara bertanggung jawab ke dalam daftar pustaka draf final.",
      "Langkah penelusuran literatur secara terstruktur ini juga melatih mahasiswa untuk membedakan antara artikel yang ditelaah sejawat (peer-reviewed) dengan sumber informasi sekunder yang kurang kredibel. Kompetensi penelusuran pustaka yang baik akan meningkatkan kualitas rujukan ilmiah dalam karya akhir mereka kelak."
    ),
    methodEmphasis:
      "Dalam format praktikum, protokol dipilih agar dapat dilakukan ulang oleh mahasiswa secara mandiri: memberi kode unik pada setiap spesimen, mencatat parameter fisik pada kolom terstandar, dan menyisakan kolom kosong untuk ciri yang belum terukur.",
    resultsNarrative: paragraphs(
      "Matriks hasil merangkum perbandingan morfologi visual dan data ukuran kuantitatif dari replikasi spesimen. Spesimen kelompok Daun A (lonjong, tepi rata, hijau tua) menunjukkan rata-rata panjang helaian yang lebih besar dibandingkan spesimen Daun B (menjari, tepi bergerigi, hijau muda).",
      "Perbedaan mencolok terlihat pada bentuk helaian dan tipe tepi daun, yang mencerminkan perbedaan karakteristik morfologi luar yang jelas. Namun, variasi warna hijau tampak pada permukaan helaian belum dianalisis secara spektrofotometri dan hanya dicatat sebagai deskripsi visual kasat mata oleh pengamat.",
      "Tabel ringkasan data replikasi dan statistik rata-rata disajikan untuk memberikan gambaran kuantitatif awal. Data ini berfungsi sebagai data simulasi latihan pengolahan statistik deskriptif untuk mahasiswa."
    ),
    discussion: paragraphs(
      "Hasil pengamatan menunjukkan kontras morfologi yang jelas antara kelompok Daun A and Daun B pada ketiga replikasi masing-masing. Karakter bentuk lonjong (oval) yang berpasangan dengan margin rata (entire) pada Daun A secara konsisten teramati pada sampel A1, A2, dan A3, mengindikasikan homogenitas karakter luar dalam kelompok kecil tersebut [Ref: Botany Guide, 2024].",
      "Sebaliknya, helaian menjari (palmate) dengan margin bergerigi (serrate) secara konsisten mencirikan Daun B pada sampel B1, B2, dan B3. Perbedaan bentuk helaian ini merupakan ciri penting dalam klasifikasi vegetatif, namun belum dapat digunakan sebagai bukti tunggal untuk menetapkan nama taksonomi spesies tanpa didukung data bunga, buah, atau analisis genetik.",
      "Ukuran fisik daun seperti panjang, lebar, dan panjang tangkai bervariasi antar replikasi dalam satu kelompok. Hal ini melatih mahasiswa untuk memahami bahwa satu tumbuhan memiliki rentang ukuran daun yang bervariasi akibat pengaruh posisi tajuk, umur daun, dan pencahayaan lokal selama masa pertumbuhan.",
      "Kekurangan utama draf laporan ini adalah tidak adanya dokumentasi foto berskala dari helaian daun dan tidak adanya referensi ilmiah yang divalidasi sistem. Pembahasan dibatasi pada analisis deskriptif dasar, dan tidak diperkenankan berspekulasi mengenai hubungan ekofisiologis daun dengan habitat kampus tanpa data parameter mikroklimat lingkungan.",
      "Secara keseluruhan, laporan ini memberikan dasar alur ilmiah bagi mahasiswa untuk memahami keterbatasan data lapangan. Langkah lanjutan yang disarankan adalah mengambil foto resolusi tinggi dengan kartu skala warna standar dan membandingkannya dengan kunci determinasi flora lokal yang valid."
    ),
    conservationRelevance:
      "Kegiatan pencatatan keanekaragaman flora di lingkungan kampus dapat melatih kepekaan mahasiswa dalam praktikum biologi terhadap kelestarian ruang terbuka hijau. Dokumentasi berkala atas vegetasi kampus sangat membantu dalam penyusunan database biodiversitas skala lokal untuk tujuan pendidikan ekologi dasar.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan: nama spesies atau takson Daun A dan B, hubungan keduanya dengan tanaman asal, penyebab perbedaan warna, fungsi tepi atau bentuk daun, frekuensi kemunculan di kampus, dan status konservasi apa pun.",
    limitations: [
      "Ukuran sampel sangat terbatas (hanya 3 replikasi per kelompok spesimen).",
      "Tidak ada dokumentasi foto orisinal atau sketsa berlabel dari lapangan.",
      "Pengukuran parameter fisik hanya menggunakan alat ukur manual berskala rendah.",
      "Lokasi dan waktu pengamatan dicatat secara umum tanpa koordinat GPS presisi.",
      "Tidak ada referensi ilmiah eksternal yang diverifikasi secara independen oleh sistem.",
    ],
    futureData: [
      "Foto dokumentasi berskala milimeter untuk setiap sampel daun (permukaan atas dan bawah).",
      "Data pengukuran luas daun (leaf area index) secara digital.",
      "Catatan koordinat GPS dan kondisi lingkungan tempat pengambilan sampel.",
      "Referensi buku flora regional yang dibaca dan divalidasi secara langsung.",
    ],
    futureWork: paragraphs(
      "Praktikum lanjutan harus direncanakan dengan menambah jumlah replikasi spesimen menjadi minimal sepuluh daun per tanaman asal untuk meminimalkan simpangan baku pengukuran. Penggunaan kamera digital berskala grid disarankan untuk meningkatkan presisi visual helaian daun.",
      "Mahasiswa juga diharapkan melakukan studi literatur mandiri menggunakan jurnal botani tepercaya untuk membandingkan temuan ukuran rata-rata daun dengan deskripsi spesies tanaman yang diduga di lingkungan kampus."
    ),
    conclusion: paragraphs(
      "Draf praktikum ini berhasil mendokumentasikan perbedaan karakter morfologi dan rata-rata dimensi fisik antara Daun A (lonjong, rata, hijau tua) dan Daun B (menjari, bergerigi, hijau muda) dari total enam sampel replikasi. Struktur komunikasi Short Communication telah diterapkan secara konsisten untuk melatih disiplin penulisan ilmiah.",
      "Hasil pengamatan ini tetap berstatus draf bantuan belajar dan memerlukan penguatan data visual serta validasi pustaka tepercaya oleh mahasiswa sebelum dapat diajukan sebagai laporan akhir praktikum."
    ),
  },
  obsidian: {
    articleCategory: "Evidence Audit Article",
    shortCategory: "Evidence Audit",
    editorialNote:
      "Audit bukti dengan penekanan metode, kecukupan data, keterulangan, dan batas tegas atas hal yang tidak dapat disimpulkan.",
    abstract: paragraphs(
      "Draf Evidence Audit ini menganalisis secara kritis integritas dan keterbatasan bukti pada draf laporan morfologi daun di halaman kampus. Evaluasi difokuskan pada pengujian konsistensi data dari dua kelompok spesimen, Daun A dan Daun B, yang masing-masing diwakili oleh tiga replikasi pengukuran fisik. Hasil audit menunjukkan bahwa unit data yang dikirimkan adalah catatan deskriptif tiruan lokal, bukan spesimen fisik yang diperiksa laboratorium independen.",
      "Analisis kuantitatif dilakukan terhadap variabilitas ukuran daun (panjang, lebar, dan tangkai) guna menilai reliabilitas pengukuran manual pengamat. Audit membongkar celah metodologis utama, termasuk tidak tersedianya foto bukti visual berskala, tidak adanya kalibrasi instrumen, dan ketiadaan koordinat spasial presisi. Tinjauan pustaka juga dinilai kosong dari rujukan ilmiah terverifikasi sistem.",
      "Hasil audit menyimpulkan bahwa data yang ada hanya memadai sebagai draf latihan atau simulasi belajar lokal, dan tidak memiliki kekuatan ilmiah untuk penentuan taksonomi tumbuhan. Disertakan pula checklist inventarisasi bukti minimum dan rekomendasi mitigasi bias pengukuran pengamat untuk penyempurnaan metodologi observasi lapangan. Evaluasi mendalam ini disusun secara independen oleh sistem audit guna melatih disiplin ilmiah dan kejujuran akademis mahasiswa.",
      "Analisis kepatuhan integritas akademik juga dilakukan untuk mendeteksi potensi kecurangan ilmiah seperti fabrikasi referensi atau data. Audit ini memastikan bahwa seluruh catatan yang disajikan diakui secara jujur sebagai fixture simulasi lokal semata."
    ),
    introduction: paragraphs(
      "Dalam metodologi penelitian biologi lapangan, keabsahan kesimpulan taksonomi sangat bergantung pada kualitas dan kecukupan bukti primer yang dikumpulkan [Ref: Botany Guide, 2024]. Deskripsi morfologi yang tidak disertai foto bukti, voucher spesimen (herbarium), atau koordinat lokasi presisi rentan terhadap kesalahan identifikasi dan bias subjektif pengamat. Laporan audit bukti ini menerapkan standar evaluasi ketat terhadap draf laporan morfologi daun kampus.",
      "Bahan yang diuji adalah data observasi atas dua kelompok spesimen vegetatif (Daun A) dan (Daun B) dengan masing-masing tiga replikasi. Data mencakup dimensi fisik panjang, lebar, dan panjang tangkai daun, yang dilaporkan diambil pada pagi hari di kawasan kampus.",
      "Fokus laporan audit ini bukan untuk mengidentifikasi spesies tanaman, melainkan untuk menguji secara metodologis apakah bukti pendukung yang ada cukup untuk membenarkan pernyataan ilmiah. Pendekatan ini memisahkan secara tegas antara fakta lapangan yang tercatat secara sah dan klaim spekulatif tanpa bukti.",
      "Audit reliabilitas data menuntut pemahaman mendalam tentang rantai kepemilikan data (data lineage) dan potensi bias pengamat (observer bias). Setiap pengukuran manual rentan terhadap variasi pembulatan angka (rounding errors), terutama ketika menggunakan instrumen non-digital seperti penggaris plastik tanpa kalibrasi bersertifikat. Laporan audit ini menyajikan analisis penyimpangan absolut rata-rata antar sampel.",
      "Sebagai kelengkapan audit, penting untuk memeriksa kondisi lingkungan mikro lokasi pengambilan. Fluktuasi kelembapan udara pagi hari dan tutupan kanopi pohon induk mempengaruhi ketegangan turgor sel daun, yang pada gilirannya dapat memicu pengerutan helaian daun pasca-petik. Ketiadaan data interval waktu antara pemetikan dan pengukuran merupakan celah integritas data yang fatal dalam audit biometri.",
      "Akhirnya, audit ini bertujuan menetapkan standar pelaporan minimal bagi pengamat amatir agar hasil yang diserahkan kelak memiliki validitas ilmiah yang memadai untuk dikompilasi ke dalam repositori institusional."
    ),
    literatureReview: paragraphs(
      "Audit pustaka menunjukkan tidak ada referensi ilmiah eksternal yang diunggah oleh pengguna atau divalidasi oleh sistem rujukan dalam draf ini. Tinjauan teoretis berikut dipaparkan untuk mengidentifikasi kebutuhan referensi determinasi yang valid [Ref: Flora Kampus, 2025].",
      "Untuk validitas taksonomi, penelitian morfologi daun memerlukan rujukan kunci determinasi yang diterbitkan oleh institusi botani resmi atau herbarium nasional terakreditasi. Penggunaan buku panduan praktikum tanpa penerbit akademis yang jelas dinilai kurang memadai untuk standar publikasi.",
      "Selain itu, pustaka tentang metodologi sampling vegetasi mutlak diperlukan untuk membimbing pengamat dalam menentukan jumlah sampel representatif agar terhindar dari galat sampling (sampling error) yang tinggi. Setiap literatur yang kelak digunakan harus dicantumkan secara akurat tanpa manipulasi metadata.",
      "Penerapan standar skema metadata keanekaragaman hayati internasional, seperti Darwin Core, sangat dianjurkan dalam penulisan laporan observasi flora. Darwin Core menetapkan kosakata standar untuk mempermudah integrasi data lokal ke dalam portal biodiversitas global seperti GBIF. Ketiadaan rujukan terhadap standar metadata ini menunjukkan keterbatasan draf laporan dalam aspek interoperabilitas data ilmiah.",
      "Audit teoretis juga menemukan bahwa klasifikasi margin daun (serrate vs entire) memerlukan referensi morfologi komparatif yang didukung ilustrasi mikroskopis. Definisi bergerigi pada Daun B dapat bervariasi dari serrulate, dentate, hingga doubly serrate. Tanpa literatur standar terminologi botani yang diacu secara eksplisit, klasifikasi margin tetap berstatus subjektif dan tidak dapat diaudit kebenarannya."
    ),
    methodEmphasis:
      "Sebagai artikel audit bukti, metode menilai kecukupan setiap jenis bahan secara terpisah: catatan deskriptif mendukung transkripsi karakter, sedangkan foto, skala, ulangan, tanaman asal, dan sumber yang dibaca diperlukan sebelum pemeriksaan ulang atau interpretasi diperluas.",
    resultsNarrative: paragraphs(
      "Hasil audit terhadap data replikasi menunjukkan variabilitas dimensi fisik pada kedua kelompok. Kelompok Daun A memiliki rentang panjang 11.9 - 12.8 cm (rata-rata 12.37 cm), sementara kelompok Daun B berkisar antara 7.9 - 8.8 cm (rata-rata 8.40 cm). Simpangan baku pengukuran dihitung untuk menguji konsistensi teknik ukur pengamat.",
      "Tidak ditemukannya foto spesimen berskala milimeter dikategorikan sebagai defisit bukti kritis tingkat tinggi. Karakter warna tampak (hijau tua vs hijau muda) dan margin daun (rata vs bergerigi) dinilai sebagai data subjektif karena tidak didukung alat bukti pembanding.",
      "Draf tabel hasil audit menyajikan pemisahan tegas antara status data primer (tercatat manual) dan bukti verifikasi eksternal (tidak tersedia/inaktif)."
    ),
    discussion: paragraphs(
      "Berdasarkan analisis data replikasi, kelompok spesimen menunjukkan perbedaan dimensi fisik yang signifikan antara Daun A dan Daun B. Karakter bentuk lonjong pada Daun A dan menjari pada Daun B konsisten muncul pada seluruh replikasi, namun ketiadaan dokumentasi foto menyebabkan sifat-sifat ini tidak dapat diverifikasi secara visual oleh pihak ketiga [Ref: Botany Guide, 2024].",
      "Kekurangan bukti visual berupa foto berskala milimeter menghalangi proses konfirmasi karakter margin daun yang dilaporkan sebagai rata dan bergerigi. Tanpa gambar resolusi tinggi, auditor tidak dapat memastikan apakah terdapat variasi mikro-morfologi tepi daun seperti tipe crenate atau dentate yang sering kali salah diidentifikasi sebagai serrate (bergerigi) oleh pengamat pemula.",
      "Ketidakpastian juga meliputi faktor lingkungan dan biologi sampel. Fluktuasi ukuran panjang tangkai daun (2.1 cm rata-rata pada Daun A; 4.5 cm rata-rata pada Daun B) dapat disebabkan oleh variasi umur daun (ontogeni) atau tingkat paparan sinar matahari pada dahan pohon asal. Ketiadaan data status pohon induk dan posisi tajuk daun yang diamati melemahkan analisis variabilitas biologis.",
      "Dari sisi bibliografi, draf awal tidak memiliki referensi ilmiah yang valid. Upaya mengaitkan deskripsi visual sederhana ini dengan teori botani tanpa rujukan yang dibaca langsung dikategorikan sebagai celah integritas akademik. Penulisan rujukan hanya boleh dilakukan setelah pengguna memverifikasi langsung fisik buku atau jurnal yang bersangkutan [Ref: Flora Kampus, 2025].",
      "Secara statistik, pengamatan dengan ukuran sampel tiga replikasi (n=3) memiliki tingkat keyakinan yang sangat rendah. Ukuran sampel sekecil ini tidak memungkinkan untuk dilakukan uji statistik inferensial seperti uji-t independen untuk membandingkan rata-rata panjang helaian secara valid. Interval kepercayaan (confidence interval) yang dihasilkan akan terlalu lebar, sehingga hipotesis perbedaan morfologi antar populasi tidak dapat diuji secara tepercaya.",
      "Analisis lebih lanjut terhadap rasio panjang-lebar helaian (aspect ratio) menunjukkan bahwa Daun A memiliki rasio rata-rata 2.39 (lonjong/oval), sedangkan Daun B memiliki rasio 0.92 (hampir bulat/oblate). Rasio aspek ini dapat menjadi karakter diagnostik yang stabil untuk analisis taksonomi kuantitatif, asalkan jumlah sampel ditingkatkan minimal sepuluh kali lipat guna menekan bias sampling.",
      "Sebagai kesimpulan audit, data morfologi ini hanya valid sebagai catatan observasi mandiri lokal dan draf bantuan belajar. Draf ini dilarang keras diajukan sebagai tulisan publikasi ilmiah, laporan penelitian final, atau dasar klaim keanekaragaman flora tanpa penambahan spesimen herbarium pembanding dan foto berskala standar."
    ),
    conservationRelevance:
      "Audit ini menekankan pentingnya pengumpulan data biodiversitas yang andal di tingkat lokal. Pengamatan flora kampus yang terdokumentasi dengan baik dapat mendukung audit lingkungan berkelanjutan, asalkan metodologi pengumpulan data bebas dari bias subjektif pengamat.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan: identitas spesies atau famili secara definitif, kesimpulan ekofisiologi tumbuhan kampus, analisis faktor penyebab perbedaan morfologi daun, keabsahan bibliografi ilmiah, dan status konservasi tanaman asal.",
    limitations: [
      "Catatan bukti primer hanya berupa deskripsi tekstual tiruan pengamat.",
      "Ketiadaan total foto orisinal berskala milimeter dari lapangan.",
      "Jumlah replikasi spesimen (n=3) di bawah batas minimum analisis statistik inferensial.",
      "Tidak ada kalibrasi instrumen pengukuran (penggaris tidak disertakan sertifikasi presisi).",
      "Rujukan bibliografi tidak terverifikasi dan source verification sistem dinonaktifkan.",
      "Konteks spasial dan temporal tidak diverifikasi melalui metadata file digital.",
    ],
    futureData: [
      "Voucher herbarium spesimen fisik Daun A dan Daun B yang diserahkan ke laboratorium.",
      "Foto makro tepi daun dan pertulangan daun dengan kamera berskala kalibrasi.",
      "Metadata koordinat GPS dalam format decimal degrees dari lokasi pohon induk.",
      "Daftar referensi berupa jurnal botani bereputasi dengan DOI aktif yang divalidasi.",
    ],
    futureWork: paragraphs(
      "Rencana perbaikan metodologi meliputi penyusunan protokol sampling acak sederhana (simple random sampling) untuk memilih daun yang akan diukur pada pohon induk. Pengamat wajib dilatih menggunakan kartu pembanding warna standar (Munsell Color Chart) untuk meminimalkan bias visual warna daun.",
      "Audit lanjutan harus dijadwalkan setelah pengamat mengunggah file foto ber-GPS yang lolos uji ekstraksi metadata lokal (EXIF parser) untuk membuktikan eksistensi spesimen di lokasi kampus.",
      "Untuk jangka panjang, disarankan untuk mengintegrasikan basis data observasi lokal ini dengan sistem manajemen koleksi berbasis web (seperti Specify atau Symbiota). Ini akan melatih pengamat pemula dalam mematuhi protokol kurasi data spesimen digital, mencakup validasi nama taksonomik, format tanggal ISO 8601, dan standar pemetaan spasial WGS84.",
      "Sebagai langkah validasi silang, pengamat juga disarankan untuk mendepositkan sampel herbarium duplikat di herbarium universitas setempat untuk diverifikasi oleh kurator ahli botani, kemudian mencantumkan nomor registrasi voucher spesimen tersebut dalam laporan final."
    ),
    conclusion: paragraphs(
      "Laporan Evidence Audit menyimpulkan draf morfologi daun kampus V7 memiliki status 'Conditional Go' sebagai sarana belajar lokal. Batas bukti yang sangat ketat telah diidentifikasi dan disajikan secara transparan guna mencegah penarikan kesimpulan ilmiah yang tidak sah.",
      "Dokumen ini dilarang dipublikasikan atau diklaim sebagai karya ilmiah final yang telah tervalidasi akademis tanpa memenuhi seluruh checklist inventarisasi bukti minimum."
    ),
  },
  zephyr: {
    articleCategory: "Polished Academic Article Draft",
    shortCategory: "Academic Article Draft",
    editorialNote:
      "Draft akademik bernarasi halus yang mengutamakan keterbacaan sembari menjaga batas antara deskripsi dan inferensi.",
    abstract: paragraphs(
      "Draf artikel akademik ini memaparkan kajian morfologi komparatif terhadap dua jenis daun yang diamati secara mandiri di area kampus. Deskripsi awal mengelompokkan spesimen ke dalam Daun A (bentuk lonjong, margin rata, warna hijau tua) dan Daun B (bentuk menjari, margin bergerigi, warna hijau muda). Guna mendalami karakteristik fisik helaian secara terstruktur, pengamatan dikembangkan melalui metode replikasi berulang terhadap tiga spesimen daun pada masing-masing kelompok.",
      "Pengukuran dimensi fisik meliputi panjang helaian daun, lebar helaian, dan panjang tangkai daun dilakukan secara manual. Pembahasan disusun dengan gaya naratif yang mengalir halus untuk membandingkan karakteristik luar spesimen, sembari mempertahankan batasan ilmiah yang tegas. Penulisan draf ini secara konsisten menghindari rekayasa data visual maupun sitasi pustaka fiktif demi menjaga integritas karya.",
      "Hasil kajian menunjukkan adanya kontras dimensi fisik dan ciri luar yang konsisten di antara kedua kelompok spesimen. Draf ini disajikan sebagai kerangka bantuan belajar terstruktur yang memerlukan kelengkapan dokumentasi foto lapangan berskala dan validasi referensi lebih lanjut sebelum diajukan dalam forum akademik formal. Gaya penulisan draf ini dirancang untuk membimbing mahasiswa secara komprehensif agar memahami metode analisis data botani dasar.",
      "Secara keseluruhan, draf ini dirancang untuk memberikan landasan pemahaman metodologis yang seimbang antara keterampilan teknis lapangan dan etika pelaporan ilmiah, membina kebiasaan baik dalam menyusun karya tulis ilmiah yang transparan dan akuntabel."
    ),
    introduction: paragraphs(
      "Pengamatan morfologi luar daun merupakan langkah awal yang krusial untuk mempelajari keanekaragaman dan adaptasi tumbuhan di lingkungan sekitar kita [Ref: Botany Guide, 2024]. Karakter fisik helaian daun, seperti bentuk helaian, pola tepi helaian, dan ukuran dimensi daun, mencerminkan interaksi biologis antara tumbuhan dengan faktor lingkungan mikro tempat tumbuhnya. Di lingkungan kampus, studi sederhana ini bernilai penting sebagai sarana pembentukan disiplin ilmiah mahasiswa.",
      "Kajian komparatif ini memanfaatkan spesimen Daun A dan Daun B yang dikumpulkan dari kawasan halaman kampus pada pagi hari. Replikasi pengukuran kuantitatif dilakukan pada tiga sampel untuk masing-masing kelompok guna mendokumentasikan variasi ukuran fisik daun dalam satu populasi lokal.",
      "Tujuan penyusunan draf artikel akademik ini adalah untuk menyajikan hasil pengamatan komparatif morfologi daun secara sistematis dan mudah dipahami. Fokus penulisan diarahkan pada narasi ilmiah yang logis dan transparan, yang secara jelas memisahkan antara deskripsi pengamatan nyata dan analisis literatur pendukung yang valid.",
      "Apresiasi estetika terhadap bentuk dan simetri daun telah lama menjadi pendorong utama perkembangan ilmu botani deskriptif. Transformasi dari sketsa manual abad ke-19 menuju pemodelan morfometrik digital modern mencerminkan kebutuhan akan presisi data. Draf artikel ini berusaha memelihara keindahan deskriptif tersebut dalam kerangka metodologi ilmiah yang tertib.",
      "Secara historis, dokumentasi flora lokal sering kali terhambat oleh keterbatasan akses terhadap pustaka referensi determinasi. Era keterbukaan informasi saat ini memungkinkan integrasi cepat antara catatan observasi mandiri dengan basis data keanekaragaman hayati daring. Meskipun demikian, kehati-hatian dalam memverifikasi kebenaran sitasi referensi primer tetap menjadi pilar utama integritas penulisan.",
      "Kajian ini merajut narasi morfologi vegetatif tersebut dalam bahasa yang mengalir, bertujuan memberikan contoh penulisan draf artikel yang bernilai edukatif sekaligus metodologis bagi para pembaca pemula."
    ),
    literatureReview: paragraphs(
      "Draf laporan akademik ini disusun tanpa disertai referensi eksternal yang diunggah secara formal oleh pengamat. Oleh karena itu, tinjauan pustaka ini memaparkan kerangka acuan penelusuran sumber yang relevan untuk determinasi tumbuhan [Ref: Flora Kampus, 2025].",
      "Kajian morfologi daun kampus membutuhkan landasan teoretis dari literatur botani sistematika untuk mengklasifikasikan istilah bentuk helaian (seperti oval, elips) dan tipe tepi daun secara tepat. Sumber tepercaya berupa buku ajar universitas atau jurnal taksonomi regional direkomendasikan sebagai acuan utama determinasi.",
      "Metode pengukuran daun yang standar juga perlu merujuk pada literatur ekofisiologi tumbuhan untuk memastikan bahwa teknik pengukuran dimensi panjang dan lebar helaian dilakukan secara konsisten. Referensi hanya boleh dicantumkan apabila telah dibaca secara langsung oleh pengamat guna menjamin keaslian sitasi.",
      "Variasi morfologi helaian daun (foliar polymorphism) merupakan topik kajian yang luas dalam ekologi evolusioner. Beberapa teori mengemukakan bahwa margin bergerigi (serrated) berkolerasi dengan peningkatan laju pertukaran gas dan fotosintesis di awal musim semi, sedangkan margin rata (entire) lebih efisien dalam konservasi air pada habitat kering. Menelusuri literatur klasik mengenai adaptasi fungsional helaian daun membantu pengamat memahami makna evolusioner di balik perbedaan Daun A dan B.",
      "Kajian komparatif ini juga memerlukan literatur tentang plastisitas fenotipik untuk menjelaskan bagaimana variasi genotip tunggal dapat menghasilkan bentuk daun yang berbeda akibat cekaman lingkungan mikro. Memahami batasan plastisitas morfologis dari literatur botani terakreditasi mencegah pengamat membuat kesimpulan taksonomik yang tergesa-gesa."
    ),
    methodEmphasis:
      "Untuk mempertahankan alur naratif yang dapat ditelusuri, setiap deskripsi dihubungkan kembali kepada catatan pengguna, sedangkan ruang bagi foto dan pengukuran diperlakukan sebagai tahap dokumentasi berikutnya, bukan sebagai bukti yang telah ada.",
    resultsNarrative: paragraphs(
      "Analisis data kuantitatif menunjukkan bahwa kelompok Daun A memiliki dimensi fisik helaian yang lebih panjang dan ramping (panjang rata-rata 12.37 cm; lebar rata-rata 5.17 cm) dengan tangkai daun yang relatif pendek (rata-rata 2.07 cm). Sebaliknya, kelompok Daun B memiliki helaian lebar menjari dengan panjang rata-rata 8.40 cm, lebar rata-rata 9.17 cm, dan tangkai daun yang lebih panjang (rata-rata 4.47 cm).",
      "Karakter luar visual menunjukkan kontras yang konsisten pada seluruh sampel replikasi. Daun A selalu hadir dengan bentuk lonjong dan margin rata, sedangkan Daun B selalu menunjukkan bentuk menjari dengan margin bergerigi kasar.",
      "Tabel perbandingan visual dan statistik kuantitatif disajikan dalam naskah untuk memperjelas pola variasi fisik antar-spesimen."
    ),
    discussion: paragraphs(
      "Kajian komparatif terhadap kelompok spesimen mengungkapkan perbedaan morfologi yang konsisten dan kontras antara Daun A dan Daun B. Karakter helaian lonjong dengan margin rata pada Daun A secara ajek teramati pada seluruh sampel replikasi, mengonfirmasi keseragaman morfologi vegetatif luar dalam kelompok tersebut, yang dibahas secara narasi komparatif [Ref: Botany Guide, 2024].",
      "Sebaliknya, bentuk menjari dengan margin bergerigi secara tegas membedakan Daun B pada replikasi B1, B2, dan B3. Perbedaan bentuk dan tepi daun ini merupakan indikator taksonomi yang berharga, namun klasifikasi tumbuhan yang akurat tidak boleh terburu-buru menyimpulkan identitas spesies tanpa didukung organ generatif seperti bunga atau buah yang menjadi kunci determinasi utama.",
      "Variasi dimensi fisik daun dalam satu kelompok menunjukkan adanya rentang plastisitas fenotipik lokal. Perbedaan panjang helaian antara sampel A1 (12.4 cm) and A2 (11.9 cm) mencerminkan variasi alami yang biasa terjadi pada daun-daun dari pohon induk yang sama, yang dipengaruhi oleh perbedaan usia daun, kecukupan nutrisi, atau intensitas cahaya matahari mikro yang diterima.",
      "Ketiadaan dokumentasi foto berskala milimeter menjadi batasan utama draf ini dalam menyajikan bukti visual yang objektif. Tanpa visualisasi makro tepi helaian, pembaca tidak dapat melakukan pemeriksaan ulang secara mandiri terhadap kebenaran klasifikasi margin daun yang dilaporkan pengamat.",
      "Selain itu, draf laporan ini belum dilengkapi referensi ilmiah eksternal verifikasi. Untuk meningkatkan kualitas draf menjadi artikel ilmiah yang layak, pengamat wajib menelusuri pustaka taksonomi resmi, membaca isi dokumennya secara langsung, dan menyitirnya secara bertanggung jawab sesuai kaidah penulisan ilmiah [Ref: Flora Kampus, 2025].",
      "Menilik lebih jauh aspek morfogenesis, pembentukan daun menjari (palmate) melibatkan pola pembelahan meristem lateral yang berbeda dari daun lonjong (ovate). Pola pertulangan daun (venation) menjari pada Daun B memfasilitasi distribusi air yang efisien ke seluruh ujung lobus daun, sedangkan pertulangan menyirip (pinnate) pada Daun A menyokong struktur helaian lonjong secara kokoh. Diskusi struktural ini memperkaya perspektif akademis draf naskah.",
      "Hubungan antara tangkai daun (petiole) dan luas helaian juga patut dicermati. Tangkai daun yang panjang pada Daun B (rata-rata 4.47 cm) berfungsi menjauhkan helaian daun dari naungan daun di atasnya (shadow avoidance mechanism), memungkinkannya menangkap cahaya matahari secara optimal di kanopi bawah. Sebaliknya, tangkai pendek Daun A (rata-rata 2.07 cm) menahan helaian dekat dengan ranting untuk stabilitas mekanis terhadap hembusan angin kampus."
    ),
    conservationRelevance:
      "Studi morfologi komparatif vegetasi lokal kampus berperan penting dalam meningkatkan kesadaran sivitas akademika terhadap keanekaragaman hayati sekitar. Upaya inventarisasi mandiri flora kampus dapat menjadi langkah awal yang mendukung pengelolaan lingkungan binaan berkelanjutan.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan: determinasi nama taksonomi spesies secara definitif, kesimpulan ekofisiologi tumbuhan kampus, analisis faktor penyebab morfologi daun, keabsahan bibliografi ilmiah, dan status konservasi tanaman asal.",
    limitations: [
      "Jumlah replikasi sampel daun (n=3 per kelompok) belum mencukupi untuk uji statistik parametrik.",
      "Belum tersedia foto berskala milimeter dari permukaan spesimen daun.",
      "Pengukuran dimensi fisik dilakukan menggunakan alat manual tanpa kalibrasi standar.",
      "Lokasi dan waktu pengamatan hanya berupa catatan umum tanpa penanda GPS.",
      "Tidak ada referensi ilmiah eksternal terverifikasi yang dilampirkan dalam draf.",
    ],
    futureData: [
      "Foto makro permukaan atas dan bawah daun berskala milimeter dengan pencahayaan standar.",
      "Data luas helaian daun (leaf surface area) menggunakan alat leaf area meter.",
      "Koordinat GPS presisi dan deskripsi habitat mikro dari tanaman asal spesimen.",
      "Buku flora regional dan jurnal taksonomi dengan DOI aktif yang dibaca langsung.",
    ],
    futureWork: paragraphs(
      "Studi lanjutan direkomendasikan dengan memperluas jumlah sampel pengamatan menjadi minimal dua puluh helaian daun per kelompok spesimen untuk menghasilkan analisis statistik yang representatif. Penggunaan perangkat lunak analisis citra digital disarankan untuk meningkatkan akurasi pengukuran bentuk helaian daun.",
      "Pengamat juga diharapkan memperkuat kajian dengan menyusun herbarium spesimen (voucher) yang disimpan di laboratorium biologi kampus untuk keperluan verifikasi taksonomi oleh ahli botani.",
      "Program pemetaan biodiversitas digital kampus (campus citizen-science map) dapat diinisiasi dengan mengajak mahasiswa mengunggah pengamatan morfologi ke platform global. Kolaborasi ini memperluas kegunaan praktikum dari sekadar tugas kuliah menjadi kontribusi riil bagi data biodiversitas wilayah.",
      "Terakhir, disarankan pula analisis variasi anatomi internal daun melalui sayatan melintang stoma dan mesofil. Penyelidikan struktur internal ini akan melengkapi pemahaman morfologi luar daun, memberikan gambaran utuh mengenai adaptasi fisiologis vegetasi kampus terhadap polusi udara perkotaan."
    ),
    conclusion: paragraphs(
      "Kajian komparatif morfologi draf V7 ini berhasil menguraikan perbedaan bentuk helaian, tipe tepi, dan warna tampak serta variasi ukuran dimensi fisik Daun A dan Daun B berdasarkan pengamatan replikasi. Alur penulisan akademik yang terstruktur telah diterapkan dengan baik untuk mendukung proses belajar penulisan ilmiah.",
      "Naskah ini tetap berstatus draf bantuan belajar dan memerlukan kelengkapan data visual serta pustaka determinasi tumbuhan tepercaya sebelum diajukan sebagai karya ilmiah final."
    ),
  },
};

export function buildJournalArticle(input: JournalBuildInput, modelId: string): JournalArticle {
  const year = new Date().getFullYear();
  const dateStr =
    input.created_at ||
    new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const normalizedModel = profiles[modelId] ? modelId : "peregrine";
  const profile = profiles[normalizedModel];
  const modelLabels: Record<string, string> = {
    peregrine: "NaLI Peregrine",
    obsidian: "NaLI Obsidian",
    zephyr: "NaLI Zephyr",
  };
  const location = input.location || "Sekitar halaman kampus";

  // V7: use the rich evidence fixture data
  const comparisonTable: ResultRow[] = richEvidenceFixture.groups.map(g => ({
    object: g.name,
    shape: g.shape,
    margin: g.marginType,
    color: g.colorNote,
    source: "Catatan pengguna (local QA fixture)",
    evidenceStatus: "Belum diverifikasi (source verification inactive)"
  }));

  const rawReplicates: LeafReplicate[] = [];
  richEvidenceFixture.groups.forEach(g => {
    g.replicates.forEach(r => {
      rawReplicates.push(r);
    });
  });

  const statsTable = richEvidenceFixture.groups.map(g => ({
    groupName: g.name,
    meanLength: g.stats.meanLength,
    meanWidth: g.stats.meanWidth,
    meanPetiole: g.stats.meanPetiole
  }));

  // V7 conditional reference checking
  const hasUserRefs = typeof input.mainText === "string" && (
    input.mainText.includes("Botany Guide") || 
    input.mainText.includes("Flora Kampus") ||
    input.mainText.includes("references") ||
    input.mainText.includes("referensi")
  );
  const refsToUse = hasUserRefs ? richEvidenceFixture.references : [];

  // Process citations through the citation engine
  const processedIntro = processCitations(profile.introduction, refsToUse);
  const processedLitReview = processCitations(profile.literatureReview, refsToUse);
  const processedDiscussion = processCitations(profile.discussion, refsToUse);

  // Combine bibliography lists from processed citations
  const finalBibliography = processedIntro.bibliography;

  return {
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
      modelLabel: modelLabels[normalizedModel],
      reportType: input.reportTemplate || "Laporan Observasi Lingkungan",
      generatedDate: dateStr,
      documentStatus: "Draft bantuan belajar/penulisan berbasis bukti.",
      sourceVerificationStatus: "Inactive (Source verification belum aktif di MVP ini)",
      publicExportStatus: "Public PDF/DOCX export locked",
      doi: "Not assigned in CP1",
      issn: "Not applicable",
      author: "Generated draft from user-provided materials",
      affiliation: "NaLI Nature & Evidence Journal / CP1 editorial draft",
      articleCategory: profile.articleCategory,
      shortCategory: profile.shortCategory,
      editorialNote: profile.editorialNote,
    },
    infoBlock: {
      category: profile.articleCategory,
      materialBasis: "User-provided descriptive notes [local QA fixture]",
      status: "Draft article",
      handling: "Editorial draft for local QA",
      received: "Not applicable",
      accepted: "Not applicable",
      published: "Not published",
      verificationStatus: "Unverified (not externally verified)",
      exportStatus: "Public export locked",
    },
    abstract: {
      text: profile.abstract,
      keywords: ["morfologi daun", "observasi visual", "praktikum biologi", "bukti pengguna", "kampus", "local QA fixture"],
    },
    introduction: processedIntro.processedText,
    literatureReview: processedLitReview.processedText,
    materialsAndMethods: {
      objectObserved: "Spesimen Daun A dan Daun B sebagaimana dideskripsikan pengguna [local QA fixture]",
      location,
      time: richEvidenceFixture.dateTime,
      method:
        "Komparasi deskriptif karakter visual dan pengukuran manual replikasi sampel tanpa identifikasi spesies eksternal.",
      profileEmphasis: profile.methodEmphasis,
      observationDesign: paragraphs(
        "Unit data pada draf ini adalah enam spesimen daun yang dibagi menjadi dua kelompok (Daun A dan Daun B) dengan masing-masing tiga replikasi. Parameter fisik yang diukur meliputi panjang helaian daun, lebar helaian daun, dan panjang tangkai daun.",
        "Lokasi halaman kampus dan waktu pagi hari dicantumkan sebagai konteks simulasi. Draf ini menegaskan bahwa tidak ada data lapangan eksternal yang diverifikasi secara independen."
      ),
      recordingProtocol: paragraphs(
        "Pengamatan menggunakan penggaris manual plastik. Setiap sampel diberi label pengenal unik (A1-A3, B1-B3) dan dicatat pada lembar pengamatan terstandar untuk meminimalisasi bias pencatatan.",
        "Prosedur ini dirancang untuk mengajarkan dasar pengolahan data kuantitatif replikasi di laboratorium praktikum botani."
      ),
      missingDetails:
        "Foto spesimen makro orisinal, koordinat GPS presisi, kalibrasi instrumen, dan penelusuran basis data referensi terindeks belum tersedia.",
      reproducibility:
        "Keterulangan observasi dibatasi oleh tidak adanya dokumentasi visual orisinal dan ketiadaan herbarium spesimen pembanding.",
    },
    results: {
      comparisonTable,
      narrative: profile.resultsNarrative,
      replicatesTable: rawReplicates,
      statsTable: statsTable
    },
    discussion: processedDiscussion.processedText,
    conservationRelevance: profile.conservationRelevance,
    cannotBeConcluded: profile.cannotBeConcluded,
    evidence: {
      figureCaption: "Figure 1. Reserved visual documentation plate for labelled user evidence.",
      photoSlot: "Foto belum disediakan. Ruang disiapkan untuk dokumentasi pengguna berlabel.",
      measurementSlot: hasUserRefs
        ? "Data kuantitatif disediakan melalui replikasi pengukuran fisik (A1-A3, B1-B3)."
        : "Data kuantitatif belum disediakan. Panjang dan lebar helaian perlu dicatat.",
      locationSlot: `Lokasi umum: ${location} (disampaikan pengguna; belum diverifikasi).`,
      timestampSlot: `Waktu: ${richEvidenceFixture.dateTime} (disampaikan pengguna).`,
      referenceSlot: "No source-verification procedure was applied to these supplied notes.",
      figures: richEvidenceFixture.figures
    },
    limitations: profile.limitations,
    futureDataRequired: profile.futureData,
    futureWork: profile.futureWork,
    conclusion: profile.conclusion,
    annexure: {
      rawInputSummary:
        "Daun A dilaporkan lonjong, bertepi rata, dan hijau tua; Daun B dilaporkan menjari, bertepi bergerigi, dan hijau muda. Replikasi: A1 (12.4x5.2 petiole 2.1), A2 (11.9x4.8 petiole 1.9), A3 (12.8x5.5 petiole 2.2). B1 (8.5x9.2 petiole 4.5), B2 (7.9x8.8 petiole 4.1), B3 (8.8x9.5 petiole 4.8).",
      evidenceTable: [
        {
          id: "M01",
          material_type: "catatan",
          summary: "Daun A: lonjong, tepi rata, warna hijau tua. Replicates: A1, A2, A3.",
          user_provided: true,
          verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
        },
        {
          id: "M02",
          material_type: "catatan",
          summary: "Daun B: menjari, tepi bergerigi, warna hijau muda. Replicates: B1, B2, B3.",
          user_provided: true,
          verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
        },
        {
          id: "M03",
          material_type: "lokasi",
          summary: `${location}; waktu pengamatan dinyatakan pagi hari.`,
          user_provided: true,
          verification_status: "user-supplied-style fixture (not externally verified; source verification inactive)"
        },
      ],
      checklist: [
        "Cocokkan kembali tabel hasil replikasi dengan lembar catatan pengamatan orisinal.",
        "Tambahkan foto berskala milimeter untuk setiap sampel yang terdaftar.",
        "Sertakan koordinat GPS lokasi pengambilan spesimen.",
        "Periksa kembali rujukan literatur taksonomi tumbuhan kampus secara langsung.",
        "Pertahankan pernyataan keterbatasan bukti dalam versi akhir draf laporan.",
      ],
    },
    references: finalBibliography,
  };
}

export function mapJournalArticleToDraftReport(report: DraftReport, article: JournalArticle): DraftReport {
  const tableRows = article.results.comparisonTable
    .map(
      (row) =>
        `| ${row.object} | ${row.shape} | ${row.margin} | ${row.color} | ${row.source} | ${row.evidenceStatus} |`,
    )
    .join("\n");

  const repRows = (article.results.replicatesTable || [])
    .map(
      (r) =>
        `| ${r.id} | ${r.lengthCm} | ${r.widthCm} | ${r.petioleLengthCm} | ${r.shape} | ${r.marginType} | ${r.colorNote} |`,
    )
    .join("\n");

  return {
    ...report,
    title: article.metadata.title,
    executive_summary: [
      article.metadata.articleCategory,
      article.metadata.editorialNote,
      "",
      "Abstrak",
      article.abstract.text,
      "",
      `Keywords: ${article.abstract.keywords.join(", ")}`,
      "",
      article.metadata.documentStatus,
    ].join("\n"),
    background: ["PENDAHULUAN", article.introduction, "TINJAUAN PUSTAKA", article.literatureReview].join("\n\n"),
    objective:
      "Mendokumentasikan perbedaan karakter yang dilaporkan pada Daun A dan Daun B serta merencanakan penguatan bukti tanpa menambah klaim di luar bahan pengguna.",
    method_or_materials: [
      "Bahan dan Metode / MATERIALS AND METHODS",
      `Objek: ${article.materialsAndMethods.objectObserved}.`,
      `Lokasi: ${article.materialsAndMethods.location}.`,
      `Waktu: ${article.materialsAndMethods.time}.`,
      article.materialsAndMethods.method,
      article.materialsAndMethods.profileEmphasis,
      article.materialsAndMethods.observationDesign,
      article.materialsAndMethods.recordingProtocol,
      `Keterbatasan metode: ${article.materialsAndMethods.missingDetails}`,
      `Reproduksibilitas: ${article.materialsAndMethods.reproducibility}`,
    ].join("\n\n"),
    findings: article.results.comparisonTable.map(
      (row) =>
        `${row.object}: bentuk ${row.shape.toLowerCase()}, tepi ${row.margin.toLowerCase()}, warna ${row.color.toLowerCase()} (${row.source}; ${row.evidenceStatus.toLowerCase()}).`,
    ),
    preliminary_analysis: [
      "### Tabel 1. Karakter morfologi visual yang dilaporkan pengguna",
      "| Objek | Bentuk | Tepi | Warna tampak | Sumber | Status |",
      "| --- | --- | --- | --- | --- | --- |",
      tableRows,
      "",
      "### Tabel 2. Data Pengukuran Replikasi Daun (Kuantitatif)",
      "| ID | Panjang (cm) | Lebar (cm) | Tangkai (cm) | Bentuk | Tepi | Warna |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      repRows,
      "",
      article.results.narrative,
    ].join("\n"),
    discussion: [
      "Hasil dan Pembahasan / RESULTS AND DISCUSSION",
      article.discussion,
      "RELEVANSI PENDIDIKAN DAN KONSERVASI",
      article.conservationRelevance,
      "YANG TIDAK DAPAT DISIMPULKAN",
      article.cannotBeConcluded,
      "PEKERJAAN LANJUTAN",
      article.futureWork,
    ].join("\n\n"),
    conclusion: ["Kesimpulan / CONCLUSIONS", article.conclusion].join("\n\n"),
    source_notes: [
      `Figure slot: ${article.evidence.photoSlot}`,
      `Measurement slot: ${article.evidence.measurementSlot}`,
      article.evidence.locationSlot,
      article.evidence.timestampSlot,
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
