import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Metodologi",
  description:
    "Bagaimana NaLI bekerja: jurnal riset terbuka yang menyusun cerita dari jurnal, arsip, laporan lembaga, dataset, dan dokumentasi pihak ketiga, bukan observasi lapangan pribadi.",
  alternates: { canonical: "/metodologi" },
  openGraph: {
    title: "Metodologi | NaLI by NatIve",
    description:
      "Cara NaLI memilih topik, mengumpulkan sumber, memakai AI, dan menjaga keputusan editorial di tangan manusia.",
    type: "article",
  },
};

const SECTIONS: { n: string; title: string; body: React.ReactNode }[] = [
  {
    n: "01",
    title: "Apa itu NaLI",
    body: (
      <p>
        NaLI by NatIve adalah <strong>jurnal riset terbuka</strong> (open-source
        evidence journal) tentang alam, sejarah, dan investigasi Indonesia. Kami
        membaca jurnal ilmiah, arsip, laporan lembaga, dataset, peta, observasi
        peneliti, dan foto berlisensi, lalu menyusunnya menjadi cerita yang bisa
        ditelusuri kembali ke sumbernya.
      </p>
    ),
  },
  {
    n: "02",
    title: "Apa yang NaLI lakukan",
    body: (
      <ul>
        <li>Menelusuri dan membandingkan sumber publik yang dapat diverifikasi.</li>
        <li>Memisahkan fakta yang terdokumentasi dari klaim yang masih lemah.</li>
        <li>Menyertakan daftar sumber dan label keyakinan di tiap tulisan.</li>
        <li>Menandai batasan dan hal yang belum pasti secara terbuka.</li>
      </ul>
    ),
  },
  {
    n: "03",
    title: "Apa yang NaLI tidak klaim",
    body: (
      <p>
        NaLI <strong>tidak</strong> mengklaim observasi lapangan pribadi. Untuk
        saat ini perlengkapan dan anggaran untuk kerja lapangan langsung belum
        lengkap, jadi kami tidak berpura-pura telah mengunjungi, mengukur,
        mewawancarai, atau memotret sesuatu di lapangan. Ketika kami menyebut
        “bukti lapangan”, yang dimaksud adalah <em>laporan lapangan pihak
        ketiga</em>, peneliti, lembaga, atau arsip, bukan ekspedisi NaLI.
      </p>
    ),
  },
  {
    n: "04",
    title: "Cara topik dipilih",
    body: (
      <p>
        Kami memprioritaskan topik yang (a) penting bagi pemahaman tentang
        Indonesia, (b) sering disalahpahami atau diviralkan tanpa rujukan, dan (c)
        punya sumber publik yang cukup untuk ditelusuri. Jika sebuah topik menarik
        tetapi sumbernya belum memadai, ia masuk ke backlog riset, bukan langsung
        terbit.
      </p>
    ),
  },
  {
    n: "05",
    title: "Cara sumber dikumpulkan",
    body: (
      <p>
        Setiap sumber yang dipakai harus dapat ditelusuri: idealnya punya DOI, URL
        resmi, URL arsip stabil, halaman penerbit, catatan museum, halaman IUCN
        atau GBIF, halaman regulasi pemerintah, atau katalog perpustakaan. Sumber
        yang tidak bisa diverifikasi tidak dipublikasikan sebagai sumber, ia
        masuk ke backlog. Semua sumber yang dipakai dikumpulkan di{" "}
        <Link href="/arsip-sumber">Arsip Sumber</Link>, lengkap dengan catatan
        keandalan dan batasannya. Standar kualitas sumber dijelaskan di{" "}
        <Link href="/pedoman-sumber">Pedoman Sumber</Link>.
      </p>
    ),
  },
  {
    n: "06",
    title: "Cara AI digunakan",
    body: (
      <p>
        NaLI menggunakan AI untuk membantu <strong>menelusuri, merangkum,
        menyusun, dan membandingkan sumber</strong>. AI mempercepat pekerjaan,
        tetapi tidak diberi wewenang untuk menyimpulkan sendiri apa yang layak
        terbit. Setiap angka dan klaim penting diperiksa silang ke sumber aslinya.
      </p>
    ),
  },
  {
    n: "07",
    title: "Cara manusia memeriksa hasil",
    body: (
      <p>
        Keputusan editorial, pemilihan klaim, dan batasan kesimpulan tetap dijaga
        manusia. Sebelum terbit, tiap tulisan diperiksa: apakah klaimnya didukung
        sumber yang benar, apakah labelnya jujur, dan apakah batasannya
        ditampilkan. Jika ragu, kami memilih label yang lebih rendah.
      </p>
    ),
  },
  {
    n: "08",
    title: "Sistem label keyakinan",
    body: (
      <>
        <p>Setiap tulisan membawa satu label tingkat keyakinan:</p>
        <ul>
          <li>
            <strong>Terverifikasi kuat</strong>, didukung sumber yang kuat dan
            konsisten.
          </li>
          <li>
            <strong>Didukung sumber</strong>, punya dasar, tapi perlu konteks atau
            masih bisa berubah angka detailnya.
          </li>
          <li>
            <strong>Terbatas</strong>, hipotesis kerja atas bukti yang masih tipis.
          </li>
          <li>
            <strong>Belum cukup bukti</strong>, belum bisa dinyatakan sebagai
            fakta.
          </li>
        </ul>
        <p>
          Klaim yang masih <strong>diperdebatkan</strong> ditandai per-klaim di
          tabel <em>Claim Ledger</em> tiap artikel, bukan hanya sebagai label di
          atas.
        </p>
      </>
    ),
  },
  {
    n: "09",
    title: "Cara foto dipilih dan diberi lisensi",
    body: (
      <p>
        NaLI hanya memakai gambar dengan lisensi yang jelas: domain publik, CC0, CC
        BY, CC BY-SA, atau lisensi terbuka lembaga yang mengizinkan penggunaan
        ulang. Setiap gambar disertai kredit pembuat, sumber, dan lisensinya. Kami
        tidak memakai foto hasil pencarian acak atau foto berhak cipta tanpa izin.
        Aturan lengkap ada di <Link href="/lisensi-foto">Lisensi Foto</Link>.
      </p>
    ),
  },
  {
    n: "10",
    title: "Batasan metodologi",
    body: (
      <p>
        Karena bekerja dari sumber terbuka, NaLI dibatasi oleh apa yang sudah
        terdokumentasi publik. Kami tidak menghasilkan data primer baru. Ada topik
        yang tidak bisa dituntaskan sampai ada riset lapangan independen, dan kami
        akan mengatakannya, bukan menutupinya dengan kepastian palsu.
      </p>
    ),
  },
  {
    n: "11",
    title: "Cara koreksi dilakukan",
    body: (
      <p>
        Kami bisa salah. Ketika ada koreksi yang berdasar, artikel diperbarui dan
        perubahannya dicatat. Prosedur lengkap, termasuk hak jawab untuk artikel
        investigasi, ada di halaman <Link href="/koreksi">Koreksi</Link>.
      </p>
    ),
  },
];

export default function MetodologiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cara kerja"
        title="Metodologi"
        description="Bagaimana NaLI menelusuri, memilih sumber, memakai AI, dan menjaga keputusan editorial tetap di tangan manusia."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <p className="text-lg">
            NaLI menggunakan AI untuk membantu menelusuri, merangkum, menyusun, dan
            membandingkan sumber. Keputusan editorial, pemilihan klaim, dan batasan
            kesimpulan tetap harus dijaga manusia. NaLI tidak mengklaim observasi
            lapangan pribadi kecuali bukti lapangan pertama tersedia dan ditampilkan
            secara jelas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <div key={s.n} className="border border-dashed border-ink/40 bg-paper p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-3 mb-4 font-mono text-[0.66rem] uppercase tracking-wider text-ink/70">
                  <span className="bg-ink-wash/30 border border-dashed border-ink/25 px-2 py-0.5 font-semibold text-ink">PROSEDUR METODE</span>
                  <span>REF #{s.n}</span>
                </div>
                <h2 className="font-display text-lg font-bold uppercase text-ink">{s.title}</h2>
                <div className="mt-4 font-mono text-[0.78rem] leading-relaxed text-gray space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_strong]:text-ink-deep">
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
