"use client";

import { useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabaseClient";

type Status = "idle" | "loading" | "ok" | "dupe" | "invalid" | "error";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const MESSAGE: Record<Exclude<Status, "idle" | "loading">, string> = {
  ok: "Terima kasih, kamu akan dapat kabar tiap ada tulisan baru.",
  dupe: "Email ini sudah terdaftar. Sampai jumpa di kiriman berikutnya.",
  invalid: "Sepertinya format emailnya belum tepat.",
  error: "Maaf, ada kendala. Coba lagi sebentar lagi, ya.",
};

export function NewsletterSignup({
  variant = "dark",
}: {
  /** "dark" untuk latar gelap, "light" untuk latar terang */
  variant?: "dark" | "light";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const done = status === "ok" || status === "dupe";
  const light = variant === "light";

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
          className={`h-12 w-full border px-5 text-base focus:outline-none disabled:opacity-60 sm:max-w-xs ${
            light
              ? "border-dashed border-ink/60 bg-paper font-mono text-ink-charcoal placeholder:text-gray-light focus:border-ink"
              : "border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-teal"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || done}
          className={`h-12 shrink-0 px-7 font-mono text-[0.8rem] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-70 ${
            light
              ? "bg-ink text-white hover:bg-ink-deep"
              : "bg-teal text-ink-black hover:bg-teal-dark hover:text-white"
          }`}
        >
          {status === "loading" ? "Mengirim…" : done ? "Terdaftar ✓" : "Langganan"}
        </button>
      </form>

      <p
        className={`mt-3 min-h-[1.25rem] text-sm ${
          status === "ok" || status === "dupe"
            ? "text-ink-deep"
            : status === "invalid" || status === "error"
              ? "text-confidence-medium"
              : light
                ? "text-gray"
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
        <p className={`mt-1 text-xs ${light ? "text-gray-light" : "text-white/30"}`}>
          (Langganan aktif setelah Supabase env diatur di deployment.)
        </p>
      )}
    </div>
  );
}
