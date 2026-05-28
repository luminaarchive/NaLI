"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { NaLILogoMark } from "@/components/ui/NaLILogo";

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-[#050a07] text-[#f5f0e8] flex items-center justify-center px-4">
      <div className="relative w-full max-w-[420px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="flex justify-center mb-6">
          <NaLILogoMark size={44} variant="light" />
        </div>
        
        <div className="flex justify-center mb-4 text-rose-500">
          <AlertCircle className="h-12 w-12" />
        </div>

        <h1 className="font-serif text-2xl font-semibold mb-2">Gagal Masuk</h1>
        <p className="text-sm text-white/50 leading-relaxed mb-8">
          Sesi login Anda tidak valid atau telah kedaluwarsa. Silakan coba masuk kembali.
        </p>

        <Link
          href="/login"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#09090b] transition hover:bg-white/90"
        >
          Kembali ke Halaman Masuk
        </Link>
      </div>
    </main>
  );
}
