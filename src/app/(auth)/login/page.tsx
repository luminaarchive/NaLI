"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { NaLILogoMark } from "@/components/ui/NaLILogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/create-report";
  const linkGuest = searchParams.get("linkGuest") || "";
  const callbackError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError === "confirmation_failed"
      ? "Konfirmasi akun gagal. Coba klik link di email lagi atau daftar ulang."
      : null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      const msg = loginError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setError("Email kamu belum dikonfirmasi. Cek inbox atau folder spam kamu.");
      } else {
        setError("Email atau password salah. Coba lagi.");
      }
      setLoading(false);
      return;
    }

    // Redirect to next path (default: /create-report), appending linkGuest if set
    const safeNext = (next.startsWith("/") && !next.startsWith("//")) ? next : "/create-report";
    const redirectUrl = linkGuest ? `${safeNext}${safeNext.includes("?") ? "&" : "?"}linkGuest=1` : safeNext;
    router.replace(redirectUrl);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    const redirectPath = linkGuest ? `${next}${next.includes("?") ? "&" : "?"}linkGuest=1` : next;

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError("Login Google gagal. Coba lagi.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Login Google gagal. Coba lagi.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[400px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col items-center text-center mb-8">
        <NaLILogoMark size={48} variant="light" className="mb-4" />
        <h1 className="font-serif text-2xl font-semibold text-white tracking-wide">Masuk ke NaLI</h1>
        <p className="text-xs text-white/50 mt-2 leading-relaxed">
          Lanjutkan laporan, catatan, dan riwayat kerja berbasis bukti.
        </p>
      </div>

      <div className="space-y-4">
        {/* Google OAuth (Primary) */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/[0.12] bg-white text-sm font-semibold text-[#1f1f1f] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#1f1f1f]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          Lanjutkan dengan Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-white/[0.06]"></div>
          <span className="px-3 text-[10px] uppercase tracking-widest text-white/35 font-medium">atau</span>
          <div className="flex-grow border-t border-white/[0.06]"></div>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
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
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error === "BLOCKED BY DASHBOARD CONFIG" ? "Login Google belum dikonfigurasi. Hubungi admin." : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-[#09090b] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-xs text-white/40">
        Belum punya akun?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}${linkGuest ? `&linkGuest=${linkGuest}` : ""}`}
          className="font-semibold text-white hover:underline underline-offset-4"
        >
          Buat akun
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#050a07] text-[#f5f0e8] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative premium radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,53,37,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      
      <Suspense fallback={
        <div className="relative w-full max-w-[400px] rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-md flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
