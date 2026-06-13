import { j } from "../_helper";

const CHECKED = "2026-06-13";

/**
 * Batch 1a: satwa endemik dan terancam di Indonesia (mamalia besar, primata,
 * mamalia laut). Klaim status mengikuti penilaian IUCN Red List; sebaran dan
 * rekaman mengikuti katalog GBIF. Sampul tiap entri memakai visual sumber
 * terbuka berlisensi yang tercatat di Arsip Sumber.
 */
export const satwaKonservasiA = [
  j({
    slug: "harimau-sumatra",
    synopsis: `Harimau Sumatra adalah subspesies harimau terkecil yang masih hidup dan satu-satunya yang tersisa di Indonesia setelah harimau Jawa dan Bali punah. Tubuhnya lebih ramping dengan loreng rapat, adaptasi untuk hutan rapat Sumatra. Populasinya kecil dan terancam kritis, ditekan hilangnya hutan dan perburuan.`,
    title: "Harimau Sumatra, kucing besar terakhir di Nusantara",
    dek: "Subspesies harimau terkecil yang tersisa, hanya di Sumatra dan tergolong sangat terancam.",
    category: "satwa",
    topics: ["harimau Sumatra", "predator", "endemik", "konservasi"],
    geography: ["Sumatra"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Setelah harimau Bali dan Jawa dinyatakan punah pada abad ke-20, hanya harimau Sumatra (Panthera tigris sumatrae) yang masih bertahan di Indonesia. Ia adalah subspesies harimau yang masih hidup dengan ukuran tubuh paling kecil. Tubuhnya yang lebih ringan, loreng yang lebih rapat dan gelap, serta selaput kecil di sela jari membantunya bergerak di hutan hujan dataran rendah yang rapat dan basah.

Penilaian IUCN menempatkan harimau Sumatra pada status Critically Endangered. Dua tekanan berulang dalam literatur: hilangnya dan terpotongnya hutan akibat perkebunan dan penebangan, serta perburuan dan konflik dengan manusia. Karena harimau memerlukan wilayah jelajah luas dan mangsa yang cukup, fragmentasi hutan memutus populasi menjadi kantong-kantong kecil yang lebih rentan punah secara lokal.

Sebagai predator puncak, harimau Sumatra menjadi penanda kesehatan hutan. Kehadirannya menunjukkan rantai makanan yang masih utuh, dari mangsa berkuku sampai vegetasi yang menopangnya. Hilangnya harimau sering menjadi sinyal bahwa ekosistem hutan sudah tertekan jauh sebelum perubahan itu terlihat kasar.

Pemantauan modern banyak bergantung pada kamera jebak dan analisis loreng yang unik tiap individu, bukan perjumpaan langsung. Pendekatan ini membuat estimasi populasi lebih hati-hati, sekaligus mengingatkan bahwa angka pasti sulit didapat untuk satwa yang pemalu dan tersebar di hutan luas.`,
    keyTakeaway: "Harimau Sumatra adalah harimau terakhir Indonesia, subspesies terkecil yang bertahan, dan kelangsungannya terikat pada keutuhan hutan Sumatra.",
    limitations: [
      "Status mengikuti penilaian IUCN; rujuk halaman penilaian terbaru untuk angka populasi.",
      "Estimasi populasi predator pemalu selalu mengandung ketidakpastian metode.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "gajah-sumatra",
    synopsis: `Gajah Sumatra adalah subspesies gajah Asia yang lebih kecil, kunci penyebar biji di hutan Sumatra. Habitatnya menyusut cepat oleh perkebunan dan permukiman, memicu konflik dengan manusia. Status kritisnya menunjukkan betapa cepat mamalia darat terbesar Asia bisa kehilangan ruang hidup di pulau yang padat berubah.`,
    title: "Gajah Sumatra, perawat hutan yang kehilangan ruang",
    dek: "Subspesies gajah Asia yang lebih kecil, terancam kritis oleh penyusutan habitat di Sumatra.",
    category: "satwa",
    topics: ["gajah Sumatra", "mamalia", "konflik", "konservasi"],
    geography: ["Sumatra"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Gajah Sumatra (Elephas maximus sumatranus) adalah salah satu subspesies gajah Asia. Ia berukuran lebih kecil daripada kerabatnya di daratan, tetapi tetap menjadi mamalia darat terbesar di Indonesia. Sebagai pemakan tumbuhan dalam jumlah besar, gajah berperan penting menyebarkan biji dan membuka jalur di hutan, sehingga sering disebut perawat atau insinyur hutan.

Penilaian IUCN menempatkan gajah Sumatra pada status Critically Endangered. Penyebab utamanya adalah hilangnya hutan dataran rendah yang menjadi habitat sekaligus jalur jelajahnya. Ketika hutan diubah menjadi perkebunan dan permukiman, jalur lama gajah memotong lahan manusia, dan konflik pun muncul: tanaman rusak, kadang korban di kedua pihak.

Persoalan gajah Sumatra karena itu bukan sekadar soal satwa, melainkan soal tata ruang. Gajah membutuhkan kawasan luas dan terhubung. Tanpa koridor yang menyambungkan kantong-kantong hutan, kelompok gajah terjebak di pulau-pulau habitat yang terlalu sempit untuk menopang populasi sehat dalam jangka panjang.

Upaya konservasi mencakup pengamanan kawasan, mitigasi konflik, dan menjaga konektivitas habitat. Namun semua itu berpacu dengan laju perubahan lahan. Nasib gajah Sumatra menjadi ukuran nyata apakah pembangunan di Sumatra menyisakan ruang bagi satwa yang sudah lama menjadi bagian dari hutannya.`,
    keyTakeaway: "Gajah Sumatra terancam kritis terutama karena hutan dataran rendahnya menyusut dan terpotong, memicu konflik dengan manusia.",
    limitations: [
      "Status dan tren mengikuti penilaian IUCN dan dapat diperbarui.",
      "Data konflik manusia dan gajah berbeda antar wilayah dan perlu sumber lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "badak-sumatra",
    synopsis: `Badak Sumatra adalah badak terkecil di dunia dan satu-satunya badak Asia berkulit berambut dengan dua cula. Kerabat dekat badak purba berbulu, ia kini tersisa dalam populasi yang sangat kecil dan terpencar. Status kritisnya membuat setiap kelahiran di penangkaran menjadi berita penting bagi kelangsungan spesies.`,
    title: "Badak Sumatra, badak berambut yang nyaris habis",
    dek: "Badak terkecil dunia, berdua cula dan berambut, tersisa dalam populasi sangat kecil.",
    category: "satwa",
    topics: ["badak Sumatra", "mamalia", "endemik", "konservasi"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Badak Sumatra (Dicerorhinus sumatrensis) adalah badak terkecil yang masih hidup dan satu-satunya badak Asia yang memiliki dua cula. Berbeda dari badak Jawa yang berkulit halus, tubuh badak Sumatra ditutupi rambut kasar. Ciri ini menjadikannya kerabat terdekat dari badak berbulu zaman es yang sudah punah, sebuah jendela hidup ke masa lalu evolusi badak.

Penilaian IUCN menempatkannya pada status Critically Endangered. Populasinya tidak hanya kecil, tetapi juga terpencar dalam kelompok-kelompok yang terpisah jauh. Inilah masalah khasnya: ketika individu yang mampu berbiak tidak saling bertemu, angka populasi yang sudah rendah menjadi makin sulit pulih, bahkan tanpa tambahan perburuan.

Karena itu, sebagian upaya konservasi badak Sumatra bergeser ke penangkaran terkelola, tempat individu dipertemukan untuk berbiak di bawah pengawasan. Setiap kelahiran menjadi peristiwa penting yang diberitakan luas, menandakan betapa tipis margin kelangsungan spesies ini.

Badak Sumatra hidup di hutan hujan pegunungan dan dataran rendah, memakan dedaunan dan ranting. Ia pemalu dan sulit diamati, sehingga banyak yang diketahui berasal dari jejak, kamera jebak, dan studi individu yang ditangkarkan. Nasibnya mengingatkan bahwa kepunahan jarang datang sebagai satu peristiwa besar; lebih sering ia berupa populasi yang perlahan terlalu kecil dan terlalu terpisah.`,
    keyTakeaway: "Badak Sumatra adalah badak terkecil dan satu-satunya badak Asia berambut berdua cula, kini sangat terancam karena populasi kecil dan terpencar.",
    limitations: [
      "Estimasi populasi sangat kecil dan sensitif terhadap metode survei.",
      "Status mengikuti penilaian IUCN dan dapat berubah seiring data penangkaran.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "orangutan-kalimantan",
    synopsis: `Orangutan Kalimantan adalah kera besar arboreal yang menghabiskan hampir seluruh hidupnya di pepohonan. Reproduksinya termasuk paling lambat di antara mamalia, sehingga kehilangan individu sulit tergantikan. Hilangnya hutan dan perburuan membuat populasinya turun tajam, menjadikannya simbol tekanan deforestasi di Borneo.`,
    title: "Orangutan Kalimantan dan reproduksi yang lambat",
    dek: "Kera besar arboreal Borneo yang reproduksinya lambat membuat pemulihan populasi sulit.",
    category: "satwa",
    topics: ["orangutan", "primata", "endemik", "Kalimantan"],
    geography: ["Kalimantan", "Borneo"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Orangutan Kalimantan (Pongo pygmaeus) adalah satu dari tiga spesies orangutan dan satu-satunya kera besar Asia di Borneo. Ia hidup hampir sepenuhnya di pepohonan, bergerak perlahan di antara tajuk hutan untuk mencari buah, daun, dan kulit kayu. Sarang dibangun baru hampir setiap malam dari ranting dan dedaunan.

Salah satu kunci untuk memahami kerentanannya adalah reproduksi yang sangat lambat. Induk orangutan biasanya hanya melahirkan satu anak dalam selang beberapa tahun, dan anak bergantung pada induk untuk waktu yang panjang. Akibatnya, populasi yang berkurang sulit pulih cepat; kehilangan satu betina dewasa berarti hilangnya potensi keturunan selama bertahun-tahun.

Penilaian IUCN menempatkan orangutan Kalimantan pada status Critically Endangered. Penyebab utamanya adalah hilangnya hutan akibat konversi lahan, kebakaran, dan penebangan, ditambah perburuan serta perdagangan anak orangutan. Ketika hutan terpotong, kelompok orangutan terisolasi dan kehilangan akses ke pohon buah musiman yang penting.

Sebagai pemakan dan penyebar buah, orangutan berperan menjaga regenerasi hutan. Keberadaannya terjalin dengan kesehatan hutan Borneo secara keseluruhan. Karena itu, melindungi orangutan jarang berarti melindungi satu spesies saja; biasanya ia menuntut menjaga bentang hutan yang juga menopang ribuan jenis lain.`,
    keyTakeaway: "Reproduksi orangutan Kalimantan yang lambat membuat populasinya sulit pulih, sehingga hilangnya hutan berdampak besar dan lama.",
    limitations: [
      "Estimasi populasi bergantung pada metode dan kawasan survei.",
      "Status mengikuti penilaian IUCN dan dapat diperbarui.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "orangutan-sumatra",
    synopsis: `Orangutan Sumatra hidup di hutan utara pulau dan dikenal lebih sosial serta lebih sering memakai alat dibanding kerabatnya di Borneo. Populasinya kecil dan terpusat, sangat rentan pada hilangnya hutan dan pembangunan. Statusnya kritis menjadikannya salah satu kera besar paling terancam di dunia.`,
    title: "Orangutan Sumatra, kera besar pemakai alat",
    dek: "Kera besar di utara Sumatra, lebih sosial dan pengguna alat, kini sangat terancam.",
    category: "satwa",
    topics: ["orangutan", "primata", "endemik", "Sumatra"],
    geography: ["Sumatra", "Aceh"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Orangutan Sumatra (Pongo abelii) hidup terutama di hutan bagian utara Sumatra, termasuk kawasan Leuser. Dibanding orangutan Kalimantan, populasi Sumatra dikenal cenderung lebih sosial dan lebih sering memakai alat, misalnya ranting untuk mengambil serangga atau biji dari buah yang berduri. Perilaku ini menjadi contoh budaya pada hewan, kebiasaan yang dipelajari dan diwariskan dalam kelompok.

Penilaian IUCN menempatkan orangutan Sumatra pada status Critically Endangered. Populasinya relatif kecil dan terkonsentrasi di kawasan tertentu, sehingga tekanan pada satu bentang hutan dapat berdampak besar. Pembukaan lahan, jalan, dan proyek pembangunan yang memotong hutan menjadi ancaman utama karena memecah habitat yang seharusnya menyatu.

Seperti orangutan lain, reproduksinya lambat. Selang kelahiran yang panjang membuat populasi tidak dapat pulih cepat dari kehilangan. Hal ini memperbesar dampak setiap individu yang mati akibat konflik, perburuan, atau hilangnya pohon pakan.

Karena perilaku memakai alat dan struktur sosialnya, orangutan Sumatra menjadi subjek penting penelitian perilaku primata. Namun nilai ilmiah itu berjalan seiring kerentanan nyata di lapangan. Menjaga orangutan Sumatra berarti menjaga keutuhan hutan utara pulau, yang sekaligus menopang banyak satwa dan jasa ekologi lain.`,
    keyTakeaway: "Orangutan Sumatra menonjol karena perilaku sosial dan pemakaian alat, tetapi populasinya yang kecil dan terpusat membuatnya sangat terancam.",
    limitations: [
      "Status mengikuti penilaian IUCN dan dapat diperbarui.",
      "Catatan perilaku memakai alat berbeda antar kelompok dan lokasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "bekantan-hidung-panjang",
    synopsis: `Bekantan, monyet berhidung besar dari Borneo, hidup di mangrove dan hutan tepi sungai. Hidung jantan yang menonjol diduga berperan dalam suara dan daya tarik kawin. Ketergantungannya pada hutan pesisir membuatnya rentan saat mangrove dan riparian diubah, sehingga statusnya tergolong terancam.`,
    title: "Bekantan, monyet hidung besar penjaga mangrove",
    dek: "Monyet endemik Borneo yang hidup di mangrove dan hutan tepi sungai, kini terancam.",
    category: "satwa",
    topics: ["bekantan", "primata", "endemik", "mangrove"],
    geography: ["Kalimantan", "Borneo"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Bekantan (Nasalis larvatus) adalah monyet endemik Borneo yang mudah dikenali dari hidung besar pada jantan dewasa. Fungsi pasti hidung itu masih diteliti, tetapi diduga berkaitan dengan resonansi suara dan sinyal sosial dalam memikat betina serta menegaskan posisi dalam kelompok. Betina dan anak berhidung lebih kecil dan mancung.

Bekantan adalah penghuni khas hutan mangrove, rawa gambut, dan hutan tepi sungai. Ia perenang yang baik dan kadang menyeberangi sungai, didukung selaput kecil di sela jari. Makanannya didominasi daun muda dan buah yang belum matang, dengan sistem pencernaan khusus untuk mengolah dedaunan yang sulit dicerna.

Ketergantungan pada hutan pesisir dan riparian membuat bekantan rentan. Ketika mangrove ditebang untuk tambak atau hutan tepi sungai dibuka, habitatnya menyusut dan kelompoknya terpisah. Penilaian IUCN menempatkannya pada status terancam, dengan hilangnya habitat sebagai tekanan utama.

Karena hidup di zona peralihan darat dan laut, bekantan menjadi penanda kesehatan ekosistem pesisir Borneo. Kehadirannya menunjukkan mangrove dan hutan sungai yang masih berfungsi. Melindungi bekantan, dengan demikian, sejalan dengan menjaga mangrove yang juga melindungi pesisir dan menyimpan karbon.`,
    keyTakeaway: "Bekantan bergantung pada mangrove dan hutan tepi sungai Borneo, sehingga nasibnya terikat pada kesehatan ekosistem pesisir.",
    limitations: [
      "Fungsi hidung besar masih menjadi subjek penelitian.",
      "Status dan populasi mengikuti penilaian IUCN dan survei lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "owa-jawa",
    synopsis: `Owa Jawa adalah kera kecil endemik hutan Jawa bagian barat yang bersuara nyaring dan hidup berpasangan setia. Nyanyiannya menandai wilayah di pagi hari. Hutan Jawa yang menyusut drastis membuat populasinya terbatas pada kantong-kantong, menjadikannya salah satu primata paling terancam di pulau terpadat ini.`,
    title: "Owa Jawa, penyanyi pagi yang setia",
    dek: "Kera kecil endemik Jawa barat, hidup berpasangan dan terancam oleh hutan yang menyusut.",
    category: "satwa",
    topics: ["owa Jawa", "primata", "endemik", "Jawa"],
    geography: ["Jawa Barat", "Jawa"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Owa Jawa (Hylobates moloch), atau owa kelabu, adalah kera kecil tanpa ekor yang hanya hidup di hutan Jawa bagian barat. Berbeda dari banyak primata yang hidup dalam kelompok besar, owa hidup dalam keluarga kecil dan dikenal monogami, satu pasangan jantan dan betina yang menempati wilayah tetap bersama anak-anaknya.

Salah satu ciri paling khas adalah suaranya. Pada pagi hari, owa menyanyikan seruan nyaring yang terdengar jauh, menandai wilayah dan memperkuat ikatan pasangan. Tubuhnya dirancang untuk brakiasi, berayun cepat dari dahan ke dahan dengan lengan panjang, gaya gerak yang efisien di tajuk hutan.

Penilaian IUCN menempatkan owa Jawa pada status terancam. Penyebab utamanya jelas: Jawa adalah salah satu pulau terpadat di dunia, dan hutan aslinya telah lama menyusut menjadi sisa-sisa yang terpisah. Owa yang membutuhkan hutan utuh dan kanopi yang tersambung sulit bertahan di lanskap yang terpotong.

Karena hidup berpasangan dengan wilayah tetap, owa tidak mudah berpindah saat hutannya rusak. Fragmentasi mengurung kelompok di petak-petak kecil yang lama-lama kehilangan keragaman genetik. Melindungi owa Jawa berarti menjaga dan menyambungkan sisa hutan pegunungan Jawa barat, sekaligus menyelamatkan banyak jenis lain yang berbagi rumah dengannya.`,
    keyTakeaway: "Owa Jawa hidup berpasangan setia di hutan Jawa barat dan terancam karena hutan pulau ini sudah menyusut dan terpotong.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei populasi terbaru.",
      "Estimasi populasi primata arboreal mengandung ketidakpastian metode.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "siamang-kantung-suara",
    synopsis: `Siamang adalah owa terbesar, dikenal dari kantung tenggorokan yang menggembung untuk memperkuat suaranya yang menggelegar. Hidup berpasangan di hutan Sumatra, ia menyanyi duet untuk menegaskan wilayah. Hilangnya hutan dan perdagangan satwa menekan populasinya, menjadikannya simbol suara hutan yang mulai senyap.`,
    title: "Siamang dan kantung suara yang menggelegar",
    dek: "Owa terbesar dengan kantung tenggorokan, penyanyi duet di hutan Sumatra.",
    category: "satwa",
    topics: ["siamang", "primata", "Sumatra", "konservasi"],
    geography: ["Sumatra"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Siamang (Symphalangus syndactylus) adalah jenis owa terbesar dan hidup di hutan Sumatra serta Semenanjung Malaya. Ciri paling menonjol adalah kantung tenggorokan yang dapat menggembung sebesar kepala. Kantung ini bekerja sebagai resonator: ketika siamang bersuara, kantung memperkuat seruannya menjadi gema yang terdengar dari kejauhan.

Seperti owa lain, siamang hidup dalam keluarga kecil dan mempertahankan wilayah. Pasangan jantan dan betina sering bernyanyi duet, paduan seruan yang kompleks dan terkoordinasi. Duet ini menegaskan kepemilikan wilayah dan memperkuat ikatan pasangan, sekaligus menjadi salah satu suara paling khas hutan Sumatra.

Penilaian IUCN menempatkan siamang pada status terancam. Tekanan utamanya adalah hilangnya hutan dan perdagangan satwa, terutama pengambilan anak untuk peliharaan. Karena siamang bergerak dengan brakiasi di kanopi, ia membutuhkan hutan dengan tajuk yang menyambung; hutan yang terpotong menyulitkan pergerakan dan mengurung kelompok.

Suara siamang yang dulu lazim terdengar di banyak hutan kini menghilang dari wilayah yang hutannya rusak. Kesunyian itu menjadi penanda yang nyaring tentang menyusutnya hutan. Melindungi siamang berarti menjaga hutan Sumatra yang utuh, tempat duetnya masih bisa menggema di pagi hari.`,
    keyTakeaway: "Siamang, owa terbesar, memakai kantung tenggorokan untuk seruan menggelegar, tetapi suaranya menghilang seiring hutan Sumatra menyusut.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei terbaru.",
      "Dampak perdagangan satwa berbeda antar wilayah dan perlu data lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "beruang-madu",
    synopsis: `Beruang madu adalah beruang terkecil di dunia, penghuni hutan tropis Asia Tenggara termasuk Sumatra dan Kalimantan. Lidahnya yang sangat panjang membantunya mengambil madu dan serangga. Hilangnya hutan dan perdagangan bagian tubuhnya menekan populasi, sementara perannya menyebar biji dan membuka sarang serangga penting bagi hutan.`,
    title: "Beruang madu, beruang terkecil berlidah panjang",
    dek: "Beruang terkecil dunia, penghuni hutan Sumatra dan Kalimantan, kini rentan.",
    category: "satwa",
    topics: ["beruang madu", "mamalia", "hutan", "konservasi"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Beruang madu (Helarctos malayanus) adalah beruang terkecil di dunia dan satu-satunya beruang yang hidup di hutan tropis Indonesia, terutama Sumatra dan Kalimantan. Tubuhnya kompak dengan bulu hitam pendek dan tanda dada berwarna terang berbentuk seperti tapal kuda atau bulan sabit, pola yang berbeda pada tiap individu.

Ciri khasnya adalah lidah yang sangat panjang, alat untuk menjangkau madu di sarang lebah dan serangga di lubang kayu. Cakar yang kuat dan melengkung membantunya memanjat dan membongkar batang lapuk. Karena kebiasaan ini, beruang madu berperan membuka sarang serangga dan menyebarkan biji buah yang dimakannya, menjadikannya bagian dari mesin regenerasi hutan.

Penilaian IUCN menempatkan beruang madu pada status rentan. Ancaman utamanya adalah hilangnya hutan dan perburuan, termasuk perdagangan bagian tubuh dan pengambilan anak untuk peliharaan. Konflik dengan manusia juga muncul ketika kebun berdekatan dengan hutan.

Beruang madu sulit diamati karena pemalu dan banyak beraktivitas pada malam hari. Banyak data berasal dari kamera jebak dan jejak. Sebagai pemakan beragam, dari serangga sampai buah, kehadirannya membantu menjaga keseimbangan hutan. Hilangnya beruang madu sering menjadi tanda hutan yang menyusut dan terganggu.`,
    keyTakeaway: "Beruang madu, beruang terkecil dunia, membantu regenerasi hutan tropis Indonesia tetapi tertekan hilangnya hutan dan perburuan.",
    limitations: [
      "Status mengikuti penilaian IUCN; data populasi terbatas.",
      "Banyak informasi berasal dari kamera jebak, bukan pengamatan langsung.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "tapir-asia-belang",
    synopsis: `Tapir Asia, satwa berwarna hitam-putih mencolok, adalah mamalia berkuku ganjil terbesar Asia Tenggara dan kerabat jauh kuda serta badak. Pola tubuhnya menyamarkan siluet di hutan malam. Penyebar biji yang penting ini terancam oleh hilangnya hutan, menjadikannya bagian rapuh dari ekologi hutan Sumatra.`,
    title: "Tapir Asia, penyamar hitam-putih di hutan malam",
    dek: "Mamalia berkuku ganjil terbesar Asia Tenggara, penyebar biji yang kini terancam.",
    category: "satwa",
    topics: ["tapir", "mamalia", "hutan", "konservasi"],
    geography: ["Sumatra"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Tapir Asia (Tapirus indicus) adalah satu-satunya jenis tapir di Asia dan yang terbesar di antara semua tapir. Di Indonesia, ia hidup di hutan Sumatra. Tubuhnya memiliki pola dua warna yang khas: bagian depan dan kaki hitam, bagian tengah putih, seperti pelana. Pola mencolok ini justru menyamarkan siluet tubuhnya di hutan yang remang pada malam hari.

Tapir adalah mamalia berkuku ganjil, kerabat jauh kuda dan badak. Ia memiliki moncong kecil yang lentur, dipakai untuk meraih dedaunan, tunas, dan buah. Sebagai pemakan tumbuhan yang menjelajah luas, tapir menelan banyak biji dan menyebarkannya melalui kotoran, sehingga berperan penting dalam regenerasi hutan.

Penilaian IUCN menempatkan tapir Asia pada status terancam. Penyebab utamanya adalah hilangnya dan terpotongnya hutan dataran rendah. Tapir membutuhkan hutan yang luas dan dekat air; ketika habitat menyusut, populasinya terpisah dan menurun. Perburuan menambah tekanan di beberapa wilayah.

Tapir pemalu dan aktif terutama pada malam hari, sehingga jarang terlihat. Banyak yang diketahui dari kamera jebak dan jejak kaki. Sebagai penyebar biji berukuran besar, tapir membantu menanam ulang hutan dengan cara yang tidak bisa digantikan satwa kecil. Kehilangannya berarti melemahnya salah satu mesin alami pemulihan hutan Sumatra.`,
    keyTakeaway: "Tapir Asia adalah penyebar biji besar yang penting bagi regenerasi hutan Sumatra, kini terancam oleh penyusutan hutan dataran rendah.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei terbaru.",
      "Data sebaran sebagian besar dari kamera jebak.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "trenggiling-sisik",
    synopsis: `Trenggiling adalah mamalia bersisik pemakan semut dan rayap yang menggulung saat terancam. Justru sisiknya membuatnya menjadi salah satu mamalia paling diperdagangkan secara ilegal di dunia. Tekanan perburuan untuk perdagangan lintas negara mendorong statusnya ke titik kritis, meski perannya mengendalikan serangga sangat berharga.`,
    title: "Trenggiling, mamalia bersisik yang paling diburu",
    dek: "Pemakan semut bersisik yang menjadi mamalia paling diperdagangkan secara ilegal.",
    category: "konservasi",
    topics: ["trenggiling", "perdagangan satwa", "mamalia", "konservasi"],
    geography: ["Sumatra", "Kalimantan", "Jawa"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Trenggiling adalah mamalia yang seluruh tubuhnya ditutupi sisik keras dari keratin, bahan yang sama dengan kuku manusia. Indonesia memiliki trenggiling Sunda (Manis javanica). Ketika terancam, ia menggulung menjadi bola bersisik yang sulit ditembus pemangsa. Tanpa gigi untuk mengunyah, trenggiling menjulurkan lidah panjang dan lengket untuk menyantap semut dan rayap dalam jumlah besar.

Ironisnya, pertahanan yang melindunginya dari pemangsa alami justru menjadikannya sasaran manusia. Sisik dan dagingnya diperdagangkan, sebagian besar untuk pasar lintas negara. Akibatnya, trenggiling kerap disebut sebagai salah satu mamalia yang paling banyak diperdagangkan secara ilegal di dunia. Tekanan ini mendorong penilaian IUCN menempatkan trenggiling Sunda pada status Critically Endangered.

Kebiasaan makannya membuat trenggiling bernilai ekologis. Dengan menyantap semut dan rayap dalam jumlah besar, ia membantu mengendalikan populasi serangga yang dapat merusak kayu dan tanaman. Hilangnya trenggiling berpotensi menggeser keseimbangan kecil itu di hutan dan lahan.

Trenggiling sulit ditangkarkan dan reproduksinya lambat, biasanya satu anak per kelahiran. Kombinasi reproduksi lambat dan perburuan intensif membuat populasi sulit pulih. Perlindungannya menuntut penegakan hukum terhadap perdagangan lintas batas, bukan hanya pengamanan habitat, karena ancaman terbesarnya datang dari permintaan pasar yang jauh dari hutannya.`,
    keyTakeaway: "Sisik trenggiling yang melindunginya dari pemangsa justru menjadikannya mamalia paling diperdagangkan, mendorongnya ke status kritis.",
    limitations: [
      "Data perdagangan ilegal sulit diukur pasti dan bergantung pada penyitaan.",
      "Status mengikuti penilaian IUCN dan dapat diperbarui.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "macan-tutul-jawa",
    synopsis: `Macan tutul Jawa adalah kucing besar terakhir yang tersisa di Jawa setelah harimau Jawa punah. Banyak individu berwarna hitam, varian melanistik yang sering disebut macan kumbang. Terjepit di hutan yang menyusut dan terpisah, ia menanggung peran predator puncak Jawa sendirian dengan populasi yang kian tertekan.`,
    title: "Macan tutul Jawa, predator puncak terakhir di Jawa",
    dek: "Kucing besar terakhir Jawa, banyak berwarna hitam, terancam oleh hutan yang terpisah.",
    category: "satwa",
    topics: ["macan tutul Jawa", "predator", "endemik", "Jawa"],
    geography: ["Jawa"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Setelah harimau Jawa punah, macan tutul Jawa (Panthera pardus melas) menjadi satu-satunya kucing besar yang tersisa di pulau Jawa. Sebagai subspesies macan tutul, ia berukuran relatif kecil dan beradaptasi dengan hutan pegunungan serta dataran rendah Jawa. Banyak individu berwarna hitam pekat, varian melanistik yang dalam bahasa sehari-hari sering disebut macan kumbang; pada cahaya tertentu, pola tutul masih terlihat samar di balik warna gelapnya.

Penilaian IUCN menempatkan macan tutul Jawa pada status Critically Endangered. Persoalannya khas pulau yang padat: hutan Jawa telah lama menyusut dan terpisah menjadi kantong-kantong. Macan tutul yang membutuhkan wilayah jelajah luas terjepit di petak-petak habitat yang dikelilingi lahan manusia, sehingga populasinya terpisah dan rentan.

Sebagai predator puncak yang kini sendirian, macan tutul Jawa memikul peran ekologis penting: mengendalikan populasi mangsa seperti babi hutan dan rusa. Tanpa predator ini, keseimbangan herbivora dan vegetasi di hutan Jawa dapat terganggu.

Macan tutul Jawa pemalu dan sulit diamati, sehingga banyak data berasal dari kamera jebak. Konflik muncul ketika hutan berbatasan dengan permukiman dan ternak. Melindunginya berarti menjaga sisa hutan Jawa sekaligus menyambungkan kembali kantong-kantong yang terpisah agar populasi kecil ini tidak makin terkurung.`,
    keyTakeaway: "Macan tutul Jawa adalah predator puncak terakhir Jawa, terancam kritis karena hutan pulau ini menyusut dan terpisah.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei terbaru.",
      "Proporsi individu melanistik berbeda antar populasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "banteng-sapi-liar",
    synopsis: `Banteng adalah sapi liar Asia Tenggara, nenek moyang sebagian sapi peliharaan, yang masih hidup liar di sejumlah taman nasional Indonesia. Jantan berwarna gelap, betina cokelat kemerahan, keduanya berkaki putih seperti berkaus. Perburuan dan hilangnya padang membuat populasinya menurun dan terancam.`,
    title: "Banteng, sapi liar berkaus putih",
    dek: "Sapi liar Asia Tenggara yang masih bertahan di taman nasional Indonesia, kini terancam.",
    category: "satwa",
    topics: ["banteng", "mamalia", "padang rumput", "konservasi"],
    geography: ["Jawa", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Banteng (Bos javanicus) adalah sapi liar yang hidup di Asia Tenggara, termasuk Jawa dan Kalimantan. Ia adalah salah satu nenek moyang sapi peliharaan tertentu, sehingga penting tidak hanya secara ekologis tetapi juga sebagai cadangan genetik bagi peternakan. Banteng dikenali dari kaki bawah yang berwarna putih, seakan mengenakan kaus kaki, dan dari pantat putih yang mencolok saat lari.

Jantan dewasa berwarna gelap kebiruan atau hitam dengan tanduk melengkung, sementara betina dan muda berwarna cokelat kemerahan. Banteng hidup berkelompok dan menyukai mosaik hutan dan padang terbuka tempat ia merumput. Di beberapa taman nasional Indonesia, banteng menjadi salah satu satwa besar yang masih dapat diamati di padang penggembalaan.

Penilaian IUCN menempatkan banteng pada status terancam. Penyebabnya mencakup perburuan, hilangnya padang dan hutan, serta persaingan dan penyakit dari ternak. Karena banteng menyukai area terbuka yang juga diincar untuk pertanian dan permukiman, habitatnya mudah berkurang.

Sebagai herbivora besar, banteng membantu menjaga padang tetap terbuka dan memengaruhi struktur vegetasi. Hilangnya banteng dapat menggeser dinamika padang dan hutan tepi. Selain itu, sebagai kerabat liar sapi domestik, kelestariannya menyimpan nilai bagi ketahanan genetik ternak di masa depan.`,
    keyTakeaway: "Banteng adalah sapi liar dan cadangan genetik ternak yang masih bertahan di taman nasional Indonesia, tetapi terancam perburuan dan hilangnya padang.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei populasi.",
      "Risiko penyakit dari ternak berbeda antar lokasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "rusa-bawean",
    synopsis: `Rusa Bawean hanya hidup di satu pulau kecil di Laut Jawa, salah satu sebaran rusa paling sempit di dunia. Tubuhnya kecil dan aktif malam. Karena seluruh populasinya terkurung di satu pulau, satu gangguan besar bisa berdampak luas, menjadikannya contoh kerentanan satwa endemik pulau kecil.`,
    title: "Rusa Bawean, rusa satu pulau",
    dek: "Rusa kecil yang hanya hidup di Pulau Bawean, salah satu sebaran paling sempit di dunia.",
    category: "satwa",
    topics: ["rusa Bawean", "endemik", "pulau", "konservasi"],
    geography: ["Bawean", "Jawa Timur"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Rusa Bawean (Axis kuhlii) adalah rusa kecil yang hanya ditemukan di Pulau Bawean, sebuah pulau kecil di Laut Jawa di utara Jawa Timur. Sebaran sesempit ini menjadikannya salah satu rusa dengan wilayah hidup paling terbatas di dunia. Tubuhnya ringkas, dengan jantan bertanduk relatif sederhana, dan ia banyak beraktivitas pada malam hari di hutan dan semak pulau.

Kondisi endemik pulau kecil membawa kerentanan khas. Seluruh populasi dunia terkonsentrasi di satu tempat, sehingga satu gangguan besar, seperti kebakaran, penyakit, atau perubahan habitat, dapat berdampak pada bagian besar spesies sekaligus. Tidak ada populasi liar lain di tempat lain yang bisa menjadi cadangan.

Penilaian IUCN menempatkan rusa Bawean pada status terancam. Tekanannya mencakup perburuan, anjing liar, dan perubahan penggunaan lahan di pulau yang juga dihuni manusia. Karena Bawean tidak luas, ruang bagi rusa dan ruang bagi manusia saling berhimpitan.

Rusa Bawean menjadi contoh nyata bagaimana evolusi pulau menghasilkan jenis unik sekaligus rapuh. Konservasinya bergantung pada pengelolaan satu pulau secara hati-hati, termasuk pengamanan habitat dan pengendalian ancaman seperti anjing liar. Kisahnya mengingatkan bahwa kekayaan hayati Indonesia tidak hanya ada di pulau-pulau besar, tetapi juga tersimpan di pulau-pulau kecil yang mudah luput dari perhatian.`,
    keyTakeaway: "Rusa Bawean hanya hidup di satu pulau kecil, sehingga seluruh populasinya rentan pada satu gangguan besar.",
    limitations: [
      "Estimasi populasi pulau kecil sensitif terhadap metode survei.",
      "Status mengikuti penilaian IUCN dan dapat diperbarui.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "kucing-merah-kalimantan",
    synopsis: `Kucing merah Kalimantan adalah kucing liar kecil yang hanya ada di Borneo dan termasuk paling jarang teramati di dunia. Bulunya kemerahan, dan begitu sedikit yang diketahui sampai banyak data berasal dari segelintir foto kamera jebak. Statusnya terancam, simbol betapa banyak satwa Borneo masih nyaris tak terpelajari.`,
    title: "Kucing merah Kalimantan, kucing misterius Borneo",
    dek: "Kucing liar kecil endemik Borneo yang sangat jarang teramati dan masih penuh misteri.",
    category: "satwa",
    topics: ["kucing merah", "endemik", "Kalimantan", "konservasi"],
    geography: ["Kalimantan", "Borneo"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "medium",
    body: `Kucing merah Kalimantan (Catopuma badia), sering disebut bay cat, adalah kucing liar kecil yang hanya hidup di Borneo. Ia termasuk salah satu kucing paling jarang teramati di dunia. Begitu sedikit yang diketahui tentangnya sehingga selama waktu yang lama informasinya hampir seluruhnya berasal dari spesimen museum, dan baru kemudian dari segelintir foto kamera jebak dan perjumpaan langka.

Bulunya umumnya kemerahan dengan ekor panjang, meski ada juga varian berwarna lebih kelabu. Ukurannya kecil, sebanding kucing rumah yang agak besar. Karena pemalu, nokturnal, dan hidup di hutan yang sulit dijangkau, perilakunya, makanannya, dan ukuran populasinya masih banyak yang belum dipahami secara pasti.

Penilaian IUCN menempatkan kucing merah Kalimantan pada status terancam. Ancaman utamanya adalah hilangnya hutan Borneo akibat penebangan dan konversi lahan. Karena datanya terbatas, sulit memperkirakan dampak persis tekanan itu, tetapi penyusutan hutan secara umum menyempitkan ruang hidupnya.

Kucing merah menjadi pengingat bahwa keanekaragaman Indonesia masih menyimpan banyak misteri. Ada satwa yang tertekan bahkan sebelum kita benar-benar mengenalnya. Konservasi untuk jenis seperti ini sering berjalan beriringan dengan penelitian dasar, karena melindungi sesuatu menjadi lebih sulit ketika kita masih sedikit tahu tentangnya.`,
    keyTakeaway: "Kucing merah Kalimantan sangat jarang teramati dan masih penuh misteri, terancam oleh hilangnya hutan Borneo sebelum benar-benar dikenal.",
    limitations: [
      "Data sangat terbatas; banyak aspek biologinya belum dipahami.",
      "Estimasi populasi tidak pasti dan bergantung pada kamera jebak.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "kucing-kepala-datar",
    synopsis: `Kucing kepala datar adalah kucing liar kecil pemancing dari rawa dan hutan tepi air Sumatra dan Kalimantan. Gigi dan kaki berselaputnya teradaptasi menangkap ikan. Ketergantungan pada lahan basah membuatnya rentan saat rawa dikeringkan, menjadikannya salah satu kucing paling terancam di kawasan ini.`,
    title: "Kucing kepala datar, kucing pemancing dari rawa",
    dek: "Kucing liar kecil pemakan ikan dari lahan basah Sumatra dan Kalimantan, kini terancam.",
    category: "satwa",
    topics: ["kucing kepala datar", "lahan basah", "endemik", "konservasi"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Kucing kepala datar (Prionailurus planiceps) adalah kucing liar kecil yang hidup di rawa, hutan gambut, dan hutan tepi sungai di Sumatra dan Kalimantan. Namanya berasal dari bentuk kepala yang memanjang dan dahi yang relatif datar. Berbeda dari kebanyakan kucing yang menghindari air, kucing ini justru terikat pada lahan basah.

Tubuhnya menunjukkan adaptasi untuk berburu di air. Giginya teradaptasi untuk mencengkeram mangsa yang licin seperti ikan dan katak, dan kakinya memiliki selaput yang membantu di tanah berlumpur. Ia juga memangsa hewan air kecil dan invertebrata. Pola hidup ini menjadikannya pemancing kecil yang khas di ekosistem rawa.

Penilaian IUCN menempatkan kucing kepala datar pada status terancam. Ancaman terbesarnya adalah hilangnya lahan basah: rawa dan hutan gambut dikeringkan untuk perkebunan dan pertanian, sementara pencemaran air dan penurunan stok ikan mengurangi mangsanya. Karena hidupnya menempel pada ekosistem yang sangat spesifik, ia tidak mudah berpindah ketika habitatnya rusak.

Kucing kepala datar menjadi penanda kesehatan lahan basah dataran rendah. Kehadirannya menunjukkan rawa dan sungai yang masih berfungsi dan kaya ikan. Melindunginya berarti menjaga lahan basah, yang sekaligus penting untuk pengendalian banjir, penyimpanan karbon, dan perikanan lokal.`,
    keyTakeaway: "Kucing kepala datar adalah kucing pemancing yang bergantung pada lahan basah, sehingga sangat rentan saat rawa dan gambut dikeringkan.",
    limitations: [
      "Status mengikuti penilaian IUCN dan data yang terbatas.",
      "Sebaran dan populasi sulit dipantau untuk satwa pemalu di rawa.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "macan-dahan-sunda",
    synopsis: `Macan dahan Sunda adalah kucing pohon dengan taring relatif terpanjang dibanding ukuran tubuhnya di antara kucing modern. Pola bulunya menyerupai awan, penyamaran sempurna di kanopi. Endemik Sumatra dan Kalimantan ini terancam oleh hilangnya hutan, simbol predator tersembunyi yang jarang terlihat manusia.`,
    title: "Macan dahan Sunda, kucing pohon bertaring panjang",
    dek: "Kucing pohon Sumatra dan Kalimantan dengan taring proporsional terpanjang di antara kucing modern.",
    category: "satwa",
    topics: ["macan dahan", "predator", "endemik", "hutan"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Macan dahan Sunda (Neofelis diardi) adalah kucing berukuran sedang yang hidup di hutan Sumatra dan Kalimantan. Ia dikenali dari pola bulunya yang menyerupai gumpalan awan besar bertepi gelap, penyamaran yang sangat efektif di antara bayang-bayang kanopi. Dahulu dianggap sama dengan macan dahan daratan Asia, kini ia diakui sebagai spesies tersendiri berdasarkan bukti genetik dan morfologi.

Salah satu keistimewaannya adalah taring atas yang sangat panjang dibanding ukuran tubuhnya, proporsi terbesar di antara kucing modern, mengingatkan pada kucing bertaring pedang dari masa lampau. Macan dahan adalah pemanjat ulung; ia dapat menuruni batang dengan kepala lebih dulu dan bahkan menggantung di dahan, kemampuan yang menjadikannya predator kanopi yang lihai.

Penilaian IUCN menempatkan macan dahan Sunda pada status terancam. Ancaman utamanya adalah hilangnya hutan akibat penebangan dan konversi lahan, ditambah perburuan. Karena hidup tersembunyi di hutan dan banyak beraktivitas pada malam hari, ia jarang terlihat manusia, dan banyak data berasal dari kamera jebak.

Sebagai predator hutan, macan dahan membantu mengendalikan populasi mamalia dan burung kecil di kanopi maupun lantai hutan. Kehadirannya menandakan hutan yang masih cukup utuh dan kaya mangsa. Melindunginya berarti menjaga hutan Sumatra dan Kalimantan yang juga menopang banyak satwa lain.`,
    keyTakeaway: "Macan dahan Sunda adalah predator pohon bertaring panjang yang tersembunyi di hutan Sumatra dan Kalimantan, terancam oleh hilangnya hutan.",
    limitations: [
      "Status mengikuti penilaian IUCN dan data kamera jebak.",
      "Pemisahan spesies dari macan dahan daratan didasarkan pada bukti genetik dan morfologi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "binturong-bau-popcorn",
    synopsis: `Binturong, atau beruang kucing, adalah mamalia pohon besar yang baunya menyerupai popcorn akibat senyawa khas di kelenjarnya. Ekornya yang dapat mencengkeram membantunya bergerak di kanopi. Sebagai penyebar biji, terutama ara, ia penting bagi hutan, tetapi hilangnya hutan dan perdagangan menekan populasinya.`,
    title: "Binturong, si beruang kucing beraroma popcorn",
    dek: "Mamalia pohon besar dengan ekor pencengkeram dan aroma khas popcorn, penyebar biji penting.",
    category: "satwa",
    topics: ["binturong", "mamalia", "penyebar biji", "konservasi"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Binturong (Arctictis binturong) adalah mamalia pohon berbulu hitam lebat yang dijuluki beruang kucing, meski bukan beruang maupun kucing. Ia anggota keluarga musang berukuran besar dan hidup di hutan Sumatra dan Kalimantan. Salah satu ciri paling unik adalah baunya: kelenjar tubuhnya menghasilkan senyawa yang membuat aromanya menyerupai popcorn atau jagung panggang, dipakai untuk menandai wilayah.

Binturong memiliki ekor panjang yang dapat mencengkeram seperti tangan kelima, alat penting untuk menjaga keseimbangan saat bergerak di antara dahan. Ia bergerak lambat dan banyak menghabiskan waktu di kanopi. Makanannya beragam, tetapi buah, terutama ara, menempati porsi besar.

Karena gemar makan ara dan buah lain, binturong berperan sebagai penyebar biji. Beberapa biji bahkan lebih mudah berkecambah setelah melewati saluran pencernaannya. Dengan begitu, binturong membantu menjaga regenerasi pohon ara yang menjadi sumber makanan banyak satwa hutan.

Penilaian IUCN menempatkan binturong pada status rentan. Ancamannya mencakup hilangnya hutan serta perburuan dan perdagangan, baik untuk peliharaan maupun pemanfaatan lain. Hilangnya binturong dapat melemahkan penyebaran biji ara, yang berarti dampaknya merembet ke banyak jenis lain yang bergantung pada pohon ara di hutan.`,
    keyTakeaway: "Binturong, mamalia pohon beraroma popcorn, adalah penyebar biji ara yang penting bagi hutan, tetapi tertekan hilangnya hutan dan perdagangan.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei terbatas.",
      "Peran penyebaran biji bervariasi menurut jenis buah dan lokasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "dugong-pemakan-lamun",
    synopsis: `Dugong adalah mamalia laut pemakan lamun, kerabat dekat manati dan, secara mengejutkan, gajah. Ia merumput di padang lamun perairan dangkal Indonesia. Karena tumbuh dan berbiak lambat serta terikat pada lamun, dugong rentan pada kerusakan padang lamun, jaring, dan tabrakan perahu, sehingga statusnya tergolong rentan.`,
    title: "Dugong, perumput padang lamun",
    dek: "Mamalia laut pemakan lamun, kerabat gajah, yang rentan pada kerusakan padang lamun.",
    category: "laut",
    topics: ["dugong", "lamun", "mamalia laut", "konservasi"],
    geography: ["Indonesia"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Dugong (Dugong dugon) adalah mamalia laut bertubuh besar yang hidup di perairan hangat dangkal, termasuk banyak wilayah pesisir Indonesia. Berbeda dari paus dan lumba-lumba yang berburu hewan, dugong adalah herbivora yang merumput lamun di dasar laut. Secara evolusi, ia lebih dekat dengan manati dan, lebih mengejutkan lagi, dengan gajah daripada dengan mamalia laut lain.

Dugong menghabiskan banyak waktu menyusuri padang lamun, mencabut tumbuhan beserta akarnya. Aktivitas merumput ini memengaruhi struktur padang lamun, sehingga dugong kadang disebut sebagai pembentuk lanskap bawah laut. Ketergantungannya pada lamun sangat erat: tanpa padang lamun yang sehat, dugong tidak punya makanan.

Penilaian IUCN menempatkan dugong pada status rentan. Ancaman utamanya mencakup rusaknya padang lamun akibat pencemaran dan sedimentasi, terjerat jaring nelayan, serta tabrakan dengan perahu. Dugong tumbuh dan berbiak lambat, dengan selang kelahiran panjang, sehingga populasinya sulit pulih dari kehilangan.

Karena hidupnya terikat pada padang lamun, dugong menjadi penanda kesehatan ekosistem pesisir. Padang lamun sendiri menyimpan karbon, menjadi tempat asuhan ikan, dan menstabilkan dasar laut. Melindungi dugong, dengan demikian, berarti menjaga padang lamun yang juga bernilai bagi iklim dan perikanan.`,
    keyTakeaway: "Dugong adalah mamalia laut pemakan lamun yang nasibnya terikat pada kesehatan padang lamun, dan rentan karena berbiak lambat.",
    limitations: [
      "Status mengikuti penilaian IUCN; data populasi pesisir sering tidak lengkap.",
      "Kondisi padang lamun berbeda antar wilayah.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "pesut-mahakam",
    synopsis: `Pesut Mahakam adalah populasi lumba-lumba air tawar Irrawaddy yang terjebak di Sungai Mahakam, Kalimantan Timur, dengan jumlah sangat kecil. Berkepala bulat tanpa moncong panjang, ia terancam jaring, lalu lintas kapal, dan pencemaran. Statusnya kritis menjadikannya salah satu mamalia paling langka di perairan Indonesia.`,
    title: "Pesut Mahakam, lumba-lumba sungai yang nyaris habis",
    dek: "Populasi lumba-lumba Irrawaddy di Sungai Mahakam, berjumlah sangat kecil dan kritis.",
    category: "perairan",
    topics: ["pesut", "lumba-lumba", "sungai", "konservasi"],
    geography: ["Mahakam", "Kalimantan Timur"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Pesut Mahakam adalah sebutan untuk populasi lumba-lumba Irrawaddy (Orcaella brevirostris) yang hidup di air tawar Sungai Mahakam di Kalimantan Timur. Berbeda dari lumba-lumba laut yang bermoncong panjang, lumba-lumba Irrawaddy berkepala bulat tanpa paruh menonjol, dengan sirip punggung kecil. Populasi Mahakam terjebak jauh di pedalaman sungai dan jumlahnya sangat kecil.

Hidup di sungai yang juga ramai dipakai manusia membawa ancaman yang khas. Pesut kerap terjerat dan mati di jaring ikan, terutama jaring insang. Lalu lintas kapal yang padat, pencemaran, dan perubahan aliran sungai akibat pembangunan menambah tekanan. Karena populasinya begitu kecil, kematian beberapa individu saja dapat berdampak besar pada kelangsungan seluruh kelompok.

Penilaian konservasi menempatkan populasi air tawar ini pada tingkat ancaman yang sangat tinggi. Tidak ada populasi cadangan: pesut Mahakam terikat pada satu sistem sungai. Inilah yang membuatnya menjadi salah satu mamalia paling langka di perairan Indonesia.

Pesut menjadi simbol hubungan antara manusia dan sungai. Sungai Mahakam menopang penghidupan banyak orang sekaligus menjadi satu-satunya rumah bagi pesut. Melindunginya menuntut pengaturan alat tangkap, pengurangan tabrakan kapal, dan menjaga kualitas air, langkah-langkah yang juga bermanfaat bagi perikanan dan masyarakat di sepanjang sungai.`,
    keyTakeaway: "Pesut Mahakam adalah populasi lumba-lumba sungai yang sangat kecil dan kritis, terancam jaring, kapal, dan pencemaran di satu-satunya sungai rumahnya.",
    limitations: [
      "Estimasi populasi sangat kecil dan sensitif terhadap metode.",
      "Status mengikuti penilaian konservasi populasi air tawar yang spesifik.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "yaki-sulawesi",
    synopsis: `Yaki, monyet hitam berjambul Sulawesi, dikenal dari wajah ekspresif dan pantat merah muda mencolok. Hidup berkelompok besar, ia penyebar biji penting di hutan Sulawesi utara. Perburuan untuk daging dan hilangnya hutan menekan populasinya hingga kritis, menjadikannya wajah konservasi primata Wallacea.`,
    title: "Yaki, monyet hitam berjambul Sulawesi",
    dek: "Monyet hitam Sulawesi utara dengan wajah ekspresif, penyebar biji yang kini kritis.",
    category: "satwa",
    topics: ["yaki", "primata", "endemik", "Sulawesi"],
    geography: ["Sulawesi Utara", "Sulawesi"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Yaki (Macaca nigra), atau monyet hitam berjambul Sulawesi, adalah primata endemik Sulawesi bagian utara. Seluruh tubuhnya hitam dengan jambul rambut di kepala dan pantat berwarna merah muda mencolok. Wajahnya sangat ekspresif, dan yaki dikenal kerap menampilkan ekspresi seperti menyeringai, yang sebenarnya merupakan sinyal sosial dalam kelompok.

Yaki hidup berkelompok besar dan banyak menghabiskan waktu mencari buah, biji, dan serangga, baik di pohon maupun di tanah. Karena banyak memakan buah, ia berperan sebagai penyebar biji yang penting bagi regenerasi hutan Sulawesi. Struktur sosialnya yang kompleks menjadikannya subjek penelitian perilaku primata.

Penilaian IUCN menempatkan yaki pada status Critically Endangered. Dua tekanan menonjol: perburuan untuk daging, yang di sebagian wilayah dikonsumsi, serta hilangnya hutan. Kombinasi keduanya menekan populasi cukup tajam, terutama di kawasan yang hutannya menyusut sementara perburuan berlanjut.

Yaki menjadi salah satu wajah konservasi primata di kawasan Wallacea. Statusnya menggambarkan tantangan khas Sulawesi: pulau yang kaya jenis endemik tetapi menghadapi tekanan perburuan dan perubahan lahan. Melindungi yaki menuntut pendekatan yang menggabungkan pengamanan habitat dengan keterlibatan masyarakat dalam menekan perburuan.`,
    keyTakeaway: "Yaki, monyet hitam berjambul Sulawesi, adalah penyebar biji penting yang kini kritis akibat perburuan dan hilangnya hutan.",
    limitations: [
      "Status mengikuti penilaian IUCN dan survei terbaru.",
      "Tingkat perburuan berbeda antar wilayah dan perlu data lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "kukang-jawa",
    synopsis: `Kukang Jawa adalah primata kecil bermata besar dan bergerak lambat yang, langka di antara mamalia, memiliki gigitan berbisa. Aktif malam, ia diburu untuk perdagangan satwa peliharaan, sering dengan gigi dipotong. Tekanan ini, ditambah hilangnya hutan, membuat statusnya kritis di pulau yang padat.`,
    title: "Kukang Jawa, primata berbisa yang bergerak lambat",
    dek: "Primata nokturnal Jawa yang berbisa, terancam kritis oleh perdagangan satwa.",
    category: "konservasi",
    topics: ["kukang", "primata", "perdagangan satwa", "Jawa"],
    geography: ["Jawa"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "high",
    body: `Kukang Jawa (Nycticebus javanicus) adalah primata kecil bermata besar yang hidup di hutan Jawa. Ia aktif pada malam hari dan bergerak sangat lambat dan hati-hati di antara dahan. Salah satu hal paling tidak biasa darinya adalah racun: kukang termasuk sedikit mamalia berbisa. Ia menghasilkan zat dari kelenjar di lengan yang, dicampur air liur, dapat menimbulkan luka menyakitkan; perilaku ini dipakai untuk pertahanan.

Mata besar dan gerak lambatnya membuat kukang tampak menggemaskan, dan justru daya tarik itu menjadi malapetaka. Kukang banyak diburu untuk perdagangan satwa peliharaan. Dalam perdagangan, giginya sering dipotong agar tidak melukai, tindakan yang menyakitkan dan sering berakibat infeksi serta kematian. Banyak individu yang disita tidak dapat dikembalikan ke alam dengan mudah.

Penilaian IUCN menempatkan kukang Jawa pada status Critically Endangered. Selain perdagangan, hilangnya hutan Jawa menekan populasinya. Reproduksi yang lambat memperburuk keadaan, karena populasi tidak dapat pulih cepat dari kehilangan.

Kukang Jawa menjadi contoh bagaimana popularitas di media sosial dapat membahayakan satwa liar. Video kukang yang tampak lucu kadang justru mendorong permintaan peliharaan. Perlindungannya menuntut penegakan hukum terhadap perdagangan sekaligus edukasi bahwa satwa berbisa dan liar ini bukan hewan peliharaan.`,
    keyTakeaway: "Kukang Jawa, primata berbisa yang bergerak lambat, terancam kritis terutama oleh perdagangan satwa peliharaan dan hilangnya hutan.",
    limitations: [
      "Data perdagangan bergantung pada penyitaan dan sulit diukur penuh.",
      "Status mengikuti penilaian IUCN dan dapat diperbarui.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "monyet-mentawai",
    synopsis: `Kepulauan Mentawai menyimpan beberapa primata yang tidak ada di tempat lain, hasil isolasi pulau yang lama. Bilou, owa kecil khas Mentawai, dan kerabatnya hidup di hutan yang menyusut. Perburuan dan penebangan menekan jenis-jenis ini, menjadikan Mentawai salah satu titik primata endemik paling rapuh di Indonesia.`,
    title: "Primata Mentawai, endemik pulau yang terisolasi",
    dek: "Kepulauan Mentawai menyimpan primata khas yang tidak ada di tempat lain, kini terancam.",
    category: "satwa",
    topics: ["primata Mentawai", "endemik", "pulau", "Sumatra"],
    geography: ["Mentawai", "Sumatra Barat"],
    sourceIds: ["iucn-red-list", "gbif-species"],
    confidence: "medium",
    body: `Kepulauan Mentawai di lepas pantai barat Sumatra terpisah dari daratan utama sejak lama. Isolasi panjang ini melahirkan sejumlah primata endemik yang tidak ditemukan di tempat lain, termasuk bilou, owa kecil khas Mentawai, serta beberapa jenis monyet dan langur yang hanya hidup di kepulauan ini. Mereka adalah contoh nyata bagaimana pulau menjadi laboratorium evolusi.

Primata Mentawai umumnya hidup di hutan dan bergantung pada tajuk yang menyambung untuk bergerak dan mencari makan. Karena wilayah hidupnya terbatas pada kepulauan yang tidak luas, tekanan terhadap hutan berdampak besar. Penebangan, pembukaan lahan, dan perburuan untuk daging menjadi ancaman utama.

Penilaian IUCN menempatkan beberapa primata Mentawai pada status terancam, sebagian bahkan tinggi. Endemisme yang membuat mereka istimewa juga membuat mereka rapuh: tidak ada populasi cadangan di pulau lain. Bila hutan Mentawai rusak, jenis-jenis ini tidak punya tempat untuk mundur.

Mentawai karena itu menjadi salah satu titik prioritas konservasi primata di Indonesia. Melindungi primata-primatanya menuntut menjaga hutan kepulauan sekaligus melibatkan masyarakat lokal yang punya hubungan budaya panjang dengan satwa ini. Kisah Mentawai mengingatkan bahwa sebagian kekayaan hayati paling unik Indonesia justru tersimpan di pulau-pulau kecil yang mudah terlewat.`,
    keyTakeaway: "Isolasi panjang Kepulauan Mentawai melahirkan primata endemik unik yang kini rapuh karena hutannya menyusut dan tak ada populasi cadangan.",
    limitations: [
      "Status berbeda antar jenis primata Mentawai; tidak dapat digeneralisasi.",
      "Data populasi untuk satwa kepulauan terpencil sering terbatas.",
    ],
    checkedAt: CHECKED,
  }),
];
