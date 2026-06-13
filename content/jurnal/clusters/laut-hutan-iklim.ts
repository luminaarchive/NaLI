import { j } from "../_helper";

const CHECKED = "2026-06-12";

/**
 * Cluster: laut, hutan, pesisir, dan iklim Indonesia. Menumpang pada dataset
 * dan laporan lembaga yang sudah ada di Arsip Sumber (NOAA, IPCC, Global Forest
 * Watch, Global Mangrove Watch, WRI, dan literatur ilmiah).
 */
export const lautHutanIklim = [
  j({
    slug: "segitiga-terumbu-karang-dunia",
    synopsis: `Perairan Indonesia berada di jantung Segitiga Terumbu Karang, dengan keanekaragaman karang tertinggi di dunia. Terumbu yang sehat menopang perikanan dan melindungi pesisir dari gelombang. Posisi ini membawa tanggung jawab sekaligus kerentanan, karena tekanan pada karang di sini berdampak jauh melampaui Indonesia.`,
    title: "Indonesia di jantung Segitiga Terumbu Karang",
    dek: "Perairan Nusantara menyimpan keanekaragaman karang tertinggi di planet ini.",
    category: "laut",
    topics: ["terumbu karang", "biodiversitas", "laut", "Coral Triangle"],
    geography: ["Indonesia", "Coral Triangle"],
    sourceIds: ["wri-reefs-risk-coral-triangle", "cti-cff-reefs-risk", "noaa-coral-reef-watch"],
    confidence: "high",
    body: `Indonesia berada di jantung kawasan yang dikenal sebagai Coral Triangle atau Segitiga Terumbu Karang, wilayah laut yang mencakup beberapa negara di Asia Tenggara dan Pasifik. Kawasan ini memiliki keanekaragaman karang dan ikan karang tertinggi di dunia, dengan ratusan jenis karang keras hidup berdampingan.

Keanekaragaman setinggi itu bukan kebetulan. Pertemuan arus, banyaknya pulau, dan rentang habitat dari laguna dangkal hingga lereng dalam menciptakan banyak ruang hidup. Terumbu karang yang sehat menopang perikanan, melindungi pesisir dari gelombang, dan menjadi tumpuan ekonomi pariwisata serta pangan bagi jutaan orang.

Namun terumbu di kawasan ini menghadapi tekanan tinggi. Laporan penilaian risiko menyoroti penangkapan ikan berlebih, praktik penangkapan merusak, pencemaran dari darat, dan pemanasan laut. Ketika suhu laut naik melewati ambang, karang dapat mengalami pemutihan, kehilangan alga simbiotiknya, dan mati jika stres berlangsung lama.

Posisi Indonesia di pusat Coral Triangle berarti tanggung jawab sekaligus kerentanan. Apa yang terjadi pada terumbu di sini berdampak pada keanekaragaman laut global, sementara komunitas pesisir Indonesia sangat bergantung pada kesehatan karang untuk pangan dan perlindungan.`,
    keyTakeaway:
      "Sebagai inti Coral Triangle, perairan Indonesia menyimpan keanekaragaman karang tertinggi dunia sekaligus menghadapi tekanan besar.",
    limitations: [
      "Tingkat risiko berbeda antar lokasi dan perlu data pemantauan lokal.",
      "Angka jumlah jenis bergantung pada metode survei dan terus diperbarui.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "pemutihan-karang-dan-suhu-laut",
    synopsis: `Karang hidup bersama alga renik yang memberinya energi dan warna. Ketika laut terlalu panas terlalu lama, hubungan itu putus dan karang memutih. Belum tentu mati, tetapi kelaparan dan rentan. Pemutihan adalah sinyal langsung bahwa perubahan iklim sudah menyentuh laut yang menopang banyak orang.`,
    title: "Pemutihan karang adalah sinyal stres panas",
    dek: "Karang memutih ketika kehilangan alga simbiotik akibat suhu laut yang terlalu tinggi.",
    category: "laut",
    topics: ["pemutihan karang", "iklim", "terumbu karang", "suhu laut"],
    geography: ["Indonesia"],
    sourceIds: ["noaa-coral-reef-watch", "ipcc-srocc-coral-reefs", "wri-reefs-risk-global"],
    confidence: "high",
    body: `Karang keras yang membangun terumbu hidup bersama alga renik bernama zooxanthellae di dalam jaringannya. Alga ini melakukan fotosintesis dan memberi karang sebagian besar energinya, sekaligus warna-warni yang kita lihat. Hubungan simbiotik ini adalah dasar dari terumbu yang sehat.

Ketika suhu laut naik melewati ambang toleransi selama beberapa waktu, hubungan itu terganggu. Karang mengusir atau kehilangan alga simbiotiknya, lalu jaringannya menjadi bening sehingga rangka kapur putih di bawahnya terlihat. Inilah pemutihan karang. Karang yang memutih belum tentu mati, tetapi ia kelaparan dan rentan; jika stres panas berlanjut, kematian massal dapat terjadi.

Lembaga pemantau memakai data suhu permukaan laut untuk memperkirakan tekanan panas pada terumbu dan mengeluarkan peringatan. Laporan iklim global juga menempatkan terumbu karang sebagai salah satu ekosistem paling terancam oleh pemanasan, karena ambang toleransinya relatif sempit.

Bagi Indonesia yang kaya terumbu, pemutihan karang adalah sinyal langsung bahwa perubahan iklim bukan persoalan jauh. Suhu laut yang menghangat menyentuh ekosistem yang menopang perikanan dan perlindungan pesisir, sehingga kesehatan karang menjadi salah satu indikator dampak iklim yang paling nyata.`,
    keyTakeaway:
      "Pemutihan karang terjadi saat suhu laut terlalu tinggi memutus simbiosis karang dengan alganya, sebuah sinyal langsung tekanan iklim.",
    limitations: [
      "Tidak semua karang yang memutih mati; pemulihan mungkin jika stres mereda.",
      "Ambang suhu berbeda antar jenis karang dan lokasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "mangrove-karbon-biru",
    synopsis: `Mangrove menyimpan karbon dalam jumlah besar, terutama di tanah berlumpurnya yang dalam, bukan hanya di pohonnya. Ia juga meredam gelombang dan menjadi tempat asuhan ikan. Karena itu merusaknya melepas karbon yang lama terkunci, sementara memulihkannya butuh lebih dari sekadar menancapkan bibit.`,
    title: "Mangrove menyimpan karbon biru dalam jumlah besar",
    dek: "Hutan bakau mengunci karbon di tanahnya jauh lebih banyak per luas daripada banyak hutan darat.",
    category: "pesisir",
    topics: ["mangrove", "karbon biru", "pesisir", "iklim"],
    geography: ["Indonesia"],
    sourceIds: ["global-mangrove-watch", "mangrove-blue-carbon", "mangrove-conservation-restoration-indonesia-pmc"],
    confidence: "high",
    body: `Mangrove atau hutan bakau tumbuh di zona peralihan antara darat dan laut, di pesisir berlumpur yang tergenang pasang surut. Indonesia memiliki sebagian besar luas mangrove dunia, menjadikannya salah satu pemain utama dalam ekosistem ini secara global.

Salah satu nilai penting mangrove adalah kemampuannya menyimpan karbon, sering disebut karbon biru. Sebagian besar karbon ini tersimpan bukan hanya pada pohon, melainkan pada tanah berlumpur yang dalam dan kaya bahan organik yang terawetkan karena kondisi miskin oksigen. Per satuan luas, mangrove dapat menyimpan karbon dalam jumlah sangat besar, sehingga perusakannya melepaskan karbon yang telah terkunci lama.

Selain menyimpan karbon, mangrove melindungi pesisir dari gelombang dan erosi, menjadi tempat asuhan bagi ikan dan udang, serta menopang mata pencarian masyarakat pesisir. Akarnya yang rumit meredam energi gelombang dan menahan sedimen, sehingga garis pantai lebih stabil.

Karena perannya ganda untuk iklim dan pesisir, mangrove menjadi fokus konservasi dan restorasi. Namun menanam kembali mangrove tidak sesederhana menancapkan bibit; keberhasilan bergantung pada hidrologi, jenis yang tepat, dan kondisi tanah, sehingga restorasi yang gegabah bisa gagal.`,
    keyTakeaway:
      "Mangrove menyimpan karbon biru dalam jumlah besar terutama di tanahnya, sekaligus melindungi pesisir, sehingga sangat bernilai untuk iklim.",
    limitations: [
      "Estimasi luas dan simpanan karbon bergantung pada metode dan terus diperbarui.",
      "Keberhasilan restorasi sangat bergantung pada kondisi lokal.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "gambut-karbon-dan-api",
    synopsis: `Selama basah, lahan gambut mengunci karbon yang menumpuk ribuan tahun. Begitu dikeringkan untuk lahan, ia menjadi sangat mudah terbakar, apinya menjalar di bawah permukaan dan melepas asap pekat. Menjaga gambut tetap basah adalah strategi iklim sekaligus perlindungan kesehatan publik.`,
    title: "Lahan gambut: gudang karbon yang mudah terbakar",
    dek: "Gambut menyimpan karbon raksasa, tetapi pengeringan membuatnya rawan kebakaran dan kabut asap.",
    category: "hutan",
    topics: ["gambut", "kebakaran", "karbon", "kabut asap"],
    geography: ["Sumatra", "Kalimantan"],
    sourceIds: ["indonesia-peat-fires-acp-2019", "unredd-peatland-fires-indonesia", "pnas-indonesia-fire-elnino-2016"],
    confidence: "high",
    body: `Lahan gambut terbentuk dari sisa tumbuhan yang tidak terurai sempurna karena tergenang air, menumpuk selama ribuan tahun menjadi lapisan kaya karbon. Indonesia memiliki lahan gambut tropis yang luas, terutama di Sumatra dan Kalimantan, yang menyimpan karbon dalam jumlah sangat besar.

Selama gambut tetap basah, karbon itu relatif aman terkunci. Masalah muncul ketika gambut dikeringkan, misalnya melalui kanal untuk perkebunan atau pertanian. Gambut kering menjadi sangat mudah terbakar, dan apinya dapat menjalar di bawah permukaan, sulit dipadamkan, serta menyala lama. Kebakaran gambut melepaskan karbon dalam jumlah besar dan menghasilkan kabut asap pekat.

Tahun-tahun dengan El Nino yang kering, seperti 2015, dikaitkan dengan kebakaran gambut yang parah dan kabut asap lintas batas yang berdampak pada kesehatan jutaan orang. Studi memperlihatkan hubungan antara kekeringan, pengeringan lahan, dan ledakan titik api.

Karena itu, menjaga gambut tetap basah adalah strategi iklim sekaligus kesehatan publik. Pemulihan tata air, penutupan kanal, dan pencegahan pembukaan lahan dengan api menjadi kunci agar gudang karbon ini tidak berubah menjadi sumber emisi dan asap.`,
    keyTakeaway:
      "Gambut menyimpan karbon raksasa selama basah; pengeringan membuatnya rawan terbakar, melepaskan karbon dan kabut asap.",
    limitations: [
      "Estimasi emisi kebakaran bervariasi antar metode dan tahun.",
      "Dampak kesehatan kabut asap bergantung pada paparan dan lokasi.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "deforestasi-dipantau-satelit",
    synopsis: `Dulu mengukur hilangnya hutan butuh survei lapangan yang lambat. Kini citra satelit membuat deforestasi bisa dipantau secara terbuka, termasuk di Kalimantan. Datanya kuat untuk memeriksa klaim, tetapi tetap perlu verifikasi lapangan, karena hilangnya tutupan pohon tidak selalu berarti hutan alam yang lenyap.`,
    title: "Hilangnya hutan kini bisa dipantau dari satelit",
    dek: "Data tutupan pohon global memungkinkan pelacakan deforestasi secara terbuka.",
    category: "hutan",
    topics: ["deforestasi", "hutan", "data terbuka", "satelit"],
    geography: ["Kalimantan", "Sumatra", "Indonesia"],
    sourceIds: ["global-forest-watch-indonesia", "hansen-global-forest-change-2013", "gfw-kalimantan-barat"],
    confidence: "high",
    body: `Dulu, mengetahui seberapa banyak hutan hilang di sebuah wilayah memerlukan survei lapangan yang lambat dan terbatas. Kini, citra satelit yang diolah menjadi data tutupan pohon global memungkinkan siapa pun memantau kehilangan hutan dari waktu ke waktu, termasuk di Indonesia.

Dataset perubahan tutupan pohon global memetakan di mana pohon hilang dan, sebagian, di mana pohon bertambah. Platform terbuka membuat data ini dapat diakses publik, peneliti, dan jurnalis, sehingga klaim tentang deforestasi dapat diperiksa dengan bukti spasial, bukan sekadar pernyataan.

Untuk Indonesia, alat ini penting karena hutan tropisnya luas dan tekanannya tinggi, dari perkebunan hingga pertambangan. Kalimantan, misalnya, memperlihatkan pola kehilangan hutan yang dapat dilacak per wilayah dan tahun. Data ini membantu mengaitkan kehilangan hutan dengan kebijakan, harga komoditas, dan dinamika lahan.

Namun data satelit punya batas. Ia menunjukkan kehilangan tutupan pohon, tetapi tidak selalu membedakan hutan alam dari kebun, atau penyebab pasti di lapangan. Karena itu, data terbuka paling kuat ketika dipadukan dengan pengetahuan lokal dan verifikasi, bukan dipakai sebagai vonis tunggal.`,
    keyTakeaway:
      "Data tutupan pohon dari satelit membuat deforestasi Indonesia dapat dipantau secara terbuka, meski tetap perlu diverifikasi di lapangan.",
    limitations: [
      "Kehilangan tutupan pohon tidak selalu berarti deforestasi hutan alam.",
      "Penyebab di lapangan perlu verifikasi tambahan di luar citra satelit.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "sampah-plastik-laut-indonesia",
    synopsis: `Indonesia sering disebut penyumbang besar plastik laut, tetapi angka itu berasal dari model, bukan timbangan langsung di laut. Masalahnya tetap nyata: pengelolaan sampah yang belum memadai dan sungai yang membawa plastik dari darat ke laut. Membacanya jujur berarti memisahkan estimasi dari kepastian.`,
    title: "Plastik laut: masalah data dan kebijakan",
    dek: "Indonesia kerap disebut penyumbang besar sampah plastik laut, tetapi angkanya adalah estimasi.",
    category: "laut",
    topics: ["sampah plastik", "laut", "kebijakan", "pencemaran"],
    geography: ["Indonesia"],
    sourceIds: ["jambeck-plastic-waste-science-2015", "world-bank-marine-debris-hotspot", "duke-plastic-policy-indonesia"],
    confidence: "medium",
    body: `Indonesia sering disebut sebagai salah satu penyumbang terbesar sampah plastik ke laut. Penyebutan ini berasal dari studi yang memperkirakan aliran plastik dari darat ke laut berdasarkan jumlah penduduk pesisir, timbulan sampah, dan tingkat pengelolaan. Penting dipahami bahwa angka semacam ini adalah estimasi pemodelan, bukan hasil penimbangan langsung sampah di laut.

Estimasi tetap berguna karena menunjukkan skala dan mendorong kebijakan, tetapi ia juga bergantung pada asumsi yang dapat diperbarui. Studi dan tinjauan yang lebih baru memperbaiki metode dan kadang mengubah peringkat antarnegara. Karena itu, mengutip satu peringkat sebagai fakta tetap dapat menyesatkan jika tidak menyebut ketidakpastiannya.

Yang lebih jelas adalah akar masalahnya: pengelolaan sampah yang belum memadai di banyak wilayah, konsumsi plastik sekali pakai, dan keterbatasan infrastruktur daur ulang. Sungai berperan besar membawa sampah dari daratan ke laut, sehingga titik intervensi sering berada jauh dari pantai.

Kebijakan yang efektif menyasar hulu: pengurangan plastik sekali pakai, perbaikan sistem pengumpulan, dan tanggung jawab produsen. Membaca isu ini dengan jujur berarti memisahkan angka estimasi dari kepastian, sambil tetap mengakui bahwa pencemaran plastik adalah masalah nyata yang perlu ditangani.`,
    keyTakeaway:
      "Status Indonesia sebagai penyumbang besar plastik laut berasal dari estimasi model; masalahnya nyata, tetapi angkanya perlu dibaca dengan hati-hati.",
    limitations: [
      "Peringkat antarnegara berubah seiring perbaikan metode dan data.",
      "Estimasi aliran plastik bukan pengukuran langsung di laut.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "jakarta-penurunan-tanah",
    synopsis: `Banjir pesisir Jakarta sering dikira hanya soal laut yang naik. Padahal di banyak titik tanahnya turun lebih cepat, terutama karena air tanah disedot berlebihan. Tanggul saja tidak cukup jika tanah terus amblas. Memisahkan dua proses ini penting agar solusinya menyasar penyebab yang tepat.`,
    title: "Sebagian Jakarta turun lebih cepat dari naiknya laut",
    dek: "Penurunan muka tanah, bukan hanya kenaikan laut, memperparah banjir di pesisir Jakarta.",
    category: "iklim",
    topics: ["penurunan tanah", "Jakarta", "banjir", "air tanah"],
    geography: ["Jakarta", "Jawa"],
    sourceIds: ["jakarta-subsidence-abidin-2015", "jakarta-groundwater-jica-context", "world-bank-jakarta-urban-context"],
    confidence: "high",
    body: `Ketika orang membahas Jakarta dan air, perhatian sering tertuju pada kenaikan muka laut. Padahal di banyak titik, masalah yang lebih cepat adalah penurunan muka tanah atau land subsidence. Sebagian wilayah Jakarta utara tercatat turun beberapa sentimeter per tahun, laju yang dapat melampaui kenaikan laut global.

Salah satu pendorong utama adalah pengambilan air tanah yang berlebihan. Ketika air disedot dari lapisan tanah lebih cepat daripada pengisian alaminya, pori tanah memadat dan permukaan turun. Beban bangunan dan kondisi geologi cekungan Jakarta ikut berperan. Akibatnya, tanah turun, sementara laut relatif naik, dan keduanya bersama-sama memperparah banjir rob.

Pemahaman ini mengubah cara membaca solusi. Tanggul laut dapat menahan air untuk sementara, tetapi jika tanah terus turun, masalahnya berpindah, bukan hilang. Mengurangi pengambilan air tanah dengan menyediakan pasokan air perpipaan yang andal menjadi bagian penting dari penanganan jangka panjang.

Kasus Jakarta menunjukkan bahwa bencana pesisir sering merupakan gabungan beberapa proses. Memisahkan penurunan tanah dari kenaikan laut penting agar kebijakan menyasar penyebab yang tepat, bukan hanya gejala yang paling terlihat.`,
    keyTakeaway:
      "Banjir pesisir Jakarta diperparah penurunan muka tanah akibat pengambilan air tanah, bukan hanya kenaikan laut.",
    limitations: [
      "Laju penurunan berbeda antar lokasi dan waktu; rujuk pengukuran terbaru.",
      "Kontribusi tiap faktor bervariasi dan terus dikaji.",
    ],
    checkedAt: CHECKED,
  }),
  j({
    slug: "citarum-sungai-dan-pencemaran",
    synopsis: `Citarum menopang pertanian, air baku, dan listrik, tetapi juga menanggung limbah industri dan rumah tangga di sepanjang alirannya. Memulihkannya bukan proyek sekali jadi, melainkan tata kelola panjang. Klaim keberhasilan perlu dibaca dengan data kualitas air, bukan sekadar perubahan yang tampak di permukaan.`,
    title: "Citarum dan beban pencemaran industri",
    dek: "Sungai penting Jawa Barat yang lama menanggung limbah dan menjadi ujian tata kelola.",
    category: "perairan",
    topics: ["Citarum", "sungai", "pencemaran", "kebijakan"],
    geography: ["Citarum", "Jawa Barat"],
    sourceIds: ["citarum-water-quality-report", "perpres-15-2018-citarum", "world-bank-citarum-context"],
    confidence: "medium",
    body: `Sungai Citarum di Jawa Barat adalah salah satu sungai terpenting di Indonesia. Ia menopang pertanian, air baku, dan pembangkit listrik, sekaligus melewati kawasan industri dan permukiman padat. Kombinasi itu membuat Citarum menanggung beban pencemaran berat dari limbah industri, domestik, dan sampah.

Laporan kualitas air mencatat masalah seperti bahan pencemar organik, logam, dan limbah tekstil di sejumlah ruas. Pencemaran ini berdampak pada kesehatan, perikanan, dan biaya pengolahan air. Citarum sering dijadikan contoh bagaimana tekanan pembangunan dapat melampaui kapasitas sungai untuk memulihkan diri.

Pemerintah meluncurkan program penanganan terpadu dengan dasar regulasi khusus untuk memulihkan Citarum, melibatkan banyak instansi. Pendekatan ini mencakup penertiban limbah, pengelolaan sampah, dan rehabilitasi. Hasilnya beragam menurut ruas dan waktu, dan pemantauan berkelanjutan diperlukan untuk menilai kemajuan secara jujur.

Citarum memperlihatkan bahwa memulihkan sungai bukan proyek sekali jadi, melainkan tata kelola jangka panjang yang melibatkan industri, warga, dan pemerintah. Klaim keberhasilan perlu dibaca dengan data kualitas air yang konsisten, bukan sekadar perubahan tampak di permukaan.`,
    keyTakeaway:
      "Citarum menanggung pencemaran berat dari industri dan permukiman, menjadikannya ujian tata kelola sungai jangka panjang.",
    limitations: [
      "Kualitas air berbeda antar ruas dan waktu; rujuk pemantauan terbaru.",
      "Klaim keberhasilan program perlu didukung data kualitas air yang konsisten.",
    ],
    checkedAt: CHECKED,
  }),
];
