import { j } from "../_helper";

const CHECKED = "2026-06-12";

/**
 * Cluster: geologi dan gunung api Indonesia. Menumpang pada katalog Smithsonian
 * Global Volcanism Program, profil MAGMA Indonesia, dan literatur ilmiah yang
 * sudah terdaftar di Arsip Sumber.
 */
export const geologiGunungApi = [
  j({
    slug: "tsunami-vulkanik-tanpa-gempa",
    synopsis: `Banyak orang menunggu gempa sebagai tanda tsunami. Selat Sunda 2018 menunjukkan laut bisa bergerak tanpa itu: sebagian tubuh Anak Krakatau runtuh ke laut dan mendorong gelombang. Bagi pesisir wisata pada malam hari, celah pemahaman ini bisa berarti hilangnya waktu berharga untuk menyelamatkan diri.`,
    title: "Tsunami bisa datang tanpa gempa besar",
    dek: "Runtuhnya tubuh gunung api ke laut dapat menggerakkan gelombang, seperti di Selat Sunda 2018.",
    category: "geologi",
    topics: ["tsunami", "gunung api", "bahaya", "Selat Sunda"],
    geography: ["Selat Sunda", "Banten", "Lampung"],
    sourceIds: ["anak-krakatau-2018-tsunami", "nhess-anak-krakatau-2018", "gvp-krakatau"],
    confidence: "high",
    body: `Banyak orang mengaitkan tsunami dengan gempa besar di dasar laut. Itu benar untuk sebagian besar kasus, tetapi tidak untuk semuanya. Tsunami juga dapat dipicu oleh runtuhnya sebagian tubuh gunung api ke laut, sebuah proses yang dikenal sebagai flank collapse.

Peristiwa Selat Sunda pada 22 Desember 2018 menjadi contoh yang dipelajari secara luas. Studi ilmiah menempatkan runtuhnya sisi tubuh Anak Krakatau sebagai mekanisme utama. Massa material yang turun ke laut menggeser air dalam volume besar, lalu menghasilkan gelombang yang menyebar ke pesisir tanpa didahului gempa tektonik besar yang terasa luas.

Konsekuensinya penting bagi kesiapsiagaan. Sistem peringatan yang dirancang untuk membaca gempa dan perubahan muka laut tetap berguna, tetapi tsunami vulkanik dapat lolos dari pola itu. Tanda awalnya tidak selalu berupa guncangan yang dirasakan warga, sehingga jeda waktu untuk evakuasi bisa sangat pendek, apalagi pada malam hari di kawasan wisata pesisir.

Pelajaran utamanya bukan menakut-nakuti, melainkan memperluas cara membaca bahaya. Di wilayah dengan gunung api laut, pemantauan perlu mencakup perubahan bentuk tubuh gunung, bukan hanya aktivitas seismik. Memahami bahwa laut dapat bergerak karena gunung runtuh adalah bagian dari literasi bencana yang realistis untuk Indonesia.`,
    keyTakeaway:
      "Tsunami tidak selalu berawal dari gempa; runtuhnya tubuh gunung api ke laut juga dapat menggerakkan gelombang besar.",
    limitations: [
      "Angka volume runtuhan berbeda antar metode; entri ini menahan diri pada mekanismenya.",
      "Data korban dan kronologi rinci harus dirujuk ke laporan resmi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "toba-letusan-super",
    synopsis: `Danau Toba yang tenang adalah bekas letusan super sekitar 74.000 tahun lalu. Bahwa letusannya raksasa cukup pasti. Tetapi klaim bahwa ia nyaris memunahkan manusia jauh lebih lemah dan masih diperdebatkan. Toba mengajarkan kita memisahkan skala fisik yang nyata dari kepastian dampak yang belum tentu ada.`,
    title: "Toba, danau yang dulunya letusan super",
    dek: "Kaldera raksasa Sumatra adalah jejak salah satu letusan terbesar dalam sejarah Bumi modern.",
    category: "geologi",
    topics: ["Toba", "kaldera", "letusan super", "Sumatra"],
    geography: ["Danau Toba", "Sumatra Utara"],
    sourceIds: ["gvp-toba", "frontiers-toba-supereruption-2014", "nature-communications-toba-2018"],
    confidence: "high",
    body: `Danau Toba di Sumatra Utara tampak tenang, tetapi cekungan besar yang menampungnya adalah kaldera, sisa dari letusan super sekitar 74.000 tahun lalu. Letusan itu mengeluarkan material dalam jumlah luar biasa dan termasuk salah satu peristiwa vulkanik terbesar yang diketahui dalam jutaan tahun terakhir.

Skala letusan Toba memunculkan pertanyaan besar tentang dampaknya pada iklim dan manusia purba. Sebagian hipotesis mengaitkannya dengan pendinginan global dan tekanan pada populasi manusia, sering disebut sebagai gagasan bottleneck. Namun bukti dari berbagai disiplin tidak seragam. Sejumlah studi menunjukkan dampak iklim yang lebih terbatas atau lebih singkat daripada versi paling dramatis, dan jejak di situs arkeologi tertentu tidak selalu menunjukkan keruntuhan populasi.

Inti dari kasus Toba adalah ketegangan antara skala fisik yang nyata dan kepastian dampak yang masih diperdebatkan. Bahwa letusannya sangat besar adalah kesimpulan yang kuat. Bahwa letusan itu nyaris memusnahkan manusia adalah klaim yang jauh lebih lemah dan bergantung pada banyak asumsi.

Hari ini, Toba adalah danau vulkanik yang indah sekaligus laboratorium ilmiah. Katalog gunung api dan studi terbaru terus memperbaiki perkiraan volume, umur, dan dampaknya, memperlihatkan bagaimana sains memperbaiki dirinya seiring data baru.`,
    keyTakeaway:
      "Toba adalah jejak letusan super yang nyata besar, tetapi klaim bahwa ia nyaris memunahkan manusia masih diperdebatkan.",
    limitations: [
      "Dampak iklim dan populasi dari letusan Toba masih menjadi perdebatan ilmiah aktif.",
      "Perkiraan volume dan umur dapat berubah seiring metode penanggalan baru.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "tambora-1815-tahun-tanpa-musim-panas",
    synopsis: `Letusan Tambora 1815 menurunkan suhu dunia, dan tahun berikutnya dikenang sebagai tahun tanpa musim panas dengan gagal panen di benua lain. Di sini Indonesia bukan sekadar korban iklim global, melainkan sumbernya. Satu letusan tropis yang cukup besar ternyata bisa menggeser cuaca seluruh planet.`,
    title: "Tambora 1815 dan tahun tanpa musim panas",
    dek: "Letusan di Sumbawa mendinginkan iklim dunia dan memicu kelaparan di benua lain.",
    category: "geologi",
    topics: ["Tambora", "iklim", "letusan", "Sumbawa"],
    geography: ["Tambora", "Sumbawa", "Nusa Tenggara Barat"],
    sourceIds: ["tambora-1815-gvp", "tambora-oppenheimer-2003", "noaa-tambora-climate-context"],
    confidence: "high",
    body: `Letusan Gunung Tambora di Sumbawa pada 1815 adalah salah satu letusan terbesar dalam sejarah tercatat. Ia melontarkan material dan gas dalam jumlah besar ke atmosfer, termasuk aerosol sulfat yang dapat memantulkan sebagian sinar matahari kembali ke angkasa. Akibatnya, suhu rata-rata global turun untuk sementara.

Tahun berikutnya, 1816, dikenang di belahan bumi utara sebagai tahun tanpa musim panas. Eropa dan Amerika Utara mengalami cuaca dingin yang tidak biasa, gagal panen, dan kesulitan pangan. Hubungan antara letusan tropis besar dan pendinginan iklim ini menjadi salah satu contoh paling kuat tentang bagaimana satu peristiwa geologi dapat berdampak ke seluruh dunia.

Dampak di Indonesia sendiri sangat berat, terutama di sekitar Sumbawa, dengan korban jiwa besar akibat letusan langsung, lahar, dan kelaparan yang menyusul. Sebagian masyarakat lokal di kaki gunung bahkan terkubur, meninggalkan jejak arkeologis yang kemudian dipelajari.

Tambora 1815 mengingatkan bahwa Indonesia bukan hanya menerima dampak iklim global, tetapi pernah menjadi sumbernya. Letusan tropis besar adalah bagian dari sistem iklim Bumi, dan rekam jejaknya membantu ilmuwan memahami seberapa kuat vulkanisme dapat menggeser cuaca dunia.`,
    keyTakeaway:
      "Letusan Tambora 1815 menurunkan suhu global dan memicu tahun tanpa musim panas, contoh nyata gunung api Indonesia memengaruhi iklim dunia.",
    limitations: [
      "Angka korban dan volume letusan bervariasi antar sumber sejarah dan ilmiah.",
      "Besarnya pendinginan iklim adalah perkiraan dari rekonstruksi, bukan pengukuran langsung era itu.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "merapi-awan-panas",
    synopsis: `Bahaya paling khas Merapi bukan lava yang mengalir pelan, melainkan awan panas yang meluncur cepat menuruni lereng dan sulit dihindari. Karena lerengnya padat penduduk, gunung ini dipantau sangat ketat. Hidup berdampingan dengannya menuntut kedisiplinan evakuasi setiap kali aktivitasnya meningkat.`,
    title: "Merapi dan bahaya awan panas",
    dek: "Salah satu gunung api paling aktif di dunia, dipantau ketat karena dekat permukiman padat.",
    category: "geologi",
    topics: ["Merapi", "awan panas", "pemantauan", "Jawa"],
    geography: ["Merapi", "Yogyakarta", "Jawa Tengah"],
    sourceIds: ["gvp-merapi", "magma-merapi-profile", "merapi-2010-eruption-gfz"],
    confidence: "high",
    body: `Gunung Merapi di perbatasan Yogyakarta dan Jawa Tengah adalah salah satu gunung api paling aktif di dunia. Letusannya sering bersifat efusif sampai eksplosif dengan pembentukan kubah lava, dan bahaya paling khasnya adalah awan panas, aliran campuran gas dan material vulkanik bersuhu tinggi yang meluncur menuruni lereng dengan cepat.

Awan panas berbahaya karena bergerak cepat dan sulit dihindari setelah terbentuk. Letusan 2010 menjadi salah satu yang paling besar dalam beberapa dekade dan menyebabkan banyak korban serta pengungsian massal. Peristiwa itu mendorong penguatan pemantauan dan revisi peta kawasan rawan bencana.

Karena Merapi dikelilingi permukiman padat dan lahan pertanian, pemantauannya termasuk yang paling intensif di Indonesia. Pengamatan mencakup kegempaan, deformasi tubuh gunung, emisi gas, dan pertumbuhan kubah lava. Informasi ini menjadi dasar penetapan tingkat aktivitas dan rekomendasi jarak aman.

Merapi memperlihatkan bahwa hidup berdampingan dengan gunung api aktif menuntut sistem yang menggabungkan sains, komunikasi risiko, dan kesiapsiagaan warga. Kesuburan lereng menarik pemukiman, sementara bahaya awan panas menuntut kedisiplinan evakuasi saat aktivitas meningkat.`,
    keyTakeaway:
      "Bahaya utama Merapi adalah awan panas yang bergerak cepat, sehingga pemantauan ketat dan kesiapsiagaan menjadi keharusan di lereng yang padat penduduk.",
    limitations: [
      "Pola letusan Merapi dapat berubah; rujuk status terbaru dari otoritas pemantau.",
      "Angka korban dan dampak 2010 harus dirujuk ke laporan resmi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "kawah-ijen-api-biru",
    synopsis: `Api biru Ijen sering dikira lava. Sebenarnya itu gas belerang yang terbakar saat bertemu udara panas. Kawahnya juga menyimpan danau yang sangat asam. Keindahannya nyata, tetapi begitu pula bahayanya bagi penambang yang bekerja dekat gas beracun di tepi kawah hampir setiap hari.`,
    title: "Api biru Ijen bukan lava",
    dek: "Cahaya biru di kawah Ijen berasal dari gas belerang yang terbakar, bukan batuan pijar.",
    category: "geologi",
    topics: ["Ijen", "belerang", "kawah", "Jawa Timur"],
    geography: ["Ijen", "Banyuwangi", "Jawa Timur"],
    sourceIds: ["global-volcanism-program-ijen", "sulfur-combustion-blue-flame-ijen", "acid-crater-lake-ijen"],
    confidence: "high",
    body: `Kawah Ijen di Jawa Timur terkenal dengan api biru yang muncul pada malam hari. Cahaya itu sering disalahpahami sebagai lava biru. Padahal warna biru tersebut berasal dari gas belerang yang keluar dari rekahan, terbakar saat bersentuhan dengan udara panas, dan menghasilkan nyala kebiruan. Sebagian gas mengembun menjadi belerang cair yang ikut menyala dan mengalir.

Ijen juga memiliki danau kawah yang sangat asam, salah satu yang terbesar di dunia dalam kategori itu. Air danau kaya asam dan bersifat korosif, hasil dari interaksi gas vulkanik dengan air. Lingkungan ini ekstrem bagi kehidupan, tetapi menjadi objek studi penting tentang geokimia gunung api.

Di Ijen, fenomena alam bertemu dengan kerja manusia. Penambang belerang tradisional naik turun kawah untuk memikul bongkahan belerang padat, bekerja dekat gas beracun yang dapat membahayakan pernapasan. Aktivitas ini memperlihatkan sisi sosial dari gunung api: sumber penghidupan sekaligus risiko kesehatan yang nyata.

Memahami Ijen secara benar berarti memisahkan keindahan visual dari mekanismenya. Api biru adalah pembakaran gas belerang, bukan batuan cair, dan danau asamnya adalah laboratorium alami sekaligus bahaya yang perlu dihormati.`,
    keyTakeaway:
      "Api biru Ijen adalah gas belerang yang terbakar, bukan lava, dan kawahnya menyimpan danau asam ekstrem.",
    limitations: [
      "Intensitas api biru dan kondisi gas berubah-ubah dan bergantung cuaca serta aktivitas.",
      "Kondisi danau kawah dapat berubah; ikuti informasi keselamatan dari otoritas.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "dieng-gas-co2-senyap",
    synopsis: `Dieng tampak sejuk dan damai, tetapi menyimpan bahaya yang tidak terlihat: gas vulkanik seperti karbon dioksida yang bisa berkumpul di area rendah dan mematikan tanpa letusan besar. Ancaman gunung api tidak selalu dramatis. Kadang ia senyap, justru di tempat yang tampak paling tenang.`,
    title: "Dieng dan bahaya gas yang tidak terlihat",
    dek: "Dataran tinggi yang indah menyimpan risiko keluarnya gas vulkanik mematikan.",
    category: "geologi",
    topics: ["Dieng", "gas vulkanik", "bahaya", "Jawa Tengah"],
    geography: ["Dieng", "Jawa Tengah"],
    sourceIds: ["gvp-dieng", "magma-dieng-profile", "dieng-gas-hazard-review"],
    confidence: "high",
    body: `Dataran Tinggi Dieng di Jawa Tengah dikenal sebagai kawasan wisata sejuk dengan kawah, telaga, dan candi tua. Di balik pemandangan itu, Dieng adalah kompleks vulkanik aktif dengan bahaya yang khas: pelepasan gas vulkanik, terutama karbon dioksida, yang dapat mematikan tanpa letusan besar.

Karbon dioksida lebih berat daripada udara, sehingga dapat berkumpul di cekungan, lembah, atau area rendah dan menggusur oksigen. Karena gas ini tidak berwarna dan tidak berbau pada konsentrasi berbahaya, korban bisa jatuh tanpa peringatan yang jelas. Sejarah Dieng mencatat peristiwa pelepasan gas yang menelan korban, menjadikannya contoh bahaya vulkanik yang senyap.

Selain gas, Dieng memiliki kawah dengan aktivitas hidrotermal dan potensi letusan freatik, yaitu letusan uap yang dipicu pemanasan air tanah. Bahaya seperti ini bisa muncul tiba-tiba dan tidak selalu didahului tanda yang mencolok bagi pengunjung awam.

Dieng mengajarkan bahwa bahaya gunung api tidak selalu berupa lava atau awan panas yang dramatis. Kadang ancamannya berupa gas tak kasatmata di area yang tampak tenang. Karena itu, mengikuti penanda kawasan berbahaya dan informasi dari otoritas pemantau adalah bagian penting dari keselamatan di kawasan ini.`,
    keyTakeaway:
      "Bahaya khas Dieng adalah gas vulkanik tak terlihat seperti CO2 yang bisa mematikan di area rendah, bukan hanya letusan besar.",
    limitations: [
      "Lokasi dan intensitas pelepasan gas dapat berubah; ikuti penanda dan otoritas setempat.",
      "Detail peristiwa historis harus dirujuk ke laporan resmi dan kajian ilmiah.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "kelud-danau-kawah-direkayasa",
    synopsis: `Danau di kawah Kelud membuat letusannya mematikan, karena air bisa tumpah bersama material panas sebagai lahar yang menyapu lembah. Untuk menekan risiko, airnya pernah dialirkan keluar lewat terowongan. Rekayasa ini menangani satu bagian bahaya, tetapi gunung tetap memegang kendali atas bentuk letusannya.`,
    title: "Kelud, gunung yang danau kawahnya direkayasa",
    dek: "Untuk menahan lahar, danau kawah Kelud pernah dikelola dengan terowongan.",
    category: "geologi",
    topics: ["Kelud", "lahar", "danau kawah", "Jawa Timur"],
    geography: ["Kelud", "Jawa Timur"],
    sourceIds: ["gvp-kelud", "gvp-kelud-1990", "gvp-kelud-2014"],
    confidence: "high",
    body: `Gunung Kelud di Jawa Timur memiliki sejarah letusan yang berbahaya karena danau kawahnya. Ketika letusan terjadi, air danau dapat tercampur material panas dan tumpah sebagai lahar, aliran lumpur vulkanik yang menyapu lembah dan permukiman di bawahnya. Letusan masa lalu dengan danau penuh menyebabkan korban besar akibat lahar.

Untuk menurunkan risiko, dibangun sistem untuk mengurangi volume air danau kawah, termasuk terowongan yang mengalirkan air keluar. Rekayasa ini adalah salah satu contoh paling menonjol dari upaya manusia mengelola bahaya gunung api secara langsung, dengan mengurangi bahan baku lahar sebelum letusan berikutnya.

Perilaku Kelud sendiri dapat berubah. Pada beberapa episode, gunung membentuk kubah lava yang menutup kawah, sementara pada 2014 letusan berlangsung eksplosif dan menyebarkan abu sangat luas hingga mengganggu wilayah yang jauh. Variasi ini menunjukkan bahwa mitigasi tidak bisa berhenti pada satu skenario.

Kelud menggambarkan hubungan dua arah antara manusia dan gunung api: bahaya dikelola dengan teknik, tetapi gunung tetap memegang kendali atas bentuk letusannya. Pemantauan dan kesiapsiagaan tetap diperlukan karena rekayasa danau kawah hanya menangani satu bagian dari keseluruhan risiko.`,
    keyTakeaway:
      "Danau kawah Kelud membuat laharnya mematikan, sehingga airnya pernah direkayasa untuk menekan risiko, meski letusan tetap bervariasi.",
    limitations: [
      "Efektivitas rekayasa danau kawah bergantung pada tipe letusan yang terjadi.",
      "Detail teknis dan korban historis harus dirujuk ke laporan resmi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "samalas-1257-letusan-terlupakan",
    synopsis: `Selama berabad-abad ilmuwan tahu ada letusan besar sekitar tahun 1257 dari jejak es kutub, tetapi tidak tahu sumbernya. Jawabannya ternyata Samalas di Lombok. Geologi lapangan, inti es, dan naskah babad bertemu untuk menyusun ulang peristiwa yang nyaris hilang dari ingatan dunia.`,
    title: "Samalas 1257, letusan besar yang lama terlupakan",
    dek: "Jejak es dan babad bertemu untuk mengidentifikasi sumber letusan global abad ke-13.",
    category: "geologi",
    topics: ["Samalas", "Rinjani", "letusan", "arsip"],
    geography: ["Rinjani", "Lombok", "Nusa Tenggara Barat"],
    sourceIds: ["gvp-rinjani-samalas", "pnas-samalas-1257-lavigne", "babad-lombok-samalas-context"],
    confidence: "high",
    body: `Selama bertahun-tahun, ilmuwan iklim tahu ada letusan sangat besar di sekitar tahun 1257 dari jejak sulfat di inti es kutub, tetapi tidak tahu gunung mana sumbernya. Letusan itu termasuk salah satu yang terkuat dalam ribuan tahun terakhir, dan dampaknya terekam jauh dari pusat letusan.

Penelitian yang menggabungkan geologi lapangan, penanggalan, dan sumber sejarah mengarahkan jawaban ke Samalas, gunung api di kompleks Rinjani di Lombok. Endapan vulkanik tebal dan kaldera yang kini berisi danau menjadi bukti fisik. Menariknya, naskah lokal seperti babad turut menyebut peristiwa kehancuran yang konsisten dengan letusan besar di kawasan itu.

Kasus Samalas adalah contoh kuat bagaimana arsip alam dan arsip manusia dapat saling menguatkan. Inti es memberi tanda waktu dan skala global, geologi memberi lokasi dan mekanisme, dan teks sejarah memberi konteks dampak lokal. Tidak ada satu sumber yang cukup sendirian, tetapi gabungannya membentuk kesimpulan yang meyakinkan.

Samalas juga mengingatkan bahwa peristiwa geologi besar dapat hilang dari ingatan kolektif lalu ditemukan kembali lewat metode ilmiah. Letusan yang pernah mengguncang dunia bisa menjadi misteri selama berabad-abad sebelum sains menyusun ulang petunjuknya.`,
    keyTakeaway:
      "Letusan Samalas 1257 diidentifikasi dengan memadukan inti es, geologi lapangan, dan naskah sejarah, contoh arsip alam bertemu arsip manusia.",
    limitations: [
      "Sebagian detail kronologi dan dampak tetap menjadi rekonstruksi ilmiah.",
      "Penafsiran naskah sejarah perlu kehati-hatian dan tidak berdiri sendiri.",
    ],
    checkedAt: CHECKED,
  }),
];
