import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageBackdrop } from "@/components/PageBackdrop";
import { DynamicWaveBackground } from "@/components/ui/dynamic-wave-canvas-background";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Tentang NaLI by NatIve dan pendirinya, jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia.",
  openGraph: {
    title: "Tentang | NaLI by NatIve",
    description:
      "Tentang NaLI by NatIve, jurnal riset terbuka tentang Indonesia.",
    type: "website",
  },
};

export default function TentangPage() {
  return (
    <div className="theme-tentang relative">
      <PageBackdrop light="opacity-[0.42]">
        <DynamicWaveBackground colorLow={[40, 20, 12]} colorHigh={[180, 92, 56]} />
      </PageBackdrop>
      <PageHeader
        eyebrow="Tentang"
        title="Satu orang, banyak yang belum diceritakan."
        description="NaLI by NatIve adalah jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia, disusun dari sumber publik yang dapat ditelusuri."
      />

      <div className="container-read relative bg-paper/80 py-12 backdrop-blur-sm sm:py-16">
        <div className="prose-nali">
          <h2>Apa ini</h2>
          <p>
            NaLI by NatIve menggabungkan tiga hal: penelusuran berbantuan AI,
            disiplin riset berbasis sumber, dan cara bercerita yang enak dibaca.
            Hasilnya bukan dump data, juga bukan opini tanpa dasar, melainkan
            tulisan yang transparan soal seberapa kuat dasarnya.
          </p>
          <p>
            Empat huruf namanya berarti <strong>Nature, Archive, Lore,
            Investigation</strong>. “by NatIve” menegaskan sudut pandangnya:
            lokal, Indonesia, dekat ke konteksnya sendiri.
          </p>

          <h2>Apa yang NaLI tidak klaim</h2>
          <p>
            NaLI adalah <strong>jurnal bukti sumber terbuka</strong>. Untuk saat
            ini kami bekerja dari jurnal, arsip, laporan lembaga, dataset, peta,
            observasi peneliti, dan foto berlisensi, <strong>bukan</strong> dari
            ekspedisi atau observasi lapangan pribadi. Selama perlengkapan dan
            anggaran lapangan belum lengkap, kami tidak akan mengklaim telah
            mengunjungi, mengukur, atau memotret sesuatu di lapangan kecuali bukti
            pertama benar-benar ada dan ditampilkan jelas. Cara kerja lengkapnya
            ada di <Link href="/metodologi">Metodologi</Link>.
          </p>

          <h2>Kenapa label keyakinan</h2>
          <p>
            Banyak konten di internet terdengar yakin padahal tidak. Kami memilih
            jalan sebaliknya: setiap tulisan membawa label tingkat keyakinan dan
            daftar sumber. Kamu boleh tidak setuju, tapi kamu selalu bisa
            memeriksa dasarnya.
          </p>

          <h2>Pendiri</h2>
          <p>
            NaLI by NatIve disusun oleh <strong>{SITE.author}</strong> sebagai
            proyek solo: menelusuri, menulis, dan menerbitkan secara konsisten.
            Prinsip kerjanya sederhana, bangun sekali, terbitkan rutin, ukur
            respons nyata.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/manifesto"
            className="border border-ink bg-ink px-6 py-3 font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep"
          >
            Baca manifesto
          </Link>
          <Link
            href="/kontak"
            className="border border-dashed border-ink/70 px-6 py-3 font-mono text-[0.8rem] uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Hubungi
          </Link>
        </div>
      </div>
    </div>
  );
}
