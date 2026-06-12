import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lisensi Foto",
  description:
    "Lisensi gambar yang NaLI terima, format atribusi, apa yang tidak kami pakai, dan prosedur takedown.",
  alternates: { canonical: "/lisensi-foto" },
  openGraph: {
    title: "Lisensi Foto | NaLI by NatIve",
    description: "Aturan lisensi dan atribusi gambar di NaLI.",
    type: "article",
  },
};

export default function LisensiFotoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hak cipta"
        title="Lisensi Foto"
        description="Agar tidak ada gambar curian: aturan lisensi, format atribusi, dan prosedur takedown."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <h2>Lisensi yang kami terima</h2>
          <ul>
            <li>Domain publik (public domain) dan CC0.</li>
            <li>Creative Commons CC BY, CC BY-SA.</li>
            <li>
              Lisensi terbuka pemerintah/lembaga yang secara eksplisit mengizinkan
              penggunaan ulang.
            </li>
            <li>
              Wikimedia Commons dengan metadata lisensi yang terlihat dan kompatibel.
            </li>
            <li>
              Media GBIF/iNaturalist hanya bila lisensinya eksplisit dan kompatibel.
            </li>
          </ul>

          <h2>Format atribusi</h2>
          <p>Setiap gambar di NaLI mencantumkan, minimal:</p>
          <ul>
            <li>Judul atau deskripsi singkat.</li>
            <li>Pembuat/fotografer atau lembaga.</li>
            <li>Tautan sumber.</li>
            <li>Nama lisensi (dan tautan lisensi bila ada).</li>
            <li>Keterangan (caption) dan teks alternatif (alt) untuk aksesibilitas.</li>
          </ul>
          <p>
            Kredit ditampilkan di bawah gambar atau di blok “Kredit &amp; lisensi
            gambar” pada artikel, tidak disembunyikan.
          </p>

          <h2>Yang tidak akan kami pakai</h2>
          <ul>
            <li>Foto hasil pencarian gambar acak tanpa lisensi jelas.</li>
            <li>Foto berhak cipta tanpa izin pemegang hak.</li>
            <li>
              Gambar yang metadata lisensinya tidak bisa diverifikasi. Kalau ragu,
              kami tidak memakainya.
            </li>
          </ul>
          <p>
            Bila tidak ada gambar yang aman untuk sebuah artikel, kami memilih peta
            atau diagram yang dibuat sendiri dari data, atau membiarkan slot gambar
            kosong, daripada memakai foto yang tidak jelas haknya.
          </p>

          <h2>Takedown &amp; kontak</h2>
          <p>
            Jika Anda pemegang hak dan menemukan gambar yang dipakai keliru atau di
            luar lisensinya, hubungi <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            Kami akan memeriksa dan, bila perlu, mengganti atau menurunkan gambar
            tersebut dengan cepat.
          </p>
        </div>
      </div>
    </>
  );
}
