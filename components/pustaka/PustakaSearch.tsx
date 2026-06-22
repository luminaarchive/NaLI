"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Client search box that drives the server-rendered Pustaka listing via ?q=. */
export function PustakaSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/pustaka?q=${encodeURIComponent(q)}` : "/pustaka");
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-2xl gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari judul, topik, atau penulis. Contoh: Wallacea, Krakatau, mangrove"
        className="w-full border border-ink/40 bg-paper px-4 py-3 font-mono text-[0.85rem] text-ink outline-none placeholder:text-gray/70 focus:border-ink"
        aria-label="Cari pustaka terbuka"
      />
      <button
        type="submit"
        className="shrink-0 border border-ink bg-ink px-5 py-3 font-mono text-[0.7rem] uppercase tracking-widest text-paper transition hover:bg-ink-deep"
      >
        Cari
      </button>
    </form>
  );
}
