"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { NaLILogoMark } from "@/components/ui/NaLILogo";
import { isGoogleOAuthLikelyConfigured, getAuthRedirectBaseUrl } from "@/lib/auth/config";
import type { Metadata } from "next";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/create-report";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Kata sandi tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signupError) {
      const isDuplicate =
        signupError.message.toLowerCase().includes("already registered") ||
        signupError.message.toLowerCase().includes("already exists") ||
        (signupError as any).status === 400;
      setError(
        isDuplicate
          ? "DUPLICATE_EMAIL"
          : signupError.message,
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);

    if (!isGoogleOAuthLikelyConfigured()) {
      setError("Login Google belum dikonfigurasi.");
      setGoogleLoading(false);
      return;
    }

    const redirectUrl = `${getAuthRedirectBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (oauthError) {
        setError("Daftar dengan Google gagal. Coba lagi.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Daftar dengan Google gagal. Coba lagi.");
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative w-full max-w-[400px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-md text-center">
        <NaLILogoMark size={48} variant="light" className="mb-6 mx-auto" />
        <h1 className="font-serif text-2xl font-semibold text-white mb-3">Cek email kamu</h1>
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          Kami sudah kirim link konfirmasi ke{" "}
          <span className="text-white font-medium">{email}</span>. Klik link itu untuk mengaktifkan akun kamu.
        </p>
        <p className="text-xs text-white/35 mb-6">Tidak dapat email? Cek folder spam.</p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[#09090b] hover:bg-white/90 transition"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[400px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col items-center text-center mb-8">
        <NaLILogoMark size={48} variant="light" className="mb-4" />
        <h1 className="font-serif text-2xl font-semibold text-white tracking-wide">Buat Akun NaLI</h1>
        <p className="text-xs text-white/50 mt-2 leading-relaxed">
          Mulai dokumentasi lapangan kamu
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          Daftar dengan Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-white/[0.06]" />
          <span className="px-3 text-[10px] uppercase tracking-widest text-white/35 font-medium">atau</span>
          <div className="flex-grow border-t border-white/[0.06]" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 text-sm text-white placeholder-white/20 transition focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 text-sm text-white placeholder-white/20 transition focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-1.5">
              Kata Sandi (Min. 8 Karakter)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Min. 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] pl-3.5 pr-11 text-sm text-white placeholder-white/20 transition focus:border-white/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Tampilkan kata sandi"
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40 mb-1.5">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Ulangi kata sandi"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] pl-3.5 pr-11 text-sm text-white placeholder-white/20 transition focus:border-white/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Tampilkan konfirmasi"
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error === "DUPLICATE_EMAIL" ? (
                <span>
                  Email ini sudah terdaftar. Silakan masuk dengan akun yang ada.{" "}
                  <Link href="/login" className="font-semibold text-red-300 underline underline-offset-2">
                    Masuk sekarang
                  </Link>
                </span>
              ) : (
                error
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-[#09090b] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Daftar
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-white hover:underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#050a07] text-[#f5f0e8] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,53,37,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <Suspense
        fallback={
          <div className="relative w-full max-w-[400px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </main>
  );
}
