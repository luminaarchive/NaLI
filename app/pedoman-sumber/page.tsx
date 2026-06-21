import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Pedoman Sumber",
  description:
    "Standar kualitas sumber NaLI: sumber primer, sekunder, dataset, arsip historis, foto berlisensi, dan label keandalan.",
  alternates: { canonical: "/pedoman-sumber" },
  openGraph: {
    title: "Pedoman Sumber | NaLI",
    description: "Standar kualitas sumber dan cara label keandalan bekerja.",
    type: "article",
  },
};

export default function PedomanSumberPage() {
  return (
    <>
      <PageHeader
        eyebrow="Standar"
        title="Pedoman Sumber"
        description="Tidak semua sumber sama kuat. Halaman ini menjelaskan jenis sumber yang kami pakai dan bagaimana keandalannya dinilai."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <h2>Sumber primer</h2>
          <p>
            Bukti tangan pertama: artikel jurnal peer-review yang melaporkan
            penelitian asli, dokumen arsip, regulasi pemerintah, catatan museum,
            data penilaian IUCN/GBIF, dan dataset resmi. Inilah pijakan terkuat.
          </p>

          <h2>Sumber sekunder</h2>
          <p>
            Tinjauan, buku ilmiah, dan sintesis yang merangkum sumber primer.
            Berguna untuk konteks dan gambaran besar, tetapi klaim kunci tetap kami
            telusuri ke primernya bila memungkinkan.
          </p>

          <h2>Dataset</h2>
          <p>
            Data terstruktur dari lembaga (mis. statistik resmi, data tutupan hutan,
            katalog erupsi). Kuat untuk angka, tetapi harus dibaca dengan metodologi
            dan periodenya, angka tanpa tahun dan definisi mudah menyesatkan.
          </p>

          <h2>Arsip historis</h2>
          <p>
            Naskah, peta tua, catatan kolonial, dan koleksi lembaga. Bernilai tinggi,
            tetapi membawa bias zaman dan pembuatnya. Kami menandai dari sudut siapa
            sebuah arsip dibuat, bukan menerimanya mentah-mentah sebagai kebenaran
            netral.
          </p>

          <h2>Foto berlisensi</h2>
          <p>
            Hanya gambar dengan lisensi jelas, domain publik, CC0, CC BY, CC BY-SA,
            atau lisensi terbuka lembaga. Aturan dan format atribusinya ada di{" "}
            <Link href="/lisensi-foto">Lisensi Foto</Link>.
          </p>

          <h2>Sumber yang tidak dipakai sebagai bukti utama</h2>
          <ul>
            <li>Media sosial dan forum tanpa verifikasi.</li>
            <li>
              Reportase media sebagai <em>satu-satunya</em> bukti untuk klaim besar, berguna untuk konteks, tapi bukan pengganti sumber primer.
            </li>
            <li>
              ResearchGate/iNaturalist sebagai <em>satu-satunya</em> bukti, boleh
              untuk penemuan awal, tetapi harus dikonfirmasi ke sumber resmi dengan
              lisensi yang jelas.
            </li>
            <li>Sumber yang tidak bisa ditelusuri kembali (tanpa URL/DOI/katalog).</li>
          </ul>

          <h2>Cara label keandalan bekerja</h2>
          <p>Tiap entri di Arsip Sumber diberi salah satu tingkat keandalan:</p>
          <ul>
            <li>
              <strong>Sumber primer</strong>, bukti tangan pertama.
            </li>
            <li>
              <strong>Keandalan tinggi</strong>, lembaga/jurnal kredibel, sekunder
              tapi kuat.
            </li>
            <li>
              <strong>Keandalan sedang</strong>, berguna dengan catatan.
            </li>
            <li>
              <strong>Kontekstual</strong>, untuk latar, bukan pembuktian.
            </li>
            <li>
              <strong>Perlu kehati-hatian</strong>, ada keterbatasan akses, bias,
              atau status yang masih diperdebatkan.
            </li>
          </ul>
          <p>
            Label ini bukan vonis tentang “benar/salah”, melainkan tentang seberapa
            jauh sebuah sumber bisa menyangga sebuah klaim.
          </p>
        </div>
      </div>
    </>
  );
}
