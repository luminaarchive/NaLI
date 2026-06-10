import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Tentang NaLI by NatIve dan pendirinya — jurnal lapangan dan publikasi riset berbasis AI tentang Indonesia.",
  openGraph: {
    title: "Tentang | NaLI by NatIve",
    description:
      "Tentang NaLI by NatIve — jurnal lapangan dan publikasi riset berbasis AI tentang Indonesia.",
    type: "website",
  },
};

export default function TentangPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tentang"
        title="Satu orang, banyak yang belum diceritakan."
        description="NaLI by NatIve adalah jurnal lapangan dan publikasi riset berbasis AI tentang alam, sejarah, dan investigasi Indonesia."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <h2>Apa ini</h2>
          <p>
            NaLI by NatIve menggabungkan tiga hal: penelusuran berbantuan AI,
            disiplin riset berbasis sumber, dan cara bercerita yang enak dibaca.
            Hasilnya bukan dump data, juga bukan opini tanpa dasar — melainkan
            tulisan yang transparan soal seberapa kuat dasarnya.
          </p>
          <p>
            Empat huruf namanya berarti <strong>Nature, Archive, Lore,
            Investigation</strong>. “by NatIve” menegaskan sudut pandangnya:
            lokal, Indonesia, dari lapangan.
          </p>

          <h2>Kenapa label keyakinan</h2>
          <p>
            Banyak konten di internet terdengar yakin padahal tidak. Kami memilih
            jalan sebaliknya: setiap tulisan membawa label tingkat keyakinan dan
            daftar sumber. Kamu boleh tidak setuju — tapi kamu selalu bisa
            memeriksa dasarnya.
          </p>

          <h2>Pendiri</h2>
          <p>
            NaLI by NatIve disusun oleh <strong>{SITE.author}</strong> sebagai
            proyek solo: menelusuri, menulis, dan menerbitkan secara konsisten.
            Prinsip kerjanya sederhana — bangun sekali, terbitkan setiap hari,
            ukur respons nyata.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/manifesto"
            className="rounded-full bg-ink-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark"
          >
            Baca manifesto
          </Link>
          <Link
            href="/kontak"
            className="rounded-full border border-rule px-6 py-3 text-sm text-ink-black transition-colors hover:border-teal-dark hover:text-teal-dark"
          >
            Hubungi
          </Link>
        </div>
      </div>
    </>
  );
}
