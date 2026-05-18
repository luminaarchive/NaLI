"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/archive");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left panel */}
          <div className="border-b border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8 lg:border-r lg:border-b-0">
            <Link className="mb-8 inline-flex items-center gap-3" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-sm font-bold text-white">
                N
              </span>
              <span>
                <span className="block text-base font-semibold text-white">NaLI</span>
                <span className="text-xs text-white/40">Evidence-based Intelligence</span>
              </span>
            </Link>
            <div className="mb-6">
              <LanguageSwitcher />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
              {t("auth.workspace")}
            </p>
            <h1 className="mt-3 w-full max-w-[28rem] text-3xl font-semibold leading-tight sm:text-4xl">
              {t("auth.signInTitle")}
            </h1>
            <p className="mt-4 w-full max-w-[28rem] text-sm leading-6 text-white/50">{t("auth.signInContext")}</p>
          </div>

          {/* Right panel - form */}
          <div className="bg-[#09090b] p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[460px] space-y-5" onSubmit={handleLogin}>
              <Field label={t("auth.email")}>
                <input
                  autoComplete="email"
                  className="field-input"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  type="email"
                  value={email}
                />
              </Field>

              <Field label={t("auth.password")}>
                <div className="relative">
                  <input
                    autoComplete="current-password"
                    className="field-input pr-12"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 hover:text-white"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#09090b] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("common.signIn")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              {t("auth.newToNali")}{" "}
              <Link className="font-semibold text-white underline-offset-4 hover:underline" href="/register">
                {t("common.createAccount")}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
        {label}
      </span>
      {children}
    </label>
  );
}
