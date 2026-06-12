import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Prinsip editorial NaLI by NatIve: tahu yang ia tahu, jujur soal yang belum, dan selalu menyertakan sumber.",
  openGraph: {
    title: "Manifesto | NaLI by NatIve",
    description:
      "Prinsip editorial NaLI by NatIve: jujur soal keyakinan, selalu menyertakan sumber.",
    type: "article",
  },
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Jujur soal tingkat keyakinan",
    body: "Tidak semua yang kami tulis sudah pasti. Maka setiap tulisan diberi label: terverifikasi kuat, didukung sumber, terbatas, atau belum cukup bukti, dan klaim yang masih diperdebatkan ditandai per-klaim. Pembaca berhak tahu seberapa kuat dasar sebuah klaim.",
  },
  {
    n: "02",
    title: "Tidak ada kepastian palsu",
    body: "Kami tidak menyimpulkan lebih dari yang bukti izinkan. Lebih baik menulis “belum jelas” daripada terdengar yakin tapi salah.",
  },
  {
    n: "03",
    title: "Tidak ada tuduhan tanpa bukti",
    body: "Investigasi berbasis sumber publik. Jika bukti belum cukup untuk menuduh, kami tidak menuduh, kami menelusuri dan menandainya.",
  },
  {
    n: "04",
    title: "Sumber selalu ditampilkan",
    body: "Setiap artikel membawa daftar rujukannya. Arsip sumber terbuka untuk diperiksa. Transparansi bukan tambahan, melainkan syarat.",
  },
  {
    n: "05",
    title: "AI menelusuri, manusia memutuskan",
    body: "AI membantu menggali, merangkum, dan menyusun. Tapi keputusan editorial, apa yang layak terbit dan dengan label apa, tetap di tangan manusia.",
  },
  {
    n: "06",
    title: "Bangun sekali, terbitkan rutin",
    body: "Energi kami untuk menelusuri dan menulis, bukan membangun ulang tanpa henti. Publikasi yang konsisten mengalahkan kesempurnaan yang tak pernah selesai, tapi kualitas dan ketertelusuran sumber selalu didahulukan ketimbang mengejar jumlah.",
  },
  {
    n: "07",
    title: "Tidak mengklaim yang tak kami lakukan",
    body: "NaLI bekerja dari sumber terbuka: jurnal, arsip, laporan lembaga, dataset, observasi peneliti, dan foto berlisensi. Kami tidak berpura-pura turun ke lapangan. Tidak ada klaim observasi, pengukuran, atau foto lapangan pribadi kecuali bukti pertama benar-benar ada dan ditampilkan jelas.",
  },
];

export default function ManifestoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Editorial"
        title="Manifesto"
        description="Kenapa NaLI by NatIve ada, dan aturan main yang kami pegang."
      />

      <div className="container-read py-12 sm:py-16">
        <div className="prose-nali">
          <p>
            Indonesia menyimpan terlalu banyak cerita yang belum ditelusuri, ekologi yang luput dicatat, sejarah yang nyaris terlupa, dan fenomena
            yang berdesas-desus tanpa pernah diperiksa. NaLI by NatIve hadir untuk
            menelusuri hal-hal itu secara serius, dengan bantuan AI, lalu
            menceritakannya dengan jujur.
          </p>
          <p>
            <strong>NaLI</strong>, Nature, Archive, Lore, Investigation.{" "}
            <strong>by NatIve</strong>, local intelligence dan riset berbasis
            sumber terbuka dari sudut pandang Indonesia sendiri.
          </p>
        </div>

        <ol className="mt-12 space-y-10">
          {PRINCIPLES.map((p) => (
            <li key={p.n} className="border-t border-dashed border-ink/50 pt-6">
              <div className="flex gap-5">
                <span className="font-mono text-sm text-ink">{p.n}</span>
                <div>
                  <h2 className="font-display text-2xl text-ink-black">{p.title}</h2>
                  <p className="mt-2 leading-relaxed text-ink-charcoal">{p.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-14 border-t border-dashed border-ink/70 pt-6 font-display text-xl italic leading-snug text-ink-charcoal">
          “Telusuri sampai ke sumbernya. Ceritakan apa adanya. Tandai yang belum
          pasti.”
        </p>
      </div>
    </>
  );
}
