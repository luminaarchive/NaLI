"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * Correction submission form (F6.1). No backend: composes a structured email to
 * the editorial address with the required fields so a correction is actionable.
 * Keeps NaLI's no-login, low-infra posture while making submission concrete.
 */
export function CorrectionForm() {
  const [url, setUrl] = useState("");
  const [claim, setClaim] = useState("");
  const [correction, setCorrection] = useState("");
  const [source, setSource] = useState("");

  const ready = url.trim() && claim.trim() && correction.trim() && source.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const subject = `Koreksi untuk NaLI: ${url.trim()}`;
    const body = [
      `Tautan tulisan: ${url.trim()}`,
      "",
      `Klaim yang keliru:`,
      claim.trim(),
      "",
      `Koreksi yang diusulkan:`,
      correction.trim(),
      "",
      `Sumber pendukung:`,
      source.trim(),
    ].join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "w-full border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.8rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="label text-gray">Tautan tulisan</span>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://nalijournal.vercel.app/articles/..."
          className={`mt-1 ${field}`}
        />
      </label>
      <label className="block">
        <span className="label text-gray">Klaim yang keliru</span>
        <textarea
          required
          rows={2}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Kutip kalimat atau paragraf yang salah."
          className={`mt-1 ${field}`}
        />
      </label>
      <label className="block">
        <span className="label text-gray">Koreksi yang diusulkan</span>
        <textarea
          required
          rows={2}
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="Apa yang seharusnya, menurut Anda."
          className={`mt-1 ${field}`}
        />
      </label>
      <label className="block">
        <span className="label text-gray">Sumber pendukung</span>
        <input
          type="text"
          required
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="URL, DOI, atau dokumen resmi yang bisa ditelusuri."
          className={`mt-1 ${field}`}
        />
      </label>
      <button
        type="submit"
        disabled={!ready}
        className="border border-ink bg-ink px-5 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        Kirim koreksi
      </button>
      <p className="font-mono text-[0.68rem] leading-relaxed text-gray-light">
        Tombol ini menyiapkan email berisi keempat bagian di atas ke {SITE.email}. Tidak
        ada data yang disimpan di situs.
      </p>
    </form>
  );
}
