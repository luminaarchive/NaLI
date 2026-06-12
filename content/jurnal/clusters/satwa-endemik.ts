import { j } from "../_helper";

const CHECKED = "2026-06-12";

/**
 * Cluster: satwa endemik Indonesia. Setiap entri menumpang pada sumber yang
 * sudah ada di Arsip Sumber (penilaian IUCN, katalog GBIF, koleksi museum,
 * dan literatur) sehingga klaim status dan ekologi dapat diperiksa.
 */
export const satwaEndemik = [
  j({
    slug: "komodo-lima-pulau",
    title: "Komodo hanya hidup liar di segelintir pulau",
    dek: "Kadal terbesar dunia bertahan di sebaran yang sangat sempit di Nusa Tenggara Timur.",
    category: "satwa",
    topics: ["Komodo", "reptil", "endemik", "konservasi"],
    geography: ["Komodo", "Rinca", "Flores", "Nusa Tenggara Timur"],
    sourceIds: ["iucn-red-list-komodo", "komodo-unesco", "gbif-komodo-records"],
    confidence: "high",
    body: `Varanus komodoensis adalah kadal hidup terbesar di dunia, tetapi sebaran liarnya jauh lebih kecil daripada reputasinya. Populasi alami hanya ditemukan di sejumlah pulau di kawasan Nusa Tenggara Timur, terutama Komodo dan Rinca, dengan kantong yang lebih kecil di Flores bagian barat dan beberapa pulau satelit seperti Gili Motang dan Nusa Kode.

Sebaran sesempit ini membuat komodo rentan pada cara yang khas spesies pulau. Penilaian IUCN menempatkannya pada status Endangered, dengan tekanan yang mencakup hilangnya mangsa berkuku, perubahan habitat, dan dampak iklim yang dapat menggeser garis pantai serta zona dataran rendah tempat banyak individu hidup. Ketika seluruh populasi terkonsentrasi di area sempit, satu gangguan besar dapat berdampak pada bagian besar spesies sekaligus.

Komodo adalah predator puncak di pulaunya. Ia berburu rusa, babi hutan, dan bangkai, dan punya gigitan yang memadukan luka robek dengan kelenjar yang menurunkan tekanan darah mangsa. Peran sebagai pemangsa teratas membuatnya menjadi penanda kesehatan rantai makanan pulau: jika populasi mangsa berkuku merosot, komodo ikut tertekan.

Catatan keterdapatan dalam basis data keanekaragaman hayati membantu memetakan di pulau mana saja spesies ini benar-benar tercatat, bukan sekadar disebut. Status Taman Nasional Komodo sebagai Situs Warisan Dunia juga menambah lapisan perlindungan formal, meski perlindungan di atas kertas tidak otomatis menyelesaikan tekanan di lapangan.`,
    keyTakeaway:
      "Komodo bukan spesies yang tersebar luas; ia bertahan di sebaran sempit yang membuat setiap pulau menjadi penting.",
    limitations: [
      "Angka populasi dan status mengikuti penilaian IUCN dan dapat berubah pada survei terbaru.",
      "Batas sebaran di Flores perlu dirujuk ke data taman nasional dan survei lapangan resmi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "badak-jawa-satu-benteng",
    title: "Badak Jawa bergantung pada satu kawasan",
    dek: "Hampir seluruh populasi liar dunia terkonsentrasi di Ujung Kulon.",
    category: "satwa",
    topics: ["badak Jawa", "mamalia", "endemik", "konservasi"],
    geography: ["Ujung Kulon", "Banten", "Jawa"],
    sourceIds: ["iucn-red-list-badak-jawa", "ujung-kulon-unesco", "hoogerwerf-ujung-kulon-1970"],
    confidence: "high",
    body: `Rhinoceros sondaicus, badak bercula satu Jawa, adalah salah satu mamalia besar paling langka di dunia. Penilaian IUCN menempatkannya pada status Critically Endangered, dan populasi liar yang masih bertahan terkonsentrasi di Taman Nasional Ujung Kulon di ujung barat Jawa.

Konsentrasi di satu kawasan adalah inti kerentanannya. Tidak ada populasi penangkaran yang dapat menjadi cadangan cepat jika terjadi bencana. Letusan Anak Krakatau, tsunami, wabah penyakit, atau invasi tumbuhan yang mengurangi pakan dapat berdampak pada bagian besar populasi sekaligus. Itulah sebabnya banyak diskusi konservasi badak Jawa berputar pada gagasan menyiapkan habitat kedua agar telur tidak diletakkan dalam satu keranjang.

Badak Jawa adalah hewan hutan dataran rendah yang relatif soliter dan sulit diamati. Sebagian besar pemantauan modern bergantung pada kamera jebak, bukan perjumpaan langsung, sehingga data populasi dibangun dari identifikasi individu lewat ciri tubuh dan jejak. Catatan sejarah, termasuk monografi Hoogerwerf tentang Ujung Kulon, menunjukkan bahwa kawasan ini sudah lama menjadi benteng terakhir spesies tersebut.

Status Situs Warisan Dunia pada Ujung Kulon memberi pengakuan internasional, tetapi keselamatan badak Jawa tetap bergantung pada pengelolaan harian: pengendalian langkap yang menutup pakan, pengamanan dari perburuan, dan kesiapsiagaan terhadap bencana di kawasan yang berada dekat sistem vulkanik aktif.`,
    keyTakeaway:
      "Badak Jawa selamat sampai sekarang berkat satu kawasan, dan kerentanannya juga berasal dari ketergantungan pada satu titik itu.",
    limitations: [
      "Estimasi populasi berubah tiap survei; rujuk angka terbaru dari Balai Taman Nasional Ujung Kulon.",
      "Tulisan ini bersandar pada penilaian IUCN, dokumen UNESCO, dan literatur, bukan survei lapangan langsung.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "anoa-kerbau-kerdil-sulawesi",
    title: "Anoa, kerbau kerdil yang menyusut bersama hutannya",
    dek: "Mamalia endemik Sulawesi yang tertekan oleh fragmentasi habitat dan perburuan.",
    category: "satwa",
    topics: ["anoa", "mamalia", "endemik", "Sulawesi"],
    geography: ["Sulawesi"],
    sourceIds: ["iucn-lowland-anoa-2016", "asian-wild-cattle-anoa", "gbif-anoa-search"],
    confidence: "high",
    body: `Anoa adalah kerbau liar bertubuh kecil yang hanya ditemukan di Sulawesi dan beberapa pulau di sekitarnya. Ada dua bentuk yang dikenali, anoa dataran rendah dan anoa pegunungan, yang sama-sama jauh lebih kecil daripada kerbau biasa. Ukuran tubuh yang ringkas ini membuatnya sering disebut kerbau kerdil.

Penilaian IUCN menempatkan anoa dataran rendah pada status Endangered. Dua tekanan utama berulang dalam literatur: perburuan untuk daging dan hilangnya hutan akibat pembukaan lahan serta penebangan. Karena anoa cenderung soliter dan menyukai hutan yang relatif tidak terganggu, fragmentasi habitat memotong populasi menjadi kantong-kantong kecil yang lebih mudah punah secara lokal.

Sebagai satwa Wallacea, anoa adalah bagian dari kisah evolusi pulau yang khas. Sulawesi memisahkan banyak garis keturunan hewan dari daratan Asia maupun Australia, dan menghasilkan bentuk endemik yang tidak ditemukan di tempat lain. Anoa, bersama babirusa dan tarsius, menjadi penanda bahwa Sulawesi adalah laboratorium evolusi tersendiri.

Catatan keterdapatan di basis data keanekaragaman hayati membantu menunjukkan di bagian mana Sulawesi spesies ini pernah tercatat. Namun data lapangan untuk satwa pemalu seperti anoa sering tertinggal di belakang laju perubahan hutan, sehingga status sebenarnya di banyak lokasi masih perlu pemutakhiran survei.`,
    keyTakeaway:
      "Anoa adalah endemik Sulawesi yang nasibnya terikat erat pada keutuhan hutan tempatnya hidup.",
    limitations: [
      "Pembagian jenis dan status taksonomi anoa masih didiskusikan; rujuk penilaian terbaru.",
      "Data sebaran dari basis keterdapatan dapat tidak lengkap untuk satwa yang sulit diamati.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "babirusa-taring-melengkung",
    title: "Babirusa dan taring yang melengkung ke wajahnya sendiri",
    dek: "Satwa Wallacea dengan anatomi taring yang tidak ada bandingnya.",
    category: "satwa",
    topics: ["babirusa", "mamalia", "endemik", "Wallacea"],
    geography: ["Sulawesi", "Buru", "Maluku"],
    sourceIds: ["babirusa-redlist-doi", "iucn-wpsg-babirusa", "animal-diversity-web-babirusa"],
    confidence: "high",
    body: `Babirusa adalah salah satu mamalia paling aneh di Wallacea. Pada pejantan, taring atas tidak tumbuh ke bawah seperti babi biasa, melainkan menembus moncong dan melengkung ke atas ke arah wajah. Bentuk ini membuatnya menjadi ikon keanehan evolusi pulau, sekaligus teka-teki bagi ahli biologi tentang fungsi sebenarnya taring tersebut.

Babirusa hidup di Sulawesi dan beberapa pulau seperti Buru dan kepulauan Sula. Penilaian IUCN menempatkannya pada status terancam, dengan perburuan dan hilangnya habitat hutan sebagai tekanan utama. Karena daging babirusa diburu di sejumlah daerah dan hutannya menyusut, populasi liar berada di bawah tekanan yang berkelanjutan.

Secara ekologi, babirusa adalah penghuni hutan yang banyak menghabiskan waktu dekat sungai dan rawa. Ia omnivora, memakan buah, dedaunan, dan material lain yang ditemukan di lantai hutan. Seperti banyak satwa Wallacea, ia berperan dalam menyebarkan biji dan menjaga dinamika hutan tempatnya hidup.

Sebagai bagian dari fauna endemik Sulawesi, babirusa memperlihatkan bagaimana isolasi pulau menghasilkan garis keturunan yang sama sekali berbeda dari kerabat daratan. Taringnya yang melengkung bukan sekadar keanehan visual; ia adalah pengingat bahwa evolusi di pulau dapat mengambil jalur yang tidak terduga.`,
    keyTakeaway:
      "Babirusa adalah penanda evolusi pulau Wallacea, dengan anatomi unik dan status yang terancam perburuan serta hilangnya hutan.",
    limitations: [
      "Status dan pembagian jenis babirusa masih ditinjau; rujuk penilaian IUCN terbaru.",
      "Fungsi biologis taring melengkung belum sepenuhnya disepakati dalam literatur.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "tarsius-primata-malam-mungil",
    title: "Tarsius, primata mungil bermata raksasa",
    dek: "Pemburu malam Sulawesi yang seluruh tubuhnya dirancang untuk menangkap serangga dalam gelap.",
    category: "satwa",
    topics: ["tarsius", "primata", "endemik", "Sulawesi"],
    geography: ["Sulawesi"],
    sourceIds: ["iucn-tarsius-pdf", "tarsius-behavior-pmc", "mammaldiversity-tarsius-spectrumgurskyae"],
    confidence: "high",
    body: `Tarsius adalah primata kecil yang tubuhnya seakan dirakit khusus untuk berburu di malam hari. Matanya sangat besar dibanding kepala, bahkan setiap bola matanya kira-kira sebesar otaknya. Karena mata sebesar itu tidak bisa berputar banyak di rongganya, tarsius mengimbanginya dengan leher yang dapat memutar kepala nyaris ke belakang.

Hewan ini sepenuhnya pemakan hewan, terutama serangga, dan termasuk sedikit primata yang hampir tidak makan tumbuhan. Pada malam hari ia melompat di antara batang dengan kaki belakang yang panjang, lalu menangkap mangsa dengan gerakan cepat. Aktivitas nokturnal dan tubuh kecil membuatnya sulit diamati, sehingga banyak yang diketahui berasal dari studi perilaku yang sabar.

Sulawesi adalah pusat keanekaragaman tarsius, dengan beberapa jenis yang dibedakan antara lain lewat suara duet khas yang mereka nyanyikan saat fajar. Vokalisasi ini ternyata menjadi salah satu kunci untuk memisahkan jenis yang secara fisik mirip, sehingga jumlah spesies yang dikenali bertambah seiring penelitian.

Sebagai satwa endemik kawasan Wallacea, tarsius rentan pada hilangnya hutan dan gangguan habitat. Tubuh mungil dan kebutuhan akan vegetasi yang cukup membuat populasinya terikat pada keberadaan hutan yang masih berfungsi, baik di dataran rendah maupun perbukitan.`,
    keyTakeaway:
      "Tarsius adalah primata nokturnal endemik yang seluruh anatominya menyesuaikan diri untuk berburu serangga dalam gelap.",
    limitations: [
      "Jumlah jenis tarsius masih bertambah seiring riset vokal dan genetik; taksonomi belum final.",
      "Data populasi untuk satwa nokturnal kecil ini terbatas dan perlu survei lanjutan.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "maleo-burung-pengubur-telur",
    title: "Maleo, burung yang menitipkan telurnya pada panas bumi",
    dek: "Megapoda endemik Sulawesi yang tidak mengerami telurnya sendiri.",
    category: "satwa",
    topics: ["maleo", "burung", "endemik", "Sulawesi"],
    geography: ["Sulawesi"],
    sourceIds: ["iucn-red-list-maleo", "megapode-nesting-ecology", "gbif-maleo-search"],
    confidence: "high",
    body: `Maleo, Macrocephalon maleo, adalah burung endemik Sulawesi dengan strategi reproduksi yang tidak biasa. Alih-alih mengerami telur dengan panas tubuh, maleo mengubur telurnya di pasir pantai yang dihangatkan matahari atau di tanah yang dipanaskan aktivitas panas bumi. Panas dari luar itulah yang mengerami telur sampai menetas.

Telur maleo berukuran besar dibanding tubuh induknya. Saat menetas, anak maleo sudah cukup mandiri: ia menggali keluar dari timbunan, lalu langsung mampu terbang dan mencari makan tanpa pengasuhan induk. Strategi ini hemat dari sisi pengasuhan, tetapi membuat telur sangat bergantung pada lokasi bertelur yang tepat dan aman.

Penilaian IUCN menempatkan maleo pada status terancam. Dua tekanan menonjol: pengambilan telur oleh manusia dan hilangnya lokasi bertelur akibat perubahan penggunaan lahan di pantai dan kawasan panas bumi. Karena maleo kembali ke lokasi bertelur komunal yang spesifik, kerusakan satu lokasi dapat memukul reproduksi populasi setempat.

Sebagai megapoda, maleo termasuk kelompok burung yang memanfaatkan sumber panas eksternal untuk inkubasi, sebuah pola ekologi yang menarik sekaligus rapuh. Upaya konservasi sering berfokus pada perlindungan lokasi bertelur dan penetasan terkelola agar lebih banyak anak maleo mencapai usia mandiri.`,
    keyTakeaway:
      "Maleo bergantung pada panas bumi dan matahari untuk menetaskan telurnya, sehingga perlindungan lokasi bertelur menjadi kunci kelangsungannya.",
    limitations: [
      "Status dan tren populasi mengikuti penilaian IUCN dan dapat diperbarui.",
      "Keberhasilan penetasan terkelola berbeda antar lokasi dan perlu data lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "coelacanth-sulawesi-fosil-hidup",
    title: "Coelacanth Sulawesi, fosil hidup dari laut dalam",
    dek: "Ikan purba yang dikira punah ditemukan hidup di perairan dalam Indonesia.",
    category: "satwa",
    topics: ["coelacanth", "ikan", "laut dalam", "endemik"],
    geography: ["Sulawesi", "Manado", "Maluku Utara"],
    sourceIds: ["iucn-coelacanth-menadoensis", "coelacanth-indonesia-1998", "fishbase-latimeria-menadoensis"],
    confidence: "high",
    body: `Coelacanth adalah ikan bertubuh besar yang sempat dianggap hanya dikenal dari fosil berumur puluhan juta tahun, sampai spesimen hidup ditemukan pada abad ke-20. Indonesia memiliki jenisnya sendiri, Latimeria menadoensis, yang dikonfirmasi dari perairan dalam dekat Sulawesi pada akhir 1990-an dan kemudian juga tercatat di kawasan lain seperti Maluku Utara.

Julukan fosil hidup muncul karena coelacanth mempertahankan ciri tubuh yang mirip kerabat purbanya, termasuk sirip berdaging yang bergerak dengan pola khas. Ia hidup di kedalaman yang gelap dan dingin, sering di sekitar lereng vulkanik berbatu dan gua bawah laut, dan aktif pada malam hari. Karena habitatnya dalam, perjumpaan manusia dengan coelacanth hidup jarang dan biasanya tidak disengaja.

Penemuan jenis Indonesia memperluas pemahaman tentang sebaran coelacanth, yang sebelumnya lebih dikenal dari perairan sekitar Afrika timur. Keberadaan populasi di Indonesia menegaskan bahwa laut dalam Nusantara menyimpan garis keturunan kuno yang belum banyak dipelajari.

Status konservasi coelacanth Indonesia sulit dipastikan karena populasinya hidup dalam dan jarang teramati. Penilaian yang ada menekankan kehati-hatian: spesies dengan reproduksi lambat dan habitat sempit di laut dalam dapat sangat rentan pada gangguan, meski datanya terbatas.`,
    keyTakeaway:
      "Coelacanth Indonesia menunjukkan bahwa laut dalam Nusantara masih menyimpan garis keturunan purba yang nyaris tak teramati.",
    limitations: [
      "Data populasi coelacanth sangat terbatas karena habitatnya di laut dalam.",
      "Status konservasi mengikuti penilaian yang ada dan perlu pemutakhiran riset.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "orangutan-tapanuli-kera-besar-termuda",
    title: "Orangutan Tapanuli, spesies kera besar yang baru dikenali",
    dek: "Populasi kecil di Sumatra Utara yang dideskripsikan sebagai spesies tersendiri pada 2017.",
    category: "satwa",
    topics: ["orangutan", "primata", "endemik", "Sumatra"],
    geography: ["Batang Toru", "Sumatra Utara"],
    sourceIds: ["iucn-red-list-orangutan-tapanuli", "current-biology-tapanuli-2017", "conservation-science-practice-tapanuli-2019"],
    confidence: "high",
    body: `Pada 2017, sebuah studi mendeskripsikan Pongo tapanuliensis, orangutan Tapanuli, sebagai spesies kera besar yang berbeda dari orangutan Sumatra dan Kalimantan. Pengakuan ini menjadikannya salah satu spesies kera besar yang paling baru dikenali sains, sekaligus salah satu yang paling terancam sejak awal.

Orangutan Tapanuli hanya ditemukan di kawasan hutan Batang Toru di Sumatra Utara, dengan populasi yang diperkirakan sangat kecil. Pembedaan sebagai spesies tersendiri didukung bukti genetik, morfologi tengkorak dan gigi, serta perbedaan perilaku dan suara. Karena populasinya kecil dan terisolasi, setiap kehilangan habitat berdampak besar.

Penilaian IUCN menempatkan orangutan Tapanuli pada status Critically Endangered. Ancaman utama mencakup fragmentasi hutan, pembangunan infrastruktur, dan konversi lahan yang memutus konektivitas antar kelompok. Untuk spesies dengan reproduksi sangat lambat seperti orangutan, kehilangan individu dewasa sulit digantikan dalam waktu pendek.

Kasus Tapanuli menunjukkan dua hal sekaligus: keanekaragaman hayati Indonesia masih menyimpan kejutan taksonomi, dan kejutan itu sering datang bersama urgensi konservasi. Spesies yang baru dikenali ternyata sudah berada di ambang dengan ruang hidup yang sempit.`,
    keyTakeaway:
      "Orangutan Tapanuli adalah spesies kera besar yang baru dikenali pada 2017 dan langsung tergolong sangat terancam karena habitatnya yang sempit.",
    limitations: [
      "Estimasi populasi kecil dan sensitif terhadap metode survei.",
      "Status taksonomi didukung bukti kuat, tetapi tetap subjek kajian ilmiah lanjutan.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "cenderawasih-bulu-dan-perdagangan",
    title: "Cenderawasih, keindahan yang menjadi beban",
    dek: "Burung surga Papua yang bulunya membuatnya diburu lintas abad.",
    category: "satwa",
    topics: ["cenderawasih", "burung", "endemik", "Papua"],
    geography: ["Papua", "Papua Barat"],
    sourceIds: ["birdlife-red-bird-of-paradise", "cornell-west-papua-birds-of-paradise", "hunting-trade-birds-of-paradise-semanticscholar"],
    confidence: "medium",
    body: `Cenderawasih atau burung surga adalah kelompok burung yang terkenal karena bulu hias pejantan dan tarian kawin yang rumit. Banyak jenisnya terpusat di Papua dan pulau-pulau sekitarnya. Pejantan menampilkan warna dan bentuk bulu yang ekstrem, hasil seleksi seksual yang berlangsung lama, lalu memamerkannya di lokasi peragaan tertentu.

Keindahan itu sejak lama menjadi beban. Bulu cenderawasih diperdagangkan jauh sebelum era modern, dan permintaan global pada masa tertentu mendorong perburuan dalam jumlah besar. Hingga kini, perburuan untuk bulu, perdagangan, dan kebutuhan adat tetap menjadi salah satu tekanan, di samping hilangnya hutan tempat mereka hidup dan berbiak.

Secara ekologi, banyak cenderawasih bergantung pada hutan yang sehat untuk pakan buah dan lokasi peragaan. Karena sistem kawin yang memusat pada pejantan tertentu, gangguan pada lokasi peragaan dapat berdampak besar pada reproduksi. Status konservasi berbeda antar jenis: sebagian tergolong relatif aman, sebagian lain lebih tertekan.

Cenderawasih menjadi contoh bagaimana daya tarik visual sebuah satwa dapat berbalik merugikan. Perlindungan yang efektif memerlukan kombinasi penjagaan habitat, pengendalian perdagangan, dan keterlibatan masyarakat yang punya hubungan budaya panjang dengan burung ini.`,
    keyTakeaway:
      "Bulu cenderawasih yang memikat justru menjadikannya sasaran perburuan dan perdagangan lintas abad.",
    limitations: [
      "Status konservasi berbeda antar jenis cenderawasih; tidak dapat digeneralisasi.",
      "Data perdagangan dan perburuan sering tidak lengkap dan perlu pembaruan.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "harimau-jawa-status-punah",
    title: "Harimau Jawa dan beban membuktikan kepunahan",
    dek: "Dinyatakan punah, tetapi klaim kemunculan terus memerlukan bukti yang dapat diperiksa.",
    category: "satwa",
    topics: ["harimau Jawa", "mamalia", "kepunahan", "Jawa"],
    geography: ["Jawa"],
    sourceIds: ["iucn-red-list-harimau-jawa", "harimau-jawa-oryx-2024", "harimau-jawa-oryx-rebuttal-2024"],
    confidence: "medium",
    body: `Harimau Jawa, Panthera tigris sondaica, lama dianggap punah. Penilaian konservasi menempatkannya sebagai punah setelah perjumpaan yang dapat dipercaya menghilang pada paruh kedua abad ke-20. Hilangnya hutan dataran rendah Jawa dan perburuan menghapus ruang hidup predator besar ini di pulau yang menjadi salah satu terpadat di dunia.

Pada 2024, sebuah studi memunculkan kembali perdebatan dengan menganalisis sehelai rambut yang dikumpulkan pada 2019 dan menyimpulkan kemiripan genetik dengan harimau Jawa. Klaim ini menarik, tetapi tidak otomatis berarti populasi yang hidup. Tanggapan ilmiah lain mengingatkan kemungkinan masalah seperti kontaminasi, kualitas sampel, atau sekuens mitokondria semu, sehingga satu sampel belum cukup untuk membalik status kepunahan.

Kasus ini memperlihatkan prinsip penting: membuktikan sebuah spesies masih hidup menuntut bukti yang dapat diperiksa ulang, idealnya berlapis, seperti foto kamera jebak, jejak, mangsa, dan sampel genetik yang bersih dengan rantai bukti jelas. Tanpa itu, kemunculan tetap berada di wilayah dugaan, bukan kepastian.

Harimau Jawa karena itu menjadi contoh bagaimana status konservasi bukan hanya soal harapan, melainkan soal beban bukti. Status resmi tetap punah sampai ada bukti hidup yang memenuhi standar verifikasi, dan kehati-hatian di sini melindungi sains sekaligus upaya konservasi nyata.`,
    keyTakeaway:
      "Harimau Jawa berstatus punah, dan klaim kemunculan kembali memerlukan bukti berlapis yang dapat diperiksa, bukan satu sampel tunggal.",
    limitations: [
      "Studi 2024 dan tanggapannya masih menjadi perdebatan ilmiah terbuka.",
      "Status resmi mengikuti penilaian konservasi dan dapat berubah jika bukti kuat muncul.",
    ],
    checkedAt: CHECKED,
  }),
];
