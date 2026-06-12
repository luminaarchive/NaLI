"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }
    router.refresh();
    router.replace("/admin");
  }

  return (
    <div className="container-read flex min-h-[70vh] flex-col justify-center py-16">
      <p className="label text-ink">NaLI · Dashboard</p>
      <h1 className="mt-3 font-display text-4xl font-black uppercase text-ink">
        Masuk Admin
      </h1>
      <p className="mt-3 font-mono text-[0.85rem] text-gray">
        Khusus pengelola. Akun dibuat di dashboard Supabase.
      </p>

      <form onSubmit={onSubmit} className="mt-8 max-w-sm space-y-4">
        <div>
          <label htmlFor="email" className="label mb-1 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full border border-dashed border-ink/60 bg-paper px-4 font-mono text-sm text-ink-charcoal focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="label mb-1 block">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full border border-dashed border-ink/60 bg-paper px-4 font-mono text-sm text-ink-charcoal focus:border-ink focus:outline-none"
          />
        </div>
        {error && (
          <p className="font-mono text-sm text-confidence-medium">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full border border-ink bg-ink font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-60"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
