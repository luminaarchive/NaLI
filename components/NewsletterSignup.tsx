"use client";

import { useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

type Status = "idle" | "loading" | "ok" | "dupe" | "invalid" | "error";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const MESSAGE: Record<Exclude<Status, "idle" | "loading">, string> = {
  ok: "Terima kasih — kamu akan dapat kabar tiap ada tulisan baru.",
  dupe: "Email ini sudah terdaftar. Sampai jumpa di kiriman berikutnya.",
  invalid: "Sepertinya format emailnya belum tepat.",
  error: "Maaf, ada kendala. Coba lagi sebentar lagi, ya.",
};

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const done = status === "ok" || status === "dupe";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setStatus("invalid");
      return;
    }
    if (!supabase) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: value, source: "web", locale: "id" });

    if (!error) {
      setStatus("ok");
      setEmail("");
    } else if (error.code === "23505") {
      setStatus("dupe");
    } else {
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Alamat email
        </label>
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={done}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          placeholder="nama@email.com"
          className="h-12 w-full rounded-full border border-white/20 bg-white/5 px-5 text-base text-white placeholder:text-white/40 focus:border-teal focus:outline-none disabled:opacity-60 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={status === "loading" || done}
          className="h-12 shrink-0 rounded-full bg-teal px-7 text-sm font-semibold text-ink-black transition-transform hover:scale-[1.03] hover:bg-teal-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Mengirim…" : done ? "Terdaftar ✓" : "Langganan"}
        </button>
      </form>

      <p
        className={`mt-3 min-h-[1.25rem] text-sm ${
          status === "ok" || status === "dupe"
            ? "text-teal"
            : status === "invalid" || status === "error"
              ? "text-confidence-medium"
              : "text-white/45"
        }`}
        role="status"
        aria-live="polite"
      >
        {status === "idle" || status === "loading"
          ? "Tanpa spam. Berhenti kapan saja."
          : MESSAGE[status]}
      </p>

      {!supabaseConfigured && (
        <p className="mt-1 text-xs text-white/30">
          (Langganan aktif setelah Supabase env diatur di deployment.)
        </p>
      )}
    </div>
  );
}
