import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
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
    <>
      <PageHeader
        eyebrow="Tentang"
        title="Satu orang, banyak yang belum diceritakan."
        description="NaLI by NatIve adalah jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia, disusun dari sumber publik yang dapat ditelusuri."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="space-y-6">
          <div className="border border-dashed border-ink/40 bg-paper p-5">
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">IDENTITAS</span>
              <span>{"//"}</span>
              <span>TENTANG NALI BY NATIVE</span>
            </div>
            <div className="prose-style-override font-mono text-[0.82rem] leading-relaxed text-gray space-y-4">
              <p>
                NaLI by NatIve menggabungkan tiga hal: penelusuran berbantuan AI,
                disiplin riset berbasis sumber, dan cara bercerita yang enak dibaca.
                Hasilnya bukan dump data, juga bukan opini tanpa dasar, melainkan
                tulisan yang transparan soal seberapa kuat dasarnya.
              </p>
              <p>
                Empat huruf namanya berarti <strong className="text-ink-deep font-semibold">Nature, Archive, Lore,
                Investigation</strong>. “by NatIve” menegaskan sudut pandangnya:
                lokal, Indonesia, dekat ke konteksnya sendiri.
              </p>
            </div>
          </div>

          <div className="border border-dashed border-ink/40 bg-paper p-5">
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">BATASAN PEMBERITAAN</span>
              <span>{"//"}</span>
              <span>NO FIELDWORK CLAIM</span>
            </div>
            <div className="prose-style-override font-mono text-[0.82rem] leading-relaxed text-gray space-y-4">
              <p>
                NaLI adalah <strong className="text-ink-deep font-semibold">jurnal bukti sumber terbuka</strong>. Untuk saat
                ini kami bekerja dari jurnal, arsip, laporan lembaga, dataset, peta,
                observasi peneliti, dan foto berlisensi, <strong className="text-ink-deep font-semibold">bukan</strong> dari
                ekspedisi atau observasi lapangan pribadi. Selama perlengkapan dan
                anggaran lapangan belum lengkap, kami tidak akan mengklaim telah
                mengunjungi, mengukur, atau memotret sesuatu di lapangan kecuali bukti
                pertama benar-benar ada dan ditampilkan jelas. Cara kerja lengkapnya
                ada di <Link href="/metodologi" className="link-teal hover:underline font-semibold">Metodologi</Link>.
              </p>
            </div>
          </div>

          <div className="border border-dashed border-ink/40 bg-paper p-5">
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">PRINSIP AKURASI</span>
              <span>{"//"}</span>
              <span>CONFIDENCE LEDGER SYSTEM</span>
            </div>
            <div className="prose-style-override font-mono text-[0.82rem] leading-relaxed text-gray space-y-4">
              <p>
                Banyak konten di internet terdengar yakin padahal tidak. Kami memilih
                jalan sebaliknya: setiap tulisan membawa label tingkat keyakinan dan
                daftar sumber. Kamu boleh tidak setuju, tapi kamu selalu bisa
                memeriksa dasarnya.
              </p>
            </div>
          </div>

          <div className="border border-dashed border-ink/40 bg-paper p-5">
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">KEPENGURUSAN</span>
              <span>{"//"}</span>
              <span>FOUNDER RECORD</span>
            </div>
            <div className="prose-style-override font-mono text-[0.82rem] leading-relaxed text-gray space-y-4">
              <p>
                NaLI by NatIve disusun oleh <strong className="text-ink-deep font-semibold">{SITE.author}</strong> sebagai
                proyek solo: menelusuri, menulis, dan menerbitkan secara konsisten.
                Prinsip kerjanya sederhana, bangun sekali, terbitkan rutin, ukur
                respons nyata.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/manifesto"
            className="border border-ink bg-ink px-6 py-3 font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep interactive-link"
          >
            Baca manifesto <span className="link-arrow">→</span>
          </Link>
          <Link
            href="/kontak"
            className="border border-dashed border-ink/70 px-6 py-3 font-mono text-[0.8rem] uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper interactive-link"
          >
            Hubungi <span className="link-arrow">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
