"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Microscope, ShieldCheck, Trees } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types/common";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

const roles: Array<{ value: UserRole; title: string; description: string }> = [
  {
    value: "ranger",
    title: "Ranger",
    description: "Patrol observations, protected species records, and field review workflows.",
  },
  {
    value: "researcher",
    title: "Researcher",
    description: "Survey records, ecological review, and scientific observation exports.",
  },
  {
    value: "student",
    title: "Student",
    description: "Guided field learning with scientific names and conservation context.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [institution, setInstitution] = useState("");

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          institution: institution || null,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        institution: institution || null,
      });
    }

    router.replace("/archive");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 lg:grid-cols-[0.85fr_1.15fr]">
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
              {t("auth.registerEyebrow")}
            </p>
            <h1 className="mt-3 w-full max-w-[28rem] text-3xl font-semibold leading-tight sm:text-4xl">
              {t("auth.registerTitle")}
            </h1>
            <p className="mt-4 w-full max-w-[28rem] text-sm leading-6 text-white/50">{t("auth.registerContext")}</p>
          </div>

          {/* Right panel - form */}
          <div className="bg-[#09090b] p-5 sm:p-8 lg:p-10">
            <form className="mx-auto w-full max-w-[620px] space-y-5" onSubmit={handleRegister}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("auth.fullName")}>
                  <input
                    autoComplete="name"
                    className="field-input"
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Siti Rahma"
                    required
                    type="text"
                    value={fullName}
                  />
                </Field>
                <Field label={t("auth.institutionOptional")}>
                  <input
                    className="field-input"
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder={t("auth.institutionPlaceholder")}
                    type="text"
                    value={institution}
                  />
                </Field>
              </div>

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
                    autoComplete="new-password"
                    className="field-input pr-12"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("auth.passwordMinimum")}
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

              <div>
                <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
                  {t("auth.role")}
                </span>
                <div className="grid gap-3">
                  {roles.map((item) => (
                    <button
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                        role === item.value
                          ? "border-white/[0.15] bg-white/[0.08]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                      }`}
                      key={item.value}
                      onClick={() => setRole(item.value)}
                      type="button"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            role === item.value
                              ? "bg-white text-[#09090b]"
                              : "border border-white/[0.06] bg-white/[0.04] text-white/50"
                          }`}
                        >
                          {item.value === "ranger" ? (
                            <Trees className="h-5 w-5" />
                          ) : item.value === "researcher" ? (
                            <Microscope className="h-5 w-5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5" />
                          )}
                        </span>
                        <span>
                          <span className="block font-semibold text-white">{t(`auth.roles.${item.value}`)}</span>
                          <span className="mt-1 block text-sm leading-5 text-white/40">
                            {t(`auth.roles.${item.value}Description`, item.description)}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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
                {t("common.createAccount")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              {t("auth.alreadyRegistered")}{" "}
              <Link className="font-semibold text-white underline-offset-4 hover:underline" href="/login">
                {t("common.signIn")}
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
