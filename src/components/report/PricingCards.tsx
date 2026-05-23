"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PLAN_CATALOG, TOP_UP_PACKS, Plan, TopUpPack } from "@/lib/pricing/plans";

interface PricingCardsProps {
  reportId?: string | null;
  reportAccessKey?: string | null;
  onSuccess?: () => void;
}

export function PricingCards({ reportId, reportAccessKey, onSuccess }: PricingCardsProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (type: "plan" | "topup", itemId: string) => {
    if (itemId === "free") {
      if (onSuccess) onSuccess();
      else router.push("/create-report");
      return;
    }

    if (!reportId || !reportAccessKey) {
      // Redirect to workspace page to create a guest session first
      router.push(`/create-report?item_type=${type}&item_id=${itemId}`);
      return;
    }

    setLoadingId(itemId);
    setError(null);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          report_access_key: reportAccessKey,
          plan_id: type === "plan" ? itemId : undefined,
          pack_id: type === "topup" ? itemId : undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "Gagal memproses pembayaran. Silakan coba lagi.");
        return;
      }

      if (payload.checkout_url) {
        window.location.assign(payload.checkout_url);
      } else if (payload.payment_reference) {
        alert(
          `Pembayaran pending. Pesanan Anda akan diproses secara otomatis setelah pembayaran terverifikasi oleh sistem. Referensi: ${payload.payment_reference}`
        );
        if (onSuccess) onSuccess();
      }
    } catch {
      setError("Gagal menghubungi server pembayaran.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full space-y-12">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Plan Section */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white">Pilih Paket Kredit Bulanan</h3>
          <p className="text-xs text-white/50 mt-1.5">
            Dapatkan jatah kredit tetap setiap bulan untuk analisis draf laporan Anda.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_CATALOG.map((plan: Plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white/[0.02] p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.04] ${
                plan.popular
                  ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "border-white/[0.08] hover:border-white/[0.12]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-0.5 text-[10px] font-semibold text-zinc-950 flex items-center gap-1 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Terpopuler
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <p className="text-xs text-white/40 mt-1 leading-5 min-h-[36px]">{plan.description}</p>
                </div>
                <Badge tone={plan.id === "free" ? "green" : "glass"}>
                  {plan.credits} Kredit
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-extrabold text-white">{plan.priceLabel}</span>
              </div>

              <div className="mt-5 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Fitur Akses</p>
                <ul className="mt-2.5 space-y-2 text-xs text-white/50">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/50" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <Button
                  onClick={() => handleCheckout("plan", plan.id)}
                  disabled={loadingId !== null}
                  className={`w-full text-xs font-semibold h-9 ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]"
                  }`}
                >
                  {loadingId === plan.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Up Section */}
      <div className="border-t border-white/[0.06] pt-10">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white">Top-Up Paket Kredit</h3>
          <p className="text-xs text-white/50 mt-1.5">
            Kehabisan kredit sebelum akhir bulan? Beli paket tambahan instan tanpa mengubah status langganan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOP_UP_PACKS.map((pack: TopUpPack) => (
            <div
              key={pack.id}
              className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 hover:bg-white/[0.03] transition duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{pack.name}</h4>
                  <p className="text-[11px] text-white/40 mt-1 leading-4">{pack.description}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-white/80">{pack.priceLabel}</span>
                  <span className="inline-block rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300 mt-1">
                    +{pack.credits} Kredit
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <Button
                  onClick={() => handleCheckout("topup", pack.id)}
                  disabled={loadingId !== null}
                  className="w-full text-[11px] h-8 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
                >
                  {loadingId === pack.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Beli Paket"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-[11px] text-white/40 space-y-1.5">
        <p>
          * <strong>NaLI tidak menawarkan generasi tanpa batas (unlimited)</strong>. Kredit digunakan untuk pemrosesan draf laporan, perbaikan gaya bahasa, pemeriksaan bukti/sumber, dan tindakan ekspor (Markdown & PDF).
        </p>
        <p>
          * Selama masa early release/uji coba, paket langganan Starter / Pro / Max dapat diproses sebagai pembelian kredit satu kali saja hingga sistem pembayaran berulang (recurring billing) resmi diaktifkan.
        </p>
      </div>
    </div>
  );
}
