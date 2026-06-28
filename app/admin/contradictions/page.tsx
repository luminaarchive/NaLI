import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContradictionReviewButtons } from "@/components/admin/ContradictionReviewButtons";
import { getAllContradictions, type Contradiction } from "@/lib/contradictions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<Contradiction["status"], string> = {
  candidate: "Kandidat",
  confirmed: "Dikonfirmasi",
  dismissed: "Diabaikan",
};

function ClaimSide({ label, slug, text, status }: { label: string; slug: string; text: string; status: string }) {
  return (
    <div className="border-l-2 border-dashed border-ink/40 pl-3">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink/55">
        {label} ·{" "}
        <Link href={`/articles/${slug}`} className="link-teal" target="_blank">
          {slug} ↗
        </Link>{" "}
        · {status}
      </p>
      <p className="mt-1 font-mono text-[0.8rem] leading-relaxed text-ink-charcoal">{text}</p>
    </div>
  );
}

export default async function AdminContradictionsPage() {
  const all = await getAllContradictions();
  const candidates = all.filter((c) => c.status === "candidate");
  const confirmed = all.filter((c) => c.status === "confirmed");
  const dismissed = all.filter((c) => c.status === "dismissed");

  return (
    <AdminShell active="contradictions">
      <div className="p-6 sm:p-10">
        <header className="border-b border-dashed border-ink/40 pb-5">
          <h1 className="font-display text-3xl font-black text-ink">Kontradiksi</h1>
          <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
            Pasangan klaim lintas-tulisan yang terdeteksi saling bertentangan. Kemiripan bukan bukti:
            hanya yang kamu <span className="text-ink">konfirmasi</span> yang tampil ke pembaca.
            Hasilkan kandidat dengan <code className="text-ink-deep">npm run detect:contradictions</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-wider text-gray">
            <span>Kandidat: <span className="text-ink">{candidates.length}</span></span>
            <span>Dikonfirmasi: <span className="text-ink">{confirmed.length}</span></span>
            <span>Diabaikan: <span className="text-ink">{dismissed.length}</span></span>
          </div>
        </header>

        {all.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada kandidat. Jalankan{" "}
              <code className="text-ink-deep">npm run detect:contradictions</code> (butuh
              GOOGLE_GENERATIVE_AI_API_KEY dan SUPABASE_SERVICE_ROLE_KEY di .env.local) untuk
              memindai korpus.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {[
              { key: "candidate", title: "Menunggu peninjauan", rows: candidates },
              { key: "confirmed", title: "Dikonfirmasi (tampil ke publik)", rows: confirmed },
              { key: "dismissed", title: "Diabaikan", rows: dismissed },
            ].map((group) =>
              group.rows.length === 0 ? null : (
                <section key={group.key}>
                  <h2 className="label text-ink/70">{group.title}</h2>
                  <ul className="mt-4 space-y-4">
                    {group.rows.map((c) => (
                      <li key={c.id} className="border border-dashed border-ink/50 bg-paper p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[0.64rem] uppercase tracking-wider text-ink/55">
                            Kemiripan {(c.similarity * 100).toFixed(0)}% · {STATUS_LABEL[c.status]} ·{" "}
                            {formatDate(c.createdAt)}
                          </span>
                          <ContradictionReviewButtons id={c.id} status={c.status} />
                        </div>
                        <div className="mt-3 space-y-3">
                          <ClaimSide label="Klaim A" slug={c.claimAArticleSlug} text={c.claimAText} status={c.claimAStatus} />
                          <ClaimSide label="Klaim B" slug={c.claimBArticleSlug} text={c.claimBText} status={c.claimBStatus} />
                        </div>
                        {c.llmRationale && (
                          <p className="mt-3 border-t border-dashed border-ink/30 pt-2 font-mono text-[0.72rem] italic leading-relaxed text-gray">
                            Penilaian model: {c.llmRationale}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
