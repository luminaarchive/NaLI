import type { DraftReport, EvidenceRow } from "./reportGenerator";
import { PUBLIC_REPORT_DISCLAIMER } from "./reportGenerator";

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
      "Laporan ini menyusun draft artikel praktikum mengenai dua catatan morfologi daun yang diberikan pengguna dari sekitar halaman kampus pada pagi hari. Materi awal menyebut Daun A sebagai daun berbentuk lonjong, bertipe tepi rata, dan berwarna hijau tua; Daun B disebut berbentuk menjari, bertipe tepi bergerigi, dan berwarna hijau muda. Tujuan draft bukan menetapkan nama tumbuhan, melainkan menata observasi sederhana menjadi catatan akademik yang dapat diperiksa ulang.",
      "Pendekatan yang digunakan adalah komparasi deskriptif terhadap karakter yang tertulis di catatan pengguna: bentuk helaian, tepi, dan warna yang tampak. Karena foto, pengukuran panjang-lebar, jumlah ulangan, informasi tanaman asal, serta rujukan pustaka belum disertakan, hasil hanya menyatakan perbedaan deskriptif antara dua objek yang dilaporkan. Tidak ada identifikasi spesies, penjelasan fungsi biologis, atau verifikasi sumber yang dapat diberikan pada tahap ini.",
      "Draft ini menempatkan tabel hasil, slot dokumentasi visual, keterbatasan bukti, dan rencana pengumpulan data sebagai bagian utama pembelajaran. Format tersebut membantu mahasiswa membedakan apa yang benar-benar dicatat dari apa yang masih perlu dibuktikan. Artikel ini adalah bantuan penulisan berbasis bahan pengguna, belum merupakan publikasi, dan harus disempurnakan melalui dokumentasi lapangan serta rujukan yang dipilih dan diperiksa oleh pengguna.",
    ),
    introduction: paragraphs(
      "Pengamatan morfologi daun merupakan latihan awal yang berguna dalam praktikum biologi karena ciri luar mudah diamati tanpa merusak objek. Bentuk helaian, pola tepi, warna tampak, susunan tulang daun, dan hubungan daun dengan tanaman asal lazim dicatat sebagai deskripsi awal. Dalam laporan pembelajaran, mutu hasil tidak ditentukan oleh istilah yang banyak, melainkan oleh pemisahan yang jujur antara observasi, interpretasi, dan data yang belum tersedia.",
      "Materi yang tersedia dalam draft ini terbatas pada dua deskripsi daun dan konteks lokasi umum. Pengguna menyatakan bahwa pengamatan dilakukan di sekitar halaman kampus pada pagi hari. Catatan tersebut cukup untuk membangun tabel perbandingan awal, tetapi belum cukup untuk menyatakan bahwa kedua daun berasal dari spesies tertentu atau bahwa perbedaan warna dan tepi memiliki penyebab tertentu.",
      "Tujuan artikel ini adalah menyajikan catatan tersebut dalam bentuk draft jurnal sederhana untuk kebutuhan pembelajaran: mengorganisasi karakter yang diamati, menguraikan metode pencatatan yang dapat diulang, menandai kekurangan bukti, dan mengarahkan pengumpulan data lanjutan. Karena itu, narasi sengaja menggunakan ungkapan berhati-hati dan tidak mengganti data yang belum diambil dengan asumsi.",
      "Sebagai komunikasi singkat, naskah ini menempatkan keterampilan dasar sebagai tujuan utama: memilih karakter yang sama untuk dua objek, menulis nilai yang benar-benar terlihat, serta menyebutkan bahan yang masih kosong. Format jurnal digunakan untuk melatih disiplin tersebut, bukan untuk memberi kesan bahwa catatan singkat telah menjadi penelitian lengkap.",
    ),
    literatureReview: paragraphs(
      "Tidak ada buku, artikel jurnal, kunci identifikasi, atau sumber daring yang diserahkan bersama catatan pengamatan. Dengan demikian, bagian ini bukan ringkasan pustaka yang sudah diperiksa. Tidak ada sumber yang dinilai dalam draft ini, dan NaLI tidak membuat kutipan atau daftar rujukan untuk mengisi kekosongan tersebut.",
      "Untuk pengembangan laporan, kelompok pustaka pertama yang perlu dicari pengguna adalah pedoman terminologi morfologi daun yang menjelaskan definisi bentuk helaian dan tepi daun. Kelompok kedua adalah panduan praktikum atau flora lokal yang dapat membantu menyusun prosedur pencatatan, tanpa langsung menyamakan deskripsi dua daun ini dengan spesies tertentu. Setiap sumber yang nantinya dipakai perlu dicatat lengkap dan dibaca secara langsung.",
      "Kelompok pustaka ketiga, bila tujuan pembelajaran diperluas, dapat membahas variasi karakter daun dan batas penggunaan ciri vegetatif untuk identifikasi. Sumber tersebut hanya boleh dipakai untuk memberi konteks setelah pengguna memverifikasinya; sumber itu tidak boleh dijadikan alasan untuk menambahkan hasil, nama spesies, atau mekanisme biologis yang tidak diperoleh dari pengamatan.",
      "Catatan pustaka selanjutnya perlu disusun sebagai daftar sumber yang benar-benar dibaca, lengkap dengan bagian yang mendukung definisi atau metode pencatatan. Dengan cara itu, mahasiswa dapat memindahkan artikel dari latihan terminologi menuju laporan yang bertanggung jawab tanpa melompati proses pengumpulan bukti.",
    ),
    methodEmphasis:
      "Dalam format praktikum, protokol dipilih agar dapat dilakukan ulang oleh mahasiswa: dua objek diberi kode, setiap ciri dicatat pada kolom yang sama, dan kekosongan data dibiarkan terbuka sampai pengamatan berikutnya.",
    resultsNarrative: paragraphs(
      "Berdasarkan catatan pengguna, dua objek memiliki kombinasi karakter luar yang berbeda. Daun A dicatat sebagai lonjong, bertepi rata, dan hijau tua. Daun B dicatat sebagai menjari, bertepi bergerigi, dan hijau muda. Perbandingan ini adalah transkripsi terstruktur dari bahan yang diberikan, bukan hasil pemeriksaan gambar atau spesimen oleh NaLI.",
      "Perbedaan paling langsung untuk dilaporkan adalah bentuk dan tepi daun, karena keduanya dicantumkan secara eksplisit. Warna dapat dicatat sebagai warna tampak pada saat pengamatan, tetapi belum dapat dibandingkan secara terukur tanpa foto dengan pencahayaan terkendali atau catatan kondisi pengamatan yang lebih rinci.",
      "Tabel ini karena itu berfungsi sebagai catatan perbandingan awal. Ia membantu pembaca melihat pola informasi yang tersedia sekaligus menunjukkan bidang yang masih kosong: ukuran, gambar, ulangan, dan hubungan dengan tanaman asal.",
    ),
    discussion: paragraphs(
      "Pada tingkat laporan praktikum, hasil tersebut memperlihatkan bagaimana dua daun dapat dibedakan melalui karakter visual yang dipilih secara konsisten. Catatan Daun A dan Daun B menyediakan contoh sederhana untuk melatih penggunaan kolom observasi yang sama pada setiap objek. Perbedaan yang dilaporkan tetap berada pada tingkat deskripsi, sehingga pembaca dapat menelusuri asal setiap pernyataan.",
      "Bentuk lonjong dan bentuk menjari merupakan istilah deskriptif yang perlu disertai foto atau sketsa berlabel apabila artikel dikembangkan. Demikian pula, istilah tepi rata dan tepi bergerigi akan lebih kuat bila dilengkapi tampilan dekat tepi helaian. Tanpa dokumentasi tersebut, pembaca hanya dapat menilai konsistensi penulisan, bukan mengonfirmasi objek.",
      "Warna hijau tua dan hijau muda dapat berbeda karena banyak keadaan yang belum dicatat, termasuk pencahayaan saat pengamatan dan keadaan helaian. Oleh sebab itu, warna dalam tabel ditempatkan sebagai laporan visual pengguna, bukan sebagai indikator kondisi tumbuhan. Draft ini tidak menarik kesimpulan fisiologis dari perbedaan warna.",
      "Kekuatan draft adalah ketegasan batasnya: dua catatan dapat dibandingkan, sementara identitas spesies, variasi dalam satu tanaman, dan makna ekologis belum dapat dijawab. Penambahan foto, ukuran, pengulangan sampel, dan rujukan yang diperiksa akan mengubah artikel dari latihan pencatatan menjadi laporan observasi yang lebih dapat ditelaah.",
      "Bagi laporan pembelajaran, penyajian hasil yang baik tidak harus memaksakan hasil besar. Tabel, keterangan gambar yang belum terisi, dan daftar pekerjaan lanjutan sudah membentuk alur ilmiah yang berguna apabila seluruhnya berangkat dari bahan pengguna dan dibaca sebagai draft.",
      "Kualitas artikel selanjutnya dapat meningkat melalui satu sesi pengamatan ulang yang terdokumentasi. Foto berskala dan ukuran dasar memungkinkan uraian menjadi lebih presisi, sedangkan sumber terminologi yang dipilih pengguna memungkinkan istilah morfologi diperiksa sebelum naskah disunting akhir.",
    ),
    conservationRelevance:
      "Dalam orientasi praktikum dan pendidikan lingkungan, kebiasaan merekam ciri tumbuhan secara tertib membantu mahasiswa membangun perhatian terhadap keragaman vegetasi di ruang kampus. Relevansinya bersifat pendidikan: data yang baik dapat mendukung inventarisasi belajar pada masa depan, tetapi dua catatan ini sendiri belum menjadi dasar rekomendasi konservasi atau pengelolaan kawasan.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan dari bahan ini: nama spesies kedua daun, hubungan keduanya dengan tanaman asal, penyebab perbedaan warna, fungsi tepi atau bentuk daun, frekuensi kemunculan di kampus, dan status konservasi apa pun.",
    limitations: [
      "Hanya dua deskripsi objek yang tersedia dan tidak ada ulangan pengamatan.",
      "Foto, sketsa, atau spesimen rujukan belum diberikan.",
      "Panjang, lebar, tulang daun, tangkai, dan tekstur belum diukur atau dicatat.",
      "Lokasi dan waktu hanya berupa catatan umum pengguna serta belum diverifikasi.",
      "Tidak ada referensi yang diserahkan dan source verification belum aktif.",
    ],
    futureData: [
      "Foto keseluruhan dan foto dekat tepi setiap daun dengan label objek.",
      "Panjang dan lebar helaian, panjang tangkai, serta catatan tulang daun.",
      "Jumlah daun yang diamati per tanaman dan penanda tanaman asal.",
      "Tanggal, waktu, kondisi cahaya, serta lokasi umum yang konsisten.",
      "Sumber morfologi atau flora lokal yang dibaca dan dicatat pengguna.",
    ],
    futureWork: paragraphs(
      "Tahap berikutnya adalah membuat lembar pengamatan yang sama untuk beberapa daun dari tanaman asal yang jelas, kemudian memotret dan mengukur setiap objek. Cara ini memungkinkan pengguna memeriksa apakah ciri yang dicatat konsisten atau hanya tampak pada satu helaian.",
      "Setelah data dasar terkumpul, pengguna dapat memilih sumber terminologi morfologi dan, bila diperlukan, panduan identifikasi lokal yang benar-benar diperiksa. Referensi baru dicantumkan setelah dipilih oleh pengguna dan dihubungkan secara wajar dengan data yang ada.",
    ),
    conclusion: paragraphs(
      "Dua catatan pengguna menunjukkan perbedaan deskriptif pada bentuk, tepi, dan warna tampak daun. Draft ini menyediakan struktur komunikasi praktikum yang lengkap untuk mengelola hasil tersebut sekaligus menandai bukti yang belum ada. Kesimpulan hanya berlaku pada karakter yang dicatat.",
      "Nilai utama naskah adalah alur kerjanya: mengamati, membandingkan, melabeli batas bukti, lalu merencanakan perbaikan. Dokumentasi visual, pengukuran, pengulangan, dan rujukan yang diperiksa pengguna tetap diperlukan sebelum pembahasan dapat diperluas.",
    ),
  },
  obsidian: {
    articleCategory: "Evidence Audit Article",
    shortCategory: "Evidence Audit",
    editorialNote:
      "Audit bukti dengan penekanan metode, kecukupan data, keterulangan, dan batas tegas atas hal yang tidak dapat disimpulkan.",
    abstract: paragraphs(
      "Draft artikel ini mengevaluasi batas bukti pada catatan pengamatan morfologi dua objek daun dari sekitar halaman kampus pada pagi hari. Bahan pengguna menyatakan Daun A berbentuk lonjong, bertepi rata, dan tampak hijau tua; Daun B berbentuk menjari, bertepi bergerigi, dan tampak hijau muda. Unit analisis adalah dua deskripsi tertulis, bukan dua spesimen yang telah diperiksa secara independen. Ketiadaan bukti foto, ukuran, dan pencatatan tanaman asal menjadi batas utama.",
      "Metode yang dapat dipertanggungjawabkan pada bahan tersebut adalah ekstraksi karakter eksplisit dan penyusunan matriks perbandingan deskriptif. Draft memisahkan karakter yang dilaporkan, data yang hilang, dan pertanyaan yang belum dapat dijawab. Tidak terdapat dasar untuk menetapkan takson, menyatakan dua daun mewakili populasi, menilai kondisi tumbuhan, atau menjelaskan penyebab bentuk, tepi, dan warna. Tidak terdapat rujukan yang diserahkan pengguna, dan verifikasi sumber tidak aktif.",
      "Hasil yang sah terbatas pada perbedaan tiga karakter tertulis antara objek A dan B. Ketiadaan bukti foto dan instrumen pengukuran mencegah pemeriksaan ulang terhadap deskripsi maupun analisis kuantitatif. Artikel ini menawarkan protokol pengumpulan lanjutan, daftar bukti minimum, dan pernyataan yang tidak dapat disimpulkan sebagai kendali mutu akademik. Dokumen tetap merupakan draft bantuan penulisan berdasarkan bahan pengguna dan bukan artikel yang dipublikasikan atau diverifikasi.",
    ),
    introduction: paragraphs(
      "Deskripsi morfologi daun dapat menjadi data awal yang berguna apabila objek, unit sampel, cara pencatatan, dan batas klaim dinyatakan secara terbuka. Dalam konteks akademik, kekeliruan yang sering terjadi bukan sekadar salah istilah, melainkan perubahan pengamatan terbatas menjadi klaim identifikasi atau penjelasan sebab akibat tanpa bukti yang cukup. Draft ini mengambil posisi konservatif terhadap risiko tersebut.",
      "Bahan dasar artikel terdiri dari dua pernyataan pengguna mengenai bentuk, tepi, dan warna tampak daun, disertai konteks lokasi umum dan waktu pagi. Tidak disediakan foto, ukuran, jumlah helaian yang diamati, tanaman sumber, tanggal, atau daftar referensi. Akibatnya, istilah objek A dan B dipertahankan dan tidak diganti dengan nama takson.",
      "Pertanyaan kerja yang dapat dijawab adalah: karakter apa yang secara eksplisit dilaporkan berbeda antara objek A dan B, bagaimana catatan itu ditampilkan agar dapat diaudit, serta data tambahan apa yang dibutuhkan untuk observasi yang dapat diulang. Pertanyaan mengenai identitas, fungsi, adaptasi, dan relevansi konservasi spesifik berada di luar bukti saat ini.",
      "Dengan membangun artikel di sekitar audit bukti, draft ini bertujuan menjadi contoh laporan yang ketat: temuan dipisahkan dari inferensi, data hilang terlihat jelas, dan rencana lanjutan dirumuskan tanpa mengisi kekosongan dengan angka, foto, kutipan, atau kepastian yang tidak diberikan.",
    ),
    literatureReview: paragraphs(
      "Tidak ada referensi yang diserahkan pengguna atau dinilai untuk draft ini. Karena itu, bagian tinjauan tidak menyatakan telah menelaah karya tertentu serta tidak menambahkan nama penulis, tahun, DOI, atau penerbit. Pernyataan konseptual berikut berfungsi sebagai peta kebutuhan pustaka, bukan hasil verifikasi bibliografis.",
      "Literatur minimum yang perlu dihimpun adalah sumber terminologi botani yang mendefinisikan bentuk helaian, tipe tepi, tulang daun, pangkal, ujung, dan tangkai. Sumber tersebut diperlukan agar istilah lapangan digunakan konsisten dan dapat dibandingkan dengan foto serta ukuran. Sumber harus dipilih oleh pengguna dari perpustakaan, dosen, atau pangkalan yang dapat diperiksa.",
      "Literatur berikutnya adalah panduan metode praktikum yang menjelaskan unit sampel, pengulangan, dokumentasi visual, serta cara menyimpan lembar data. Tanpa desain pencatatan yang memadai, penambahan teori tidak meningkatkan reliabilitas observasi. Jika identifikasi menjadi tujuan lanjutan, pengguna memerlukan kunci atau flora yang relevan serta karakter tambahan dari tanaman asal.",
      "Sumber mengenai hubungan karakter daun dengan lingkungan hanya relevan setelah bukti observasional dan konteks pengambilan sampel diperkuat. Pada draft ini, sumber semacam itu tidak boleh dipakai untuk menyimpulkan sebab perbedaan dua catatan karena tidak ada pengukuran lingkungan maupun verifikasi objek.",
    ),
    methodEmphasis:
      "Sebagai artikel audit bukti, metode menilai kecukupan setiap jenis bahan secara terpisah: catatan deskriptif mendukung transkripsi karakter, sedangkan foto, skala, ulangan, tanaman asal, dan sumber yang dibaca diperlukan sebelum pemeriksaan ulang atau interpretasi diperluas.",
    resultsNarrative: paragraphs(
      "Matriks hasil hanya memuat tiga atribut yang eksplisit dalam bahan pengguna. Daun A dilaporkan memiliki bentuk lonjong, tepi rata, dan warna hijau tua. Daun B dilaporkan memiliki bentuk menjari, tepi bergerigi, dan warna hijau muda. Seluruh sel diberi status belum diverifikasi karena tidak ada dokumentasi pembanding yang diserahkan.",
      "Data tidak mencakup ukuran, jumlah sampel, keterkaitan dua daun dengan tanaman yang sama atau berbeda, maupun karakter diagnostik lain. Oleh sebab itu, tabel tidak boleh dibaca sebagai daftar sifat suatu spesies, statistik variasi, atau hasil identifikasi.",
      "Kualitas evidensial saat ini adalah catatan deskriptif awal. Untuk meningkatkan keterulangan, setiap baris perlu dihubungkan ke foto berlabel, pengukuran, kode tanaman asal, dan informasi pengambilan yang konsisten.",
    ),
    discussion: paragraphs(
      "Perbandingan memperlihatkan bahwa catatan pengguna membedakan objek melalui tiga karakter kasatmata. Perbedaan tersebut dapat dinyatakan secara tekstual karena memang terdapat dalam bahan masukan. Namun, ketepatan penggunaan istilah morfologi belum dapat diaudit tanpa visual atau spesimen rujukan yang memperlihatkan helaian lengkap dan bagian tepinya.",
      "Ukuran sampel tidak dapat dianggap dua dalam pengertian penelitian, karena yang diterima sistem adalah dua deskripsi, bukan protokol sampling yang terdokumentasi. Bahkan bila dua daun benar diamati, tanpa keterangan tanaman asal dan pengulangan tidak tersedia dasar untuk menilai variasi antarindividu atau konsistensi karakter.",
      "Warna tampak merupakan variabel yang rentan dipengaruhi keadaan perekaman. Karena tidak ada foto standar, pencahayaan, atau catatan keadaan daun, warna hanya dicatat sebagai pernyataan pengguna. Penjelasan fisiologis, kesehatan tanaman, atau kondisi habitat tidak dapat diturunkan dari pernyataan warna itu.",
      "Bentuk dan tepi daun kadang digunakan bersama karakter lain dalam proses identifikasi, tetapi bahan ini tidak menyertakan karakter tambahan maupun kunci yang diperiksa. Menamai spesies berdasarkan dua baris pengamatan akan melewati bukti yang ada. Draft ini secara sengaja menolak langkah tersebut.",
      "Tidak adanya referensi berarti pembahasan tidak dapat mengaitkan objek dengan literatur tertentu. Ini bukan kekurangan yang perlu disembunyikan dengan kutipan generatif; justru merupakan temuan audit yang memandu pekerjaan pengguna selanjutnya, yaitu mengumpulkan sumber nyata dan mencatat penggunaannya secara transparan.",
      "Dengan demikian, keluaran ilmiah yang defensible adalah sebuah catatan komparatif awal dengan daftar kebutuhan bukti. Struktur artikel menyediakan tempat bagi data baru, tetapi tidak menaikkan tingkat kepastian sebelum foto, ukuran, desain sampling, dan sumber yang diperiksa tersedia.",
    ),
    conservationRelevance:
      "Pencatatan morfologi yang akurat dapat menjadi keterampilan dasar untuk kegiatan pendidikan biodiversitas. Akan tetapi, dua deskripsi tanpa identitas, kelimpahan, atau konteks habitat tidak mendukung keputusan konservasi, daftar keanekaragaman, maupun penilaian kondisi vegetasi kampus. Relevansi saat ini terbatas pada pembentukan disiplin dokumentasi.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan: identitas spesies atau famili; bahwa kedua daun berasal dari individu yang berbeda; penyebab warna; fungsi atau adaptasi bentuk dan tepi; nilai biodiversitas lokasi; status konservasi; maupun rekomendasi pengelolaan lapangan.",
    limitations: [
      "Unit bukti yang tersedia adalah dua deskripsi tertulis, bukan spesimen yang diperiksa NaLI.",
      "Tidak ada foto, sketsa berskala, voucher, atau kode tanaman asal.",
      "Tidak ada ukuran, ulangan, protokol pemilihan daun, tanggal, atau kondisi pengamatan rinci.",
      "Lokasi umum dan waktu merupakan informasi pengguna yang belum diverifikasi.",
      "Tidak ada sumber diserahkan; verifikasi sumber tidak aktif dan tidak ada referensi yang dapat diaudit.",
      "Tidak ada dasar untuk identifikasi spesies atau interpretasi fungsional.",
    ],
    futureData: [
      "Foto helaian utuh bagian atas dan bawah serta close-up tepi dengan label objek.",
      "Ukuran panjang/lebar, tangkai, pangkal, ujung, pertulangan, tekstur, dan catatan kerusakan.",
      "Kode tanaman asal, jumlah daun per tanaman, kriteria pemilihan, dan pengulangan.",
      "Tanggal, waktu, kondisi cahaya, serta lokasi umum yang tidak mengekspos data sensitif.",
      "Daftar sumber terminologi/metode yang pengguna periksa langsung.",
      "Catatan tegas apabila identifikasi tidak dilakukan atau masih tentatif setelah data tambahan.",
    ],
    futureWork: paragraphs(
      "Pengambilan data lanjutan sebaiknya menggunakan lembar kode objek yang menghubungkan setiap daun dengan tanaman asal dan foto. Pengguna dapat menetapkan karakter yang sama untuk setiap objek, mengambil beberapa ulangan, dan mencatat keterbatasan pencahayaan maupun kerusakan helaian.",
      "Sesudah dokumentasi primer tersedia, pengguna dapat memeriksa sumber terminologi dan panduan lokal yang sesuai. Bila identifikasi diupayakan, hasilnya perlu dinyatakan sebagai proses terpisah yang membutuhkan karakter diagnostik memadai dan pemeriksaan manusia, bukan sebagai konsekuensi otomatis dari tabel awal ini.",
    ),
    conclusion: paragraphs(
      "Satu-satunya hasil yang dapat dipertahankan adalah bahwa catatan pengguna melaporkan perbedaan bentuk, tepi, dan warna tampak antara objek Daun A dan Daun B. Artikel ini menyusun batas klaim, tabel audit, dan kebutuhan bukti untuk melanjutkan pengamatan secara lebih tertib.",
      "Tidak ada identifikasi, sumber terverifikasi, atau kesimpulan biologis lanjutan yang dapat diberikan dari bahan saat ini. Keputusan ilmiah yang paling bertanggung jawab adalah mempertahankan keluaran sebagai audit awal sampai dokumentasi visual, desain pengamatan, pengukuran, dan sumber terpilih benar-benar tersedia.",
    ),
  },
  zephyr: {
    articleCategory: "Polished Academic Article Draft",
    shortCategory: "Academic Article Draft",
    editorialNote:
      "Draft akademik bernarasi halus yang mengutamakan keterbacaan sembari menjaga batas antara deskripsi dan inferensi.",
    abstract: paragraphs(
      "Laporan pengamatan mandiri ini menyajikan sebuah draft artikel akademik mengenai variasi morfologi dua daun yang dicatat di sekitar halaman kampus pada pagi hari. Catatan pengguna menggambarkan Daun A sebagai helaian lonjong dengan tepi rata dan warna hijau tua, sedangkan Daun B sebagai helaian menjari dengan tepi bergerigi dan warna hijau muda. Dari bahan kecil ini, artikel tidak berusaha menamai tumbuhan; ia mengembangkan cara yang jernih untuk membaca perbedaan yang tampak.",
      "Draft disusun melalui perbandingan deskriptif atas karakter yang benar-benar tersedia, dilanjutkan dengan penataan ruang bagi bukti yang belum dikumpulkan: foto, ukuran, hubungan dengan tanaman asal, ulangan, dan sumber pustaka yang dapat diperiksa. Hasil menunjukkan kontras tertulis dalam bentuk, tepi, dan warna tampak. Karena catatan belum disertai dokumentasi visual atau pengukuran, kontras tersebut adalah titik awal observasi, bukan dasar bagi interpretasi taksonomi atau ekologis.",
      "Dengan gaya naratif yang tetap berhati-hati, artikel menempatkan observasi sederhana dalam proses pembelajaran yang lebih matang: memperjelas metode, membangun tabel hasil yang dapat ditelusuri, memisahkan batas interpretasi, dan menyusun rencana kerja lanjutan. Tidak ada sitasi, DOI, ISSN, identitas spesies, atau klaim verifikasi yang diciptakan. Naskah ini tetap draft bantuan belajar berdasarkan materi pengguna dan memerlukan pemeriksaan serta pengayaan bukti sebelum dapat digunakan di luar konteks penulisan awal.",
    ),
    introduction: paragraphs(
      "Sebuah daun sering menjadi pintu masuk pertama untuk mengamati keragaman tumbuhan: permukaannya dekat, bentuknya dapat dibandingkan, dan keterbatasan pengamatan dapat segera dikenali. Di lingkungan kampus, latihan semacam ini bernilai bukan karena segera menghasilkan identifikasi, melainkan karena mengajarkan cara melihat dengan tertib, menulis dengan hati-hati, dan menyimpan pertanyaan yang belum terjawab.",
      "Bahan artikel ini sederhana namun jelas. Pengguna menyampaikan dua deskripsi: Daun A tampak lonjong, bertepi rata, dan hijau tua; Daun B tampak menjari, bertepi bergerigi, dan hijau muda. Lokasi dinyatakan secara umum sebagai halaman kampus dan waktu sebagai pagi hari. Tidak ada foto, ukuran, atau nama tanaman asal yang menyertai catatan.",
      "Keadaan tersebut memberi arah pada naskah. Artikel dapat mengolah perbedaan yang tertulis menjadi paparan yang rapi, tetapi tidak boleh mengubah kerapian bahasa menjadi kepastian ilmiah yang belum didukung. Setiap klaim dalam hasil karena itu kembali pada catatan pengguna, sedangkan kemungkinan penjelasan biologis dibiarkan sebagai pertanyaan untuk data berikutnya.",
      "Tujuan draft ini adalah menawarkan narasi artikel yang enak dibaca sekaligus transparan: memperkenalkan pengamatan, menjelaskan metode sederhana yang dapat diperbaiki, menampilkan hasil secara elegan, dan menutup dengan agenda bukti yang dapat dikerjakan mahasiswa pada sesi lapangan berikutnya.",
    ),
    literatureReview: paragraphs(
      "Naskah ini belum disertai sumber pustaka yang dipilih pengguna. Karena tidak ada sumber yang dinilai dalam draft ini, NaLI tidak menyisipkan referensi yang tampak meyakinkan namun tidak dapat dilacak. Bagian literatur dibangun sebagai arah pembacaan yang diperlukan untuk mengubah catatan awal menjadi pembahasan yang bertumpu pada sumber nyata.",
      "Pertama, pengguna perlu mencari sumber terminologi morfologi daun untuk memastikan bahwa istilah bentuk dan tepi dipakai secara konsisten dengan foto objek. Sumber semacam itu akan membantu menjelaskan apa yang dilihat, bukan menentukan spesies secara otomatis. Kedua, pedoman praktikum diperlukan untuk menyusun pengukuran, pengulangan, dan dokumentasi visual yang rapi.",
      "Jika studi kelak berkembang menuju identifikasi, pengguna dapat memilih panduan flora atau kunci yang relevan dengan lokasi dan materi tanaman yang tersedia. Tahap itu menuntut karakter lebih lengkap daripada tiga ciri dalam catatan sekarang. Literatur lingkungan atau konservasi baru bermakna setelah objek dan konteks observasinya jelas.",
      "Dengan susunan tersebut, tinjauan pustaka bukan hiasan akademik. Ia menjadi daftar pekerjaan ilmiah yang dapat diaudit: sumber harus ditemukan, dibaca, dikaitkan secara tepat dengan data, dan dicantumkan hanya ketika benar-benar digunakan.",
    ),
    methodEmphasis:
      "Untuk mempertahankan alur naratif yang dapat ditelusuri, setiap deskripsi dihubungkan kembali kepada catatan pengguna, sedangkan ruang bagi foto dan pengukuran diperlakukan sebagai tahap dokumentasi berikutnya, bukan sebagai bukti yang telah ada.",
    resultsNarrative: paragraphs(
      "Tabel hasil merangkum jejak observasi paling langsung. Pada Daun A, pengguna mencatat bentuk lonjong, tepi rata, dan warna hijau tua. Pada Daun B, pengguna mencatat bentuk menjari, tepi bergerigi, dan warna hijau muda. Ketiga pasangan karakter itu menghasilkan kontras deskriptif yang mudah diikuti pembaca.",
      "Kontras tersebut belum mempunyai skala numerik atau dokumentasi visual pendamping. Warna adalah warna tampak menurut catatan, sementara bentuk dan tepi belum dapat ditinjau ulang melalui gambar. Oleh karena itu, tabel dibaca sebagai indeks bahan lapangan yang menunggu penguatan, bukan sebagai tabel identifikasi.",
      "Kehadiran slot gambar dan pengukuran di samping tabel mengubah kekurangan menjadi rencana kerja: pembaca mengetahui bukti apa yang akan menguatkan deskripsi serta apa yang tidak boleh diasumsikan sebelum bukti itu tersedia.",
    ),
    discussion: paragraphs(
      "Dua baris catatan ini menghasilkan narasi kecil tentang perbedaan yang terlihat di ruang kampus. Daun A dan Daun B tidak perlu dipaksa menjadi contoh dua spesies agar pengamatan berguna; pada tahap awal, nilai akademiknya terletak pada ketelitian membandingkan karakter yang sama pada objek yang berbeda.",
      "Bentuk helaian menawarkan pusat perhatian yang kuat bagi pembaca. Namun, tanpa foto keseluruhan, istilah lonjong dan menjari hanya dapat diterima sebagai pencatatan pengguna. Penambahan gambar dengan label dan skala akan memungkinkan pembaca mengevaluasi apakah bentuk telah dijelaskan secara tepat dan konsisten.",
      "Tepi daun memberikan karakter pembanding kedua. Foto dekat tepi dibutuhkan agar kata rata dan bergerigi tidak sekadar menjadi label, tetapi dapat ditelusuri kembali ke bukti visual. Pendekatan ini membuat artikel lebih kuat tanpa menambahkan klaim di luar pengamatan.",
      "Warna melengkapi deskripsi, namun tidak membuka jalan singkat menuju kesimpulan mengenai kondisi tumbuhan. Warna tampak dapat berubah dalam pencatatan visual dan tidak diukur dalam bahan ini. Karena itu, pembahasan hanya memelihara warna sebagai bagian dari deskripsi asli serta menyarankan dokumentasi yang lebih konsisten.",
      "Tidak adanya referensi justru memperjelas tahap naskah: tulisan ini belum menempatkan hasil terhadap kajian terdahulu. Langkah yang lebih jujur adalah menyediakan peta pencarian literatur dan menunggu sumber yang benar-benar dibaca pengguna. Sesudah itu, narasi dapat berkembang tanpa mengorbankan jejak bukti.",
      "Pada akhirnya, artikel ini bergerak dari pengamatan sederhana menuju praktik akademik yang lebih baik. Ia menawarkan alur yang halus - mencatat, membandingkan, mengakui batas, lalu merencanakan penguatan - seraya menahan diri dari identitas spesies, sebab biologis, atau klaim konservasi yang belum tersedia.",
    ),
    conservationRelevance:
      "Ruang hijau kampus dapat menjadi ruang belajar yang menumbuhkan perhatian pada keragaman bentuk tumbuhan di sekitar mahasiswa. Relevansi artikel ini terletak pada pendidikan pengamatan dan dokumentasi, bukan pada penilaian ekologis lokasi. Catatan yang diperbaiki kelak dapat mendukung kegiatan belajar yang lebih kaya, selama setiap perluasan tetap disandarkan pada bukti.",
    cannotBeConcluded:
      "Tidak dapat disimpulkan dari draft ini: spesies atau famili, alasan biologis bagi perbedaan bentuk atau warna, kondisi kesehatan tumbuhan, kelimpahan di kampus, nilai konservasi lokasi, ataupun hasil verifikasi sumber.",
    limitations: [
      "Catatan berisi dua objek dan tiga karakter tanpa ulangan.",
      "Belum tersedia foto, skala, ukuran, atau informasi tanaman asal.",
      "Warna tampak tidak didukung catatan pencahayaan atau dokumentasi visual.",
      "Lokasi dan waktu masih berupa informasi umum dari pengguna.",
      "Tidak ada pustaka yang diserahkan dan verifikasi sumber belum aktif.",
    ],
    futureData: [
      "Seri foto berlabel: helaian utuh, permukaan bawah, tepi, pangkal, dan ujung.",
      "Ukuran helaian dan tangkai serta catatan pola tulang daun.",
      "Kode tanaman asal dan beberapa ulangan daun untuk setiap kelompok.",
      "Catatan tanggal, kondisi cahaya, dan konteks lokasi umum.",
      "Sumber terminologi dan metode yang telah dibaca serta dipilih pengguna.",
    ],
    futureWork: paragraphs(
      "Pengamatan lanjutan dapat dirancang sebagai kunjungan singkat yang konsisten: memilih objek dengan kode, membuat foto berskala, menulis ukuran, dan mencatat hubungan dengan tanaman asal. Hasil baru kemudian dapat dimasukkan ke tabel yang sama sehingga perubahan naskah terlihat sebagai penambahan bukti, bukan penggantian cerita.",
      "Setelah lembar data lebih lengkap, pengguna dapat menulis tinjauan pustaka berbasis sumber yang telah diperiksa. Dengan demikian, draft berkembang menjadi artikel pembelajaran yang lebih kaya secara narasi dan lebih kuat secara pertanggungjawaban bukti.",
    ),
    conclusion: paragraphs(
      "Catatan pengguna memberi dasar yang jujur untuk menyatakan bahwa Daun A dan Daun B dilaporkan berbeda dalam bentuk, tepi, dan warna tampak. Artikel ini memperhalus catatan tersebut menjadi draft jurnal yang tertata, namun tetap menjaga ruang antara deskripsi dan kesimpulan yang belum dapat dibuktikan.",
      "Pengembangan naskah berikutnya bergantung pada bahan yang nyata: foto berlabel, pengukuran, ulangan, dan pustaka yang diperiksa oleh pengguna. Dengan penambahan itu, sebuah pengamatan sederhana dapat memperoleh kedalaman akademik tanpa kehilangan kejujuran asal datanya.",
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
  const comparisonTable: ResultRow[] = [
    {
      object: "Daun A",
      shape: "Lonjong",
      margin: "Rata",
      color: "Hijau tua",
      source: "Catatan pengguna",
      evidenceStatus: "Belum diverifikasi",
    },
    {
      object: "Daun B",
      shape: "Menjari",
      margin: "Bergerigi",
      color: "Hijau muda",
      source: "Catatan pengguna",
      evidenceStatus: "Belum diverifikasi",
    },
  ];

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
      sourceVerificationStatus: "Inactive",
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
      materialBasis: "User-provided descriptive notes",
      status: "Draft article",
      handling: "Editorial draft for local QA",
      received: "Not applicable",
      accepted: "Not applicable",
      published: "Not published",
      verificationStatus: "Unverified",
      exportStatus: "Public export locked",
    },
    abstract: {
      text: profile.abstract,
      keywords: ["morfologi daun", "observasi visual", "praktikum biologi", "bukti pengguna", "kampus"],
    },
    introduction: profile.introduction,
    literatureReview: profile.literatureReview,
    materialsAndMethods: {
      objectObserved: "Spesimen Daun A dan Daun B sebagaimana dideskripsikan pengguna",
      location,
      time: "Pagi hari (catatan pengguna; tanggal tidak diberikan)",
      method:
        "Komparasi deskriptif karakter visual yang dinyatakan pengguna tanpa identifikasi spesies atau verifikasi eksternal.",
      profileEmphasis: profile.methodEmphasis,
      observationDesign: paragraphs(
        "Unit data pada draft ini adalah dua catatan objek. Setiap karakter yang tersedia dipindahkan ke tabel secara eksplisit: bentuk helaian, tipe tepi, dan warna tampak. Nilai yang tidak diberikan tidak dilengkapi melalui perkiraan.",
        "Lokasi dan waktu dicantumkan sebagai konteks dari pengguna. Tidak ada klaim bahwa NaLI melihat objek, menerima unggahan, atau memeriksa keadaan lapangan.",
      ),
      recordingProtocol: paragraphs(
        "Pengamatan lanjutan yang dianjurkan menggunakan kode objek, foto helaian utuh dan tepi, skala ukuran, serta satu lembar karakter yang sama untuk seluruh sampel. Pengguna perlu mempertahankan hubungan setiap foto dengan tanaman asal jika tersedia.",
        "Data baru sebaiknya mencatat tanggal, waktu, kondisi cahaya, lokasi umum, panjang dan lebar helaian, tangkai, pertulangan, serta karakter lain yang benar-benar tampak. Semua interpretasi dipisahkan dari catatan primer.",
      ),
      missingDetails:
        "Foto, ukuran, ulangan, tanggal, kondisi cahaya, karakter tambahan, tanaman asal, dan referensi terpilih belum tersedia.",
      reproducibility:
        "Pengulangan belum dapat dilakukan dari catatan ini saja; replikasi membutuhkan protokol, dokumentasi, dan lembar data tambahan.",
    },
    results: {
      comparisonTable,
      narrative: profile.resultsNarrative,
    },
    discussion: profile.discussion,
    conservationRelevance: profile.conservationRelevance,
    cannotBeConcluded: profile.cannotBeConcluded,
    evidence: {
      figureCaption: "Figure 1. Reserved visual documentation plate for labelled user evidence.",
      photoSlot: "Foto belum disediakan. Ruang disiapkan untuk dokumentasi pengguna berlabel.",
      measurementSlot: "Data kuantitatif belum disediakan. Panjang dan lebar helaian perlu dicatat.",
      locationSlot: `Lokasi umum: ${location} (disampaikan pengguna; belum diverifikasi).`,
      timestampSlot: "Waktu: pagi hari (disampaikan pengguna; tanggal belum diberikan).",
      referenceSlot: "No source-verification procedure was applied to these supplied notes.",
    },
    limitations: profile.limitations,
    futureDataRequired: profile.futureData,
    futureWork: profile.futureWork,
    conclusion: profile.conclusion,
    annexure: {
      rawInputSummary:
        input.mainText ||
        "Daun A dilaporkan lonjong, bertepi rata, dan hijau tua; Daun B dilaporkan menjari, bertepi bergerigi, dan hijau muda.",
      evidenceTable: [
        {
          id: "M01",
          material_type: "catatan",
          summary: "Daun A: lonjong, tepi rata, warna hijau tua.",
          user_provided: true,
          verification_status: "Belum diverifikasi",
        },
        {
          id: "M02",
          material_type: "catatan",
          summary: "Daun B: menjari, tepi bergerigi, warna hijau muda.",
          user_provided: true,
          verification_status: "Belum diverifikasi",
        },
        {
          id: "M03",
          material_type: "lokasi",
          summary: `${location}; waktu pengamatan dinyatakan pagi hari.`,
          user_provided: true,
          verification_status: "Belum diverifikasi",
        },
      ],
      checklist: [
        "Cocokkan kembali tabel dengan catatan asli pengguna.",
        "Tambahkan foto berlabel hanya apabila benar-benar tersedia.",
        "Catat ukuran dan ulangan tanpa mengisi nilai yang belum diukur.",
        "Tambahkan referensi hanya setelah dipilih dan diperiksa pengguna.",
        "Pertahankan pernyataan keterbatasan dalam versi akhir yang diedit.",
      ],
    },
    references: ["No references were supplied. NaLI did not generate artificial references."],
  };
}

export function mapJournalArticleToDraftReport(report: DraftReport, article: JournalArticle): DraftReport {
  const tableRows = article.results.comparisonTable
    .map(
      (row) =>
        `| ${row.object} | ${row.shape} | ${row.margin} | ${row.color} | ${row.source} | ${row.evidenceStatus} |`,
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
      article.references[0],
    ],
    uncertainty_note: ["KETERBATASAN BUKTI", ...article.limitations.map((item) => `- ${item}`)].join("\n"),
    additional_evidence_needed: article.futureDataRequired,
    user_review_checklist: article.annexure.checklist,
    human_review_reminder: PUBLIC_REPORT_DISCLAIMER,
    next_user_steps: article.futureDataRequired,
  };
}
