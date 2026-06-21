import { Timer, ArrowDown } from "lucide-react";
import { CLAIM_STATUS_LABEL, type ClaimLedgerItem, type ClaimStatus } from "@/lib/types";

const STATUS_COLOR: Record<ClaimStatus, string> = {
  "terverifikasi kuat": "text-ink-deep",
  "didukung sumber": "text-ink",
  terbatas: "text-[#9c6a08] dark:text-[#e8c277]",
  diperdebatkan: "text-[#9c3c08] dark:text-[#f0a36e]",
  "belum cukup bukti": "text-[#a31515] dark:text-[#f09090]",
};

/**
 * Tiered entry into a long article: a 30-second summary up top, an optional
 * one-minute "essence" from the claim ledger, and a jump to the full read. Lets a
 * reader choose how deep to go instead of bouncing off a wall of text. No JS: the
 * one-minute layer is a native disclosure.
 */
export function QuickRead({
  summary,
  readingMinutes,
  claimLedger,
}: {
  summary: string;
  readingMinutes: number;
  claimLedger?: ClaimLedgerItem[];
}) {
  if (!summary) return null;
  const essence = (claimLedger ?? []).slice(0, 4);

  return (
    <aside className="border border-dashed border-ink/60 bg-ink-wash/40 p-5 sm:p-6" aria-label="Ringkasan cepat">
      <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-deep">
        <Timer size={14} strokeWidth={1.8} aria-hidden />
        Ringkasan 30 detik
      </p>
      <p className="mt-3 font-mono text-[0.92rem] leading-relaxed text-ink-charcoal">
        {summary}
      </p>

      {essence.length > 0 ? (
        <details className="group mt-4 border-t border-dashed border-ink/40 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-deep">
              Inti 1 menit
            </span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-gray transition-transform group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <ul className="mt-3 space-y-2.5">
            {essence.map((c, i) => (
              <li key={i} className="flex flex-col gap-0.5 border-l-2 border-dashed border-ink/40 pl-3">
                <span className="font-mono text-[0.82rem] leading-snug text-ink-charcoal">{c.claim}</span>
                <span className={`font-mono text-[0.64rem] font-semibold uppercase tracking-[0.08em] ${STATUS_COLOR[c.status]}`}>
                  {CLAIM_STATUS_LABEL[c.status]}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <a
        href="#isi"
        className="mt-5 inline-flex items-center gap-2 border border-dashed border-ink/50 bg-paper px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
      >
        Baca lengkap
        <span className="text-gray">({readingMinutes} mnt)</span>
        <ArrowDown size={13} strokeWidth={1.8} aria-hidden />
      </a>
    </aside>
  );
}
