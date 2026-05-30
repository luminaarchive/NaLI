"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "seeds",
    name: "Seeds",
    badge: "Mulai dari sini",
    monthlyPrice: 0,
    annualPrice: 0,
    features: ["3 laporan/bulan", "Format markdown", "Riwayat lokal"],
    highlight: false,
    ctaLabel: "Mulai Gratis",
    ctaHref: "/signup",
  },
  {
    id: "sapling",
    name: "Sapling",
    badge: "Paling Populer",
    monthlyPrice: 45000,
    annualPrice: 36000,
    annualTotal: 432000,
    features: ["Laporan tak terbatas", "Ekspor PDF", "Riwayat akun", "Prioritas model AI"],
    highlight: true,
    ctaLabel: "Berlangganan Sapling",
    ctaHref: null,
  },
  {
    id: "forest_keeper",
    name: "Forest Keeper",
    badge: "Untuk Profesional",
    monthlyPrice: 149000,
    annualPrice: 119200,
    annualTotal: 1430400,
    features: ["Semua fitur Sapling", "Analisis jurnal", "Akses model terbaik", "Dukungan prioritas"],
    highlight: false,
    ctaLabel: "Berlangganan Forest Keeper",
    ctaHref: null,
  },
];

function formatRp(n: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

const FAQ = [
  {
    q: "Apakah bisa batal kapan saja?",
    a: "Ya, bisa dibatalkan kapan saja tanpa biaya tambahan.",
  },
  {
    q: "Metode pembayaran apa yang diterima?",
    a: "Transfer bank, kartu kredit, GoPay, OVO, QRIS via Midtrans.",
  },
  {
    q: "Apakah data laporan saya aman?",
    a: "Ya, data tersimpan di server terenkripsi dan tidak dibagikan ke pihak ketiga.",
  },
];

function PlanCard({ plan, isAnnual }: { plan: (typeof PLANS)[number]; isAnnual: boolean }) {
  const router = useRouter();
  const price = isAnnual && "annualPrice" in plan ? plan.annualPrice : plan.monthlyPrice;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setError(null);
    setLoading(true);

    // Check if user is logged in
    const { supabase } = await import("@/lib/supabase/client");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/pricing`);
      return;
    }

    try {
      const res = await fetch("/api/payment/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat transaksi.");
        setLoading(false);
        return;
      }

      const { token } = data;
      if (!token) {
        setError("Token pembayaran tidak valid.");
        setLoading(false);
        return;
      }

      // Load Midtrans Snap
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      const snapSrc =
        process.env.MIDTRANS_IS_PRODUCTION === "true"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js";

      if (!(window as any).snap) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = snapSrc;
          if (clientKey) script.setAttribute("data-client-key", clientKey);
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Gagal memuat payment gateway."));
          document.head.appendChild(script);
        });
      }

      (window as any).snap.pay(token, {
        onSuccess: () => router.push("/create-report?subscribed=true"),
        onError: () => setError("Pembayaran gagal. Coba lagi."),
        onClose: () => setLoading(false),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_4px_24px_rgba(30,53,37,0.04)] transition-all",
        plan.highlight ? "border-[#1e3525] shadow-[0_4px_24px_rgba(30,53,37,0.10)]" : "border-[#1e3525]/12",
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-[#1e3525] px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-xl font-bold text-[#1e3525]">{plan.name}</h3>
          {!plan.highlight && (
            <span className="inline-flex items-center rounded-full border border-[#1e3525]/12 bg-[#1e3525]/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#1e3525]">
              {plan.badge}
            </span>
          )}
        </div>
        <p className="mt-4 text-3xl font-extrabold text-[#1e3525]">
          {price === 0 ? "Rp 0" : formatRp(price)}
          {price > 0 && (
            <span className="text-sm font-normal text-[#4a6455]">
              {isAnnual ? "/bulan, ditagih tahunan" : "/bulan"}
            </span>
          )}
        </p>
        {isAnnual && "annualTotal" in plan && plan.annualTotal && price > 0 && (
          <p className="mt-1 text-xs text-[#4a6455]">{formatRp(plan.annualTotal)}/tahun</p>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#4a6455]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3525]" />
            {f}
          </li>
        ))}
      </ul>

      {error && (
        <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      {plan.ctaHref ? (
        <Link
          href={plan.ctaHref}
          className={cn(
            "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition",
            plan.highlight
              ? "bg-[#1e3525] text-white hover:bg-[#162d1d]"
              : "border border-[#1e3525]/20 text-[#1e3525] hover:bg-[#1e3525]/5",
          )}
        >
          {plan.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={cn(
            "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
            plan.highlight
              ? "bg-[#1e3525] text-white hover:bg-[#162d1d]"
              : "border border-[#1e3525]/20 text-[#1e3525] hover:bg-[#1e3525]/5",
          )}
        >
          {loading ? "Memproses..." : plan.ctaLabel}
        </button>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#1e3525]/12 bg-white/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#1e3525]"
      >
        {q}
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#4a6455]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#4a6455]" />
        )}
      </button>
      {open && <p className="border-t border-[#1e3525]/8 px-5 pt-3 pb-4 text-xs leading-relaxed text-[#4a6455]">{a}</p>}
    </div>
  );
}

export function PricingContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get("payment");
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <PublicAppShell isHomepage={true}>
      <main className="flex-1 bg-[#f5f0e8] px-4 pt-16 pb-24 text-[#1e3525] sm:px-6 lg:px-8">
        {paymentStatus === "success" && (
          <div className="mx-auto mb-6 max-w-[760px] rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800">
            Pembayaran berhasil! Selamat bergabung di paket premium NaLI.
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="mx-auto mb-6 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-800">
            Pembayaran gagal atau dibatalkan. Silakan coba lagi.
          </div>
        )}

        {/* HERO */}
        <section className="mx-auto mb-14 max-w-[760px] text-center">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#1e3525]/12 bg-[#1e3525]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#1e3525] uppercase">
            Harga
          </span>
          <h1 className="mt-6 font-serif text-[clamp(28px,4vw,44px)] font-bold tracking-tight text-[#1e3525]">
            Paket Laporan NaLI
          </h1>
          <p className="mx-auto mt-4 max-w-[480px] text-sm leading-relaxed text-[#4a6455]">
            Mulai gratis. Tingkatkan saat kamu siap.
          </p>
        </section>

        {/* PRICING CARDS */}
        <section className="mx-auto mb-10 max-w-[960px]">
          {/* Annual / Monthly toggle */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className={cn("text-sm font-medium", !isAnnual ? "text-[#1e3525]" : "text-[#4a6455]")}>Bulanan</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                isAnnual ? "bg-[#1e3525]" : "bg-[#1e3525]/20",
              )}
              aria-label="Toggle annual billing"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                  isAnnual ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                isAnnual ? "text-[#1e3525]" : "text-[#4a6455]",
              )}
            >
              Tahunan
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Hemat 20%
              </span>
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mb-16 max-w-[760px]">
          <h2 className="mb-8 text-center font-serif text-2xl font-bold tracking-tight text-[#1e3525]">
            Pertanyaan Umum
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[760px]">
          <div className="relative overflow-hidden rounded-3xl border border-[#1e3525]/12 bg-white/80 p-8 text-center shadow-[0_4px_24px_rgba(30,53,37,0.02)] sm:p-12">
            <h2 className="mb-4 font-serif text-2xl font-bold text-[#1e3525]">Siap menyusun laporan lapangan?</h2>
            <p className="mx-auto mb-8 max-w-[480px] text-sm leading-relaxed text-[#4a6455]">
              Mulai gratis. Draft awal menyertakan disclaimer dan batas bukti secara transparan.
            </p>
            <Link
              href="/create-report"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-6 text-sm font-bold text-white transition-all hover:bg-[#162d1d]"
            >
              Buat Laporan Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
