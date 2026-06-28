import Link from "next/link";
import type { ClaimLedgerItem, ClaimStatus, Confidence, EvidenceBasis } from "@/lib/types";
import { CLAIM_STATUS_LABEL } from "@/lib/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { articleDepth, DEPTH_LABEL, formatDate } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/*  KnowledgeGenome                                                            */
/*                                                                            */
/*  A "nutrition label" for an article's epistemic makeup, built entirely from */
/*  data already on the Article (confidence, claim ledger, evidence basis,     */
/*  sources, limitations). Server component, no client JS. Placed high in the  */
/*  article; it subsumes the old "Basis tulisan" banner.                       */
/* -------------------------------------------------------------------------- */

/** Claim-status order + semantic fill colors (mirrors the claim-ledger text colors). */
const CLAIM_ORDER: ClaimStatus[] = [
  "terverifikasi kuat",
  "didukung sumber",
  "terbatas",
  "diperdebatkan",
  "belum cukup bukti",
];

const CLAIM_FILL: Record<ClaimStatus, string> = {
  "terverifikasi kuat": "#0E8268",
  "didukung sumber": "#2DA98A",
  terbatas: "#c98f1f",
  diperdebatkan: "#d96a23",
  "belum cukup bukti": "#d33333",
};

const EVIDENCE_BASIS_TEXT: Record<EvidenceBasis, string> = {
  "sumber terbuka": "Sumber terbuka",
  "arsip historis": "Arsip historis",
  "jurnal ilmiah": "Jurnal ilmiah",
  "dokumen pemerintah": "Dokumen pemerintah",
  "observasi pihak ketiga": "Observasi pihak ketiga",
  campuran: "Campuran sumber",
};

interface KnowledgeGenomeProps {
  confidence: Confidence;
  claimLedger?: ClaimLedgerItem[];
  evidenceBasis?: EvidenceBasis;
  firstPartyFieldwork?: boolean;
  sourcesCount: number;
  limitationsCount: number;
  readingMinutes: number;
  /** Whether the page rendered a #claim-ledger / #batasan anchor to link into. */
  hasClaimLedgerAnchor: boolean;
  hasLimitationsAnchor: boolean;
  /** Last substantive update (ISO date), soft start for the Phase-2 seam. */
  updated?: string;
  /** Confirmed cross-article contradictions touching this article (Step 2.1). */
  contradictionCount?: number;
}

export function KnowledgeGenome({
  confidence,
  claimLedger,
  evidenceBasis,
  firstPartyFieldwork,
  sourcesCount,
  limitationsCount,
  readingMinutes,
  hasClaimLedgerAnchor,
  hasLimitationsAnchor,
  updated,
  contradictionCount = 0,
}: KnowledgeGenomeProps) {
  const depth = articleDepth(readingMinutes);

  // Claim-status distribution from the ledger (only statuses that actually occur).
  const counts = CLAIM_ORDER.map((status) => ({
    status,
    value: (claimLedger ?? []).filter((c) => c.status === status).length,
  })).filter((s) => s.value > 0);
  const totalClaims = counts.reduce((sum, s) => sum + s.value, 0);

  return (
    <aside
      aria-label="Genom pengetahuan: ringkasan kualitas bukti artikel"
      className="border border-dashed border-ink/60 bg-ink-wash/40 p-5"
    >
      {/* Title + depth */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink/30 pb-3">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
          Genom Pengetahuan
        </p>
        <span className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-gray">
          {DEPTH_LABEL[depth]} · {readingMinutes} mnt
        </span>
      </div>

      {/* Confidence tier */}
      <div className="mt-4">
        <ConfidenceBadge confidence={confidence} />
      </div>

      {/* Claim composition strand (only when the article has a ledger) */}
      {totalClaims > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-gray">
            Komposisi klaim
          </p>
          <div
            role="img"
            aria-label={counts
              .map((s) => `${CLAIM_STATUS_LABEL[s.status]}: ${s.value}`)
              .join(", ")}
            className="mt-2 flex h-3 w-full overflow-hidden border border-dashed border-ink/40 bg-paper"
          >
            {counts.map((s) => (
              <div
                key={s.status}
                style={{
                  width: `${(s.value / totalClaims) * 100}%`,
                  backgroundColor: CLAIM_FILL[s.status],
                }}
                title={`${CLAIM_STATUS_LABEL[s.status]}: ${s.value}`}
                className="h-full border-l border-dashed border-paper/70 first:border-l-0"
              />
            ))}
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {counts.map((s) => (
              <li
                key={s.status}
                className="flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-wider text-gray"
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2"
                  style={{ backgroundColor: CLAIM_FILL[s.status] }}
                />
                {CLAIM_STATUS_LABEL[s.status]} · {s.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta grid */}
      <dl className="mt-5 space-y-2.5 border-t border-dashed border-ink/30 pt-4">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink/55">
            Basis bukti
          </dt>
          <dd className="font-mono text-[0.74rem] leading-relaxed text-ink-charcoal">
            {evidenceBasis
              ? EVIDENCE_BASIS_TEXT[evidenceBasis]
              : "Sumber terbuka, arsip, observasi pihak ketiga"}
            <span className="mt-0.5 block text-[0.7rem] text-ink/60">
              {firstPartyFieldwork
                ? "Memuat bukti lapangan langsung."
                : "Tanpa kerja lapangan langsung."}
            </span>
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-24 shrink-0 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink/55">
            Sumber
          </dt>
          <dd className="font-mono text-[0.74rem] text-ink-charcoal">
            {sourcesCount > 0 ? (
              hasClaimLedgerAnchor ? (
                <Link href="#claim-ledger" className="link-teal">
                  {sourcesCount} terverifikasi →
                </Link>
              ) : (
                `${sourcesCount} terverifikasi`
              )
            ) : (
              "Belum dicatat"
            )}
          </dd>
        </div>

        <div className="flex gap-3">
          <dt className="w-24 shrink-0 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink/55">
            Batasan
          </dt>
          <dd className="font-mono text-[0.74rem] text-ink-charcoal">
            {limitationsCount > 0 ? (
              hasLimitationsAnchor ? (
                <Link href="#batasan" className="link-teal">
                  {limitationsCount} dicatat →
                </Link>
              ) : (
                `${limitationsCount} dicatat`
              )
            ) : (
              "Tidak ada catatan khusus"
            )}
          </dd>
        </div>
      </dl>

      {/* PHASE-2 SEAM (Bucket B, Living Articles): this row is reserved for
          article Status (terkini / diperbarui / digantikan), a "Terakhir
          diperiksa" date, and a link to the full revision history. For now it
          renders only the existing `updated` date as a soft start. */}
      <div className="mt-4 border-t border-dashed border-ink/30 pt-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink/45">
          Status &amp; verifikasi
        </p>
        <p className="mt-1 font-mono text-[0.7rem] text-gray">
          {updated ? `Diperbarui ${formatDate(updated)}` : "Belum ada pembaruan tercatat"}
        </p>
        {contradictionCount > 0 && (
          <a
            href="#kontradiksi"
            className="mt-1.5 inline-block font-mono text-[0.7rem] font-semibold text-[#9c3c08] hover:underline dark:text-[#f0a36e]"
          >
            {contradictionCount} klaim diperdebatkan lintas tulisan →
          </a>
        )}
      </div>
    </aside>
  );
}
