import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CorrectionForm } from "@/components/CorrectionForm";
import { getAllCorrections } from "@/lib/corrections";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Koreksi",
  description:
    "Cara mengirim koreksi ke NaLI, kapan artikel diperbarui, hak jawab untuk artikel investigasi, dan riwayat koreksi.",
  alternates: { canonical: "/koreksi" },
  openGraph: {
    title: "Koreksi | NaLI by NatIve",
    description:
      "Akuntabilitas NaLI: kirim koreksi, hak jawab, dan riwayat perbaikan.",
    type: "article",
  },
};

export default function KoreksiPage() {
  const corrections = getAllCorrections();
  return (
    <>
      <PageHeader
        eyebrow="Akuntabilitas"
        title="Koreksi"
        description="Kami bisa salah. Halaman ini menjelaskan cara mengoreksi NaLI dan apa yang kami lakukan dengan koreksi itu."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <h2>Kirim koreksi</h2>
          <p>
            Jika menemukan kesalahan fakta, sumber yang keliru, atau klaim yang
            terlalu jauh dari buktinya, beri tahu kami. Koreksi yang berdasar sangat
            kami hargai, itu memperkuat, bukan mempermalukan. Kirim ke{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>

          <h2>Format koreksi yang dibutuhkan</h2>
          <p>Agar bisa kami tindak cepat, sertakan:</p>
          <ul>
            <li>Tautan tulisan yang dimaksud.</li>
            <li>Bagian spesifik yang keliru (kutip kalimat atau paragrafnya).</li>
            <li>Apa yang seharusnya, menurut Anda.</li>
            <li>Sumber pendukung yang dapat ditelusuri (URL, DOI, dokumen resmi).</li>
          </ul>

          <div className="not-prose my-8 border border-dashed border-ink/60 bg-paper p-5 sm:p-6">
            <p className="label text-ink-deep">Form pengajuan koreksi</p>
            <p className="mt-2 mb-5 font-mono text-[0.78rem] leading-relaxed text-gray">
              Isi keempat bagian berikut. Tombol akan menyiapkan email terstruktur ke redaksi.
            </p>
            <CorrectionForm />
          </div>

          <h2>Kapan artikel diperbarui</h2>
          <p>
            Jika koreksi terbukti benar, artikel diperbarui dan tanggal{" "}
            <em>diperbarui</em> di artikel diubah. Untuk kesalahan kecil (ejaan,
            tautan), perbaikan dilakukan langsung. Untuk kesalahan substantif (fakta,
            angka, kesimpulan), kami menambahkan catatan koreksi yang transparan
            sehingga pembaca tahu apa yang berubah.
          </p>

          <h2>Hak jawab untuk artikel investigasi</h2>
          <p>
            Untuk tulisan di kategori <Link href="/investigasi">Investigasi</Link>,
            pihak yang merasa dirugikan oleh sebuah klaim berhak mengirim tanggapan.
            Tanggapan yang relevan dan berdasar akan kami pertimbangkan untuk
            ditampilkan bersama artikel, atau menjadi dasar pembaruan. NaLI menulis
            investigasi secara sistemik dan berbasis dokumen publik, serta menandai
            jelas hal yang belum terbukti, justru agar hak jawab punya pijakan yang
            adil.
          </p>

          <h2>Riwayat koreksi</h2>
          {corrections.length === 0 ? (
            <p>
              Belum ada koreksi yang tercatat. Ketika ada, ringkasannya akan muncul di
              sini dan di catatan koreksi pada artikel terkait.
            </p>
          ) : (
            <ul className="not-prose mt-4 space-y-4">
              {corrections.map((c) => (
                <li key={c.id} className="border-l-2 border-dashed border-ink/50 pl-4">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-deep">
                    {formatDate(c.tanggalDiperbaiki)} ·{" "}
                    <Link href={`/articles/${c.artikelSlug}`}>{c.artikelTitle}</Link>
                  </p>
                  <p className="mt-1 font-mono text-[0.8rem] leading-relaxed text-gray">
                    <span className="text-ink-charcoal">Sebelum:</span> {c.klaimLama}
                    <br />
                    <span className="text-ink-charcoal">Sesudah:</span> {c.klaimBaru}
                  </p>
                  <p className="mt-1 font-mono text-[0.74rem] leading-relaxed text-gray">
                    {c.alasan} (sumber: {c.sumberKoreksi})
                  </p>
                </li>
              ))}
            </ul>
          )}

          <h2>Kriteria penghapusan atau klarifikasi</h2>
          <p>
            NaLI tidak menghapus artikel hanya karena tidak nyaman. Penghapusan atau
            klarifikasi besar dipertimbangkan bila: (a) sebuah klaim terbukti keliru
            dan tidak bisa diperbaiki tanpa menyesatkan, (b) ada risiko hukum atau
            keselamatan yang nyata, atau (c) sumber utamanya ditarik atau terbukti
            tidak sahih. Dalam semua kasus, kami mencatat alasannya.
          </p>

          <h2>Kontak</h2>
          <p>
            Koreksi, hak jawab, dan pertanyaan editorial:{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </div>
    </>
  );
}
