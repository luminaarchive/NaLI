// One-off: inject `synopsis` and `cover` (partial) into each Jurnal entry in the
// cluster files, anchored on the unique `slug:` line. Idempotent: skips entries
// that already have a synopsis.
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "jurnal", "clusters");

// type: "map" for species range maps, "timeline" for the forest entry, else "diagram".
const META = {
  "komodo-lima-pulau": {
    syn: `Komodo bukan satwa yang tersebar luas. Ia hanya hidup liar di Komodo, Rinca, dan sudut barat Flores. Sebaran sesempit itu membuat setiap pulau berharga: satu wabah, kebakaran, atau perubahan garis pantai bisa memukul bagian besar populasinya sekaligus. Reputasinya besar, tetapi ruang hidupnya justru sangat kecil.`,
    type: "map", title: "Sebaran Komodo di Nusantara",
    alt: "Peta sederhana Nusantara dengan wilayah sebaran komodo di Nusa Tenggara Timur disorot.",
    caption: "Peta sebaran komodo pada skema Nusantara.",
  },
  "badak-jawa-satu-benteng": {
    syn: `Hampir semua badak Jawa yang tersisa berkumpul di satu kawasan, Ujung Kulon, dan tidak ada cadangan di kebun binatang. Itu sebabnya bencana tunggal, dari letusan Anak Krakatau sampai wabah penyakit, terasa begitu menakutkan. Benteng terakhir tetaplah satu titik, dan satu titik selalu lebih rapuh daripada banyak titik.`,
    type: "map", title: "Badak Jawa di Ujung Kulon",
    alt: "Peta sederhana Nusantara dengan kawasan Ujung Kulon di ujung barat Jawa disorot.",
    caption: "Peta benteng terakhir badak Jawa di ujung barat Jawa.",
  },
  "anoa-kerbau-kerdil-sulawesi": {
    syn: `Anoa adalah kerbau liar bertubuh kecil yang hanya ada di Sulawesi. Nasibnya menempel pada hutan. Ketika hutan terpotong-potong oleh pembukaan lahan dan perburuan terus berjalan, populasinya menyusut menjadi kantong-kantong kecil yang lebih mudah hilang satu per satu. Endemik ini tidak punya tempat lain untuk pindah.`,
    type: "map", title: "Anoa, endemik Sulawesi",
    alt: "Peta sederhana Nusantara dengan pulau Sulawesi disorot sebagai sebaran anoa.",
    caption: "Peta sebaran anoa yang terbatas di Sulawesi.",
  },
  "babirusa-taring-melengkung": {
    syn: `Taring pejantan babirusa menembus moncong dan melengkung ke arah wajahnya sendiri, anatomi yang tidak ada bandingnya. Di balik keanehan itu ada satwa Wallacea yang diburu dan kehilangan hutan tempat hidupnya. Bentuknya memikat banyak orang, tetapi tekanan terhadap populasinya nyata dan terus berjalan dari tahun ke tahun.`,
    type: "map", title: "Babirusa di Wallacea",
    alt: "Peta sederhana Nusantara dengan Sulawesi dan Maluku disorot sebagai sebaran babirusa.",
    caption: "Peta sebaran babirusa di kawasan Wallacea.",
  },
  "tarsius-primata-malam-mungil": {
    syn: `Mata tarsius begitu besar sampai tidak bisa berputar di rongganya, jadi lehernya yang memutar kepala nyaris ke belakang. Primata mungil ini berburu serangga sepanjang malam dan hampir tidak makan tumbuhan. Tubuh sekecil itu membuatnya bergantung penuh pada hutan yang masih utuh untuk bisa bertahan hidup.`,
    type: "map", title: "Tarsius, primata malam",
    alt: "Peta sederhana Nusantara dengan Sulawesi disorot sebagai pusat keanekaragaman tarsius.",
    caption: "Peta pusat keanekaragaman tarsius di Sulawesi.",
  },
  "maleo-burung-pengubur-telur": {
    syn: `Maleo tidak mengerami telurnya seperti burung kebanyakan. Ia menitipkannya pada panas pasir pantai atau tanah vulkanik, dan anak yang menetas langsung mandiri. Pola reproduksi ini hemat, tetapi membuat lokasi bertelur menjadi titik paling rentan dalam hidupnya, terutama ketika pantai dan kawasan panas bumi berubah.`,
    type: "map", title: "Maleo, megapoda Sulawesi",
    alt: "Peta sederhana Nusantara dengan Sulawesi disorot sebagai sebaran maleo.",
    caption: "Peta sebaran maleo, burung pengubur telur dari Sulawesi.",
  },
  "coelacanth-sulawesi-fosil-hidup": {
    syn: `Coelacanth pernah dikira hanya dikenal dari fosil sampai ditemukan hidup. Indonesia punya jenisnya sendiri di laut dalam dekat Sulawesi. Hidup di kegelapan yang dingin membuatnya nyaris tak teramati, dan justru karena itu kita sadar betapa sedikit yang benar-benar dipahami tentang laut dalam Nusantara.`,
    type: "map", title: "Coelacanth laut dalam",
    alt: "Peta sederhana Nusantara dengan perairan Sulawesi dan Maluku Utara disorot.",
    caption: "Peta perairan tempat coelacanth Indonesia tercatat.",
  },
  "orangutan-tapanuli-kera-besar-termuda": {
    syn: `Baru pada 2017 sains mengakui orangutan Tapanuli sebagai spesies kera besar tersendiri. Sejak awal ia sudah sangat terancam karena populasinya kecil dan hanya ada di kawasan Batang Toru. Penemuan ini menunjukkan keanekaragaman Indonesia masih menyimpan kejutan, sering datang bersamaan dengan urgensi menyelamatkannya.`,
    type: "map", title: "Orangutan Tapanuli, Sumatra Utara",
    alt: "Peta sederhana Nusantara dengan Sumatra Utara disorot sebagai habitat orangutan Tapanuli.",
    caption: "Peta habitat sempit orangutan Tapanuli di Sumatra Utara.",
  },
  "cenderawasih-bulu-dan-perdagangan": {
    syn: `Keindahan bulu cenderawasih justru menjadi bebannya. Sejak lama bulunya diperdagangkan, dan perburuan masih membayangi sebagian jenis di samping hilangnya hutan. Sistem kawin yang memusat pada lokasi peragaan tertentu membuat gangguan kecil pun bisa berdampak besar pada keberhasilan reproduksinya di alam.`,
    type: "map", title: "Cenderawasih di Papua",
    alt: "Peta sederhana Nusantara dengan Papua disorot sebagai pusat sebaran cenderawasih.",
    caption: "Peta pusat sebaran cenderawasih di Papua.",
  },
  "harimau-jawa-status-punah": {
    syn: `Harimau Jawa dinyatakan punah, dan satu sampel rambut tidak cukup untuk membatalkannya. Membuktikan sebuah spesies masih hidup menuntut bukti berlapis yang bisa diperiksa ulang, dari kamera jebak sampai genetik bersih. Kasus ini bukan soal harapan, melainkan soal beban bukti yang dijaga tetap jujur.`,
    type: "map", title: "Harimau Jawa, status punah",
    alt: "Peta sederhana Nusantara dengan pulau Jawa disorot sebagai bekas sebaran harimau Jawa.",
    caption: "Peta bekas sebaran harimau Jawa yang kini dinyatakan punah.",
  },

  "tsunami-vulkanik-tanpa-gempa": {
    syn: `Banyak orang menunggu gempa sebagai tanda tsunami. Selat Sunda 2018 menunjukkan laut bisa bergerak tanpa itu: sebagian tubuh Anak Krakatau runtuh ke laut dan mendorong gelombang. Bagi pesisir wisata pada malam hari, celah pemahaman ini bisa berarti hilangnya waktu berharga untuk menyelamatkan diri.`,
    type: "diagram", title: "Tsunami vulkanik tanpa gempa",
    alt: "Diagram profil gunung api laut dengan sisi tubuh runtuh dan gelombang menyebar ke pantai.",
    caption: "Diagram mekanisme tsunami akibat runtuhnya sisi gunung api.",
  },
  "toba-letusan-super": {
    syn: `Danau Toba yang tenang adalah bekas letusan super sekitar 74.000 tahun lalu. Bahwa letusannya raksasa cukup pasti. Tetapi klaim bahwa ia nyaris memunahkan manusia jauh lebih lemah dan masih diperdebatkan. Toba mengajarkan kita memisahkan skala fisik yang nyata dari kepastian dampak yang belum tentu ada.`,
    type: "diagram", title: "Kaldera Toba",
    alt: "Diagram potongan kaldera lebar berisi danau, sisa letusan super.",
    caption: "Diagram penampang kaldera Toba yang kini menjadi danau.",
  },
  "tambora-1815-tahun-tanpa-musim-panas": {
    syn: `Letusan Tambora 1815 menurunkan suhu dunia, dan tahun berikutnya dikenang sebagai tahun tanpa musim panas dengan gagal panen di benua lain. Di sini Indonesia bukan sekadar korban iklim global, melainkan sumbernya. Satu letusan tropis yang cukup besar ternyata bisa menggeser cuaca seluruh planet.`,
    type: "diagram", title: "Tambora 1815 dan iklim dunia",
    alt: "Diagram gunung melepas aerosol sulfat ke atmosfer dan matahari yang meredup.",
    caption: "Diagram bagaimana letusan tropis mendinginkan iklim sementara.",
  },
  "merapi-awan-panas": {
    syn: `Bahaya paling khas Merapi bukan lava yang mengalir pelan, melainkan awan panas yang meluncur cepat menuruni lereng dan sulit dihindari. Karena lerengnya padat penduduk, gunung ini dipantau sangat ketat. Hidup berdampingan dengannya menuntut kedisiplinan evakuasi setiap kali aktivitasnya meningkat.`,
    type: "diagram", title: "Profil bahaya Merapi",
    alt: "Diagram profil gunung dengan kubah lava dan jalur awan panas menuruni lereng.",
    caption: "Diagram jalur awan panas Merapi menuruni lereng.",
  },
  "kawah-ijen-api-biru": {
    syn: `Api biru Ijen sering dikira lava. Sebenarnya itu gas belerang yang terbakar saat bertemu udara panas. Kawahnya juga menyimpan danau yang sangat asam. Keindahannya nyata, tetapi begitu pula bahayanya bagi penambang yang bekerja dekat gas beracun di tepi kawah hampir setiap hari.`,
    type: "diagram", title: "Kawah Ijen, api biru",
    alt: "Diagram kawah dengan danau asam dan nyala biru dari gas belerang yang terbakar.",
    caption: "Diagram asal api biru dan danau asam Kawah Ijen.",
  },
  "dieng-gas-co2-senyap": {
    syn: `Dieng tampak sejuk dan damai, tetapi menyimpan bahaya yang tidak terlihat: gas vulkanik seperti karbon dioksida yang bisa berkumpul di area rendah dan mematikan tanpa letusan besar. Ancaman gunung api tidak selalu dramatis. Kadang ia senyap, justru di tempat yang tampak paling tenang.`,
    type: "diagram", title: "Dieng, gas yang senyap",
    alt: "Diagram cekungan kawah dengan gas vulkanik berat berkumpul di area rendah.",
    caption: "Diagram bahaya gas vulkanik tak terlihat di Dieng.",
  },
  "kelud-danau-kawah-direkayasa": {
    syn: `Danau di kawah Kelud membuat letusannya mematikan, karena air bisa tumpah bersama material panas sebagai lahar yang menyapu lembah. Untuk menekan risiko, airnya pernah dialirkan keluar lewat terowongan. Rekayasa ini menangani satu bagian bahaya, tetapi gunung tetap memegang kendali atas bentuk letusannya.`,
    type: "diagram", title: "Kelud, danau kawah direkayasa",
    alt: "Diagram kawah berisi danau dengan terowongan yang mengurangi volume air.",
    caption: "Diagram rekayasa danau kawah Kelud untuk menahan lahar.",
  },
  "samalas-1257-letusan-terlupakan": {
    syn: `Selama berabad-abad ilmuwan tahu ada letusan besar sekitar tahun 1257 dari jejak es kutub, tetapi tidak tahu sumbernya. Jawabannya ternyata Samalas di Lombok. Geologi lapangan, inti es, dan naskah babad bertemu untuk menyusun ulang peristiwa yang nyaris hilang dari ingatan dunia.`,
    type: "diagram", title: "Samalas 1257",
    alt: "Diagram potongan kaldera Samalas di kompleks Rinjani dengan danau kawah.",
    caption: "Diagram kaldera Samalas, sumber letusan besar 1257.",
  },

  "segitiga-terumbu-karang-dunia": {
    syn: `Perairan Indonesia berada di jantung Segitiga Terumbu Karang, dengan keanekaragaman karang tertinggi di dunia. Terumbu yang sehat menopang perikanan dan melindungi pesisir dari gelombang. Posisi ini membawa tanggung jawab sekaligus kerentanan, karena tekanan pada karang di sini berdampak jauh melampaui Indonesia.`,
    type: "diagram", title: "Segitiga Terumbu Karang",
    alt: "Diagram zona laut dangkal dengan beragam bentuk karang di dasar.",
    caption: "Diagram zona terumbu karang di perairan dangkal.",
  },
  "pemutihan-karang-dan-suhu-laut": {
    syn: `Karang hidup bersama alga renik yang memberinya energi dan warna. Ketika laut terlalu panas terlalu lama, hubungan itu putus dan karang memutih. Belum tentu mati, tetapi kelaparan dan rentan. Pemutihan adalah sinyal langsung bahwa perubahan iklim sudah menyentuh laut yang menopang banyak orang.`,
    type: "diagram", title: "Pemutihan karang",
    alt: "Diagram karang sehat dan karang memutih di samping skala suhu yang naik.",
    caption: "Diagram pemutihan karang akibat suhu laut yang naik.",
  },
  "sampah-plastik-laut-indonesia": {
    syn: `Indonesia sering disebut penyumbang besar plastik laut, tetapi angka itu berasal dari model, bukan timbangan langsung di laut. Masalahnya tetap nyata: pengelolaan sampah yang belum memadai dan sungai yang membawa plastik dari darat ke laut. Membacanya jujur berarti memisahkan estimasi dari kepastian.`,
    type: "diagram", title: "Plastik dari darat ke laut",
    alt: "Diagram aliran sampah plastik dari daratan melalui sungai menuju laut.",
    caption: "Diagram jalur plastik dari darat ke laut lewat sungai.",
  },

  "mangrove-karbon-biru": {
    syn: `Mangrove menyimpan karbon dalam jumlah besar, terutama di tanah berlumpurnya yang dalam, bukan hanya di pohonnya. Ia juga meredam gelombang dan menjadi tempat asuhan ikan. Karena itu merusaknya melepas karbon yang lama terkunci, sementara memulihkannya butuh lebih dari sekadar menancapkan bibit.`,
    type: "diagram", title: "Mangrove dan karbon biru",
    alt: "Diagram mangrove dengan akar tunjang di garis pasang dan karbon tersimpan di tanah.",
    caption: "Diagram akar mangrove dan simpanan karbon biru di tanah.",
  },

  "gambut-karbon-dan-api": {
    syn: `Selama basah, lahan gambut mengunci karbon yang menumpuk ribuan tahun. Begitu dikeringkan untuk lahan, ia menjadi sangat mudah terbakar, apinya menjalar di bawah permukaan dan melepas asap pekat. Menjaga gambut tetap basah adalah strategi iklim sekaligus perlindungan kesehatan publik.`,
    type: "diagram", title: "Gambut, karbon, dan api",
    alt: "Diagram kolom tanah gambut dengan lapisan karbon dan panah emisi saat kering.",
    caption: "Diagram kolom gambut dan pelepasan karbon saat kering terbakar.",
  },
  "deforestasi-dipantau-satelit": {
    syn: `Dulu mengukur hilangnya hutan butuh survei lapangan yang lambat. Kini citra satelit membuat deforestasi bisa dipantau secara terbuka, termasuk di Kalimantan. Datanya kuat untuk memeriksa klaim, tetapi tetap perlu verifikasi lapangan, karena hilangnya tutupan pohon tidak selalu berarti hutan alam yang lenyap.`,
    type: "timeline", title: "Tutupan pohon dari satelit",
    alt: "Linimasa batang yang menurun menggambarkan tren tutupan pohon antar tahun.",
    caption: "Linimasa skematis arah tren tutupan pohon dari data satelit.",
  },

  "jakarta-penurunan-tanah": {
    syn: `Banjir pesisir Jakarta sering dikira hanya soal laut yang naik. Padahal di banyak titik tanahnya turun lebih cepat, terutama karena air tanah disedot berlebihan. Tanggul saja tidak cukup jika tanah terus amblas. Memisahkan dua proses ini penting agar solusinya menyasar penyebab yang tepat.`,
    type: "diagram", title: "Jakarta, tanah yang turun",
    alt: "Diagram batang membandingkan tanah yang turun dengan muka laut yang naik.",
    caption: "Diagram penurunan tanah dibanding kenaikan laut di Jakarta.",
  },

  "citarum-sungai-dan-pencemaran": {
    syn: `Citarum menopang pertanian, air baku, dan listrik, tetapi juga menanggung limbah industri dan rumah tangga di sepanjang alirannya. Memulihkannya bukan proyek sekali jadi, melainkan tata kelola panjang. Klaim keberhasilan perlu dibaca dengan data kualitas air, bukan sekadar perubahan yang tampak di permukaan.`,
    type: "diagram", title: "Citarum, beban pencemaran",
    alt: "Diagram aliran sungai dengan titik beban industri, permukiman, dan limbah.",
    caption: "Diagram beban pencemaran di sepanjang aliran Citarum.",
  },
};

let injected = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".ts"))) {
  const full = path.join(DIR, file);
  let src = fs.readFileSync(full, "utf8");
  for (const [slug, m] of Object.entries(META)) {
    const anchor = `    slug: "${slug}",\n`;
    if (!src.includes(anchor)) continue;
    // skip if already injected for this slug
    const after = src.slice(src.indexOf(anchor) + anchor.length, src.indexOf(anchor) + anchor.length + 60);
    if (after.includes("synopsis:")) continue;
    const ins =
      anchor +
      `    synopsis: \`${m.syn}\`,\n` +
      `    cover: { type: "${m.type}", title: "${m.title}", alt: "${m.alt}", caption: "${m.caption}" },\n`;
    src = src.replace(anchor, ins);
    injected++;
  }
  fs.writeFileSync(full, src);
}
console.log(`Injected synopsis + cover into ${injected} entries.`);
