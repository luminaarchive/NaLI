"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ArticleSource, Category, Confidence, SourceType, Status } from "@/lib/types";

export interface EditablePost {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: Category;
  tags: string[];
  summary: string;
  confidence: Confidence;
  status: Status;
  sources: ArticleSource[];
  coverImage?: string | null;
  body: string;
}

const CATEGORIES: { v: Category; l: string }[] = [
  { v: "alam", l: "Alam" },
  { v: "sejarah", l: "Sejarah" },
  { v: "investigasi", l: "Investigasi" },
  { v: "catatan-lapangan", l: "Catatan Lapangan" },
];
const CONFIDENCES: { v: Confidence; l: string }[] = [
  { v: "high", l: "Terverifikasi" },
  { v: "medium", l: "Perlu konteks" },
  { v: "low", l: "Hipotesis kerja" },
  { v: "needs-verification", l: "Belum diverifikasi" },
];
const SOURCE_TYPES: SourceType[] = ["jurnal", "arsip", "buku", "media", "laporan", "lainnya"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

const field =
  "h-11 w-full border border-dashed border-ink/60 bg-paper px-3 font-mono text-sm text-ink-charcoal focus:border-ink focus:outline-none";
const area =
  "w-full border border-dashed border-ink/60 bg-paper p-3 font-mono text-sm text-ink-charcoal focus:border-ink focus:outline-none";

export function PostEditor({ initial }: { initial?: EditablePost }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [p, setP] = useState<EditablePost>(
    initial ?? {
      slug: "",
      title: "",
      subtitle: "",
      date: new Date().toISOString().slice(0, 10),
      category: "alam",
      tags: [],
      summary: "",
      confidence: "needs-verification",
      status: "draft",
      sources: [],
      coverImage: null,
      body: "",
    },
  );
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      setMsg(`Gagal upload gambar: ${error.message}`);
      return null;
    }
    return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("Mengunggah sampul…");
    const url = await uploadImage(file);
    if (url) {
      set("coverImage", url);
      setMsg("Sampul terunggah.");
    }
    setBusy(false);
    e.target.value = "";
  }

  async function onInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("Mengunggah gambar…");
    const url = await uploadImage(file);
    if (url) {
      const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`;
      const ta = bodyRef.current;
      const pos = ta ? ta.selectionStart : p.body.length;
      const next = p.body.slice(0, pos) + snippet + p.body.slice(pos);
      set("body", next);
      setMsg("Gambar disisipkan ke isi artikel.");
    }
    setBusy(false);
    e.target.value = "";
  }

  async function save(status: Status) {
    const title = p.title.trim();
    const slug = (p.slug || slugify(title)).trim();
    if (!title) return setMsg("Judul wajib diisi.");
    if (!slug) return setMsg("Slug wajib diisi.");
    setBusy(true);
    setMsg(null);
    const row = {
      slug,
      title,
      subtitle: p.subtitle,
      date: p.date,
      category: p.category,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      summary: p.summary,
      confidence: p.confidence,
      status,
      sources: p.sources.filter((s) => s.title.trim()),
      cover_image: p.coverImage || null,
      body: p.body,
    };
    const resp = p.id
      ? await supabase.from("posts").update(row).eq("id", p.id)
      : await supabase.from("posts").insert(row);
    if (resp.error) {
      setMsg(
        resp.error.code === "23505"
          ? "Slug sudah dipakai artikel lain. Ganti slug-nya."
          : `Gagal menyimpan: ${resp.error.message}`,
      );
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {msg && (
        <p className="border border-dashed border-ink/60 bg-ink-wash px-4 py-2 font-mono text-[0.8rem] text-ink-deep">
          {msg}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="label mb-1 block">Judul</span>
          <input
            className={field}
            value={p.title}
            onChange={(e) => {
              const v = e.target.value;
              set("title", v);
              if (!p.id && (!p.slug || p.slug === slugify(p.title))) set("slug", slugify(v));
            }}
          />
        </label>
        <label className="block">
          <span className="label mb-1 block">Slug (URL)</span>
          <input className={field} value={p.slug} onChange={(e) => set("slug", e.target.value)} />
        </label>
      </div>

      <label className="block">
        <span className="label mb-1 block">Subjudul</span>
        <input className={field} value={p.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block">
          <span className="label mb-1 block">Tanggal</span>
          <input type="date" className={field} value={p.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <label className="block">
          <span className="label mb-1 block">Kategori</span>
          <select className={field} value={p.category} onChange={(e) => set("category", e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c.v} value={c.v}>{c.l}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label mb-1 block">Label keyakinan</span>
          <select className={field} value={p.confidence} onChange={(e) => set("confidence", e.target.value as Confidence)}>
            {CONFIDENCES.map((c) => (
              <option key={c.v} value={c.v}>{c.l}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label mb-1 block">Tag (pisahkan dengan koma)</span>
        <input className={field} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="harimau-jawa, satwa-endemik" />
      </label>

      <label className="block">
        <span className="label mb-1 block">Ringkasan</span>
        <textarea className={area} rows={2} value={p.summary} onChange={(e) => set("summary", e.target.value)} />
      </label>

      {/* cover image */}
      <div>
        <span className="label mb-1 block">Gambar sampul</span>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer border border-dashed border-ink/60 px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink hover:bg-ink-wash">
            Pilih gambar
            <input type="file" accept="image/*" className="hidden" onChange={onCover} disabled={busy} />
          </label>
          {p.coverImage && (
            <div className="relative h-14 w-24 overflow-hidden border border-dashed border-ink/40">
              <Image src={p.coverImage} alt="" fill className="object-cover" sizes="96px" />
            </div>
          )}
          {p.coverImage && (
            <button type="button" onClick={() => set("coverImage", null)} className="font-mono text-[0.7rem] text-confidence-medium underline">
              hapus
            </button>
          )}
        </div>
      </div>

      {/* sources */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Sumber / Rujukan</span>
          <button
            type="button"
            onClick={() => set("sources", [...p.sources, { title: "", url: "", type: "jurnal" }])}
            className="border border-dashed border-ink/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-ink hover:bg-ink-wash"
          >
            + tambah
          </button>
        </div>
        <div className="space-y-2">
          {p.sources.map((s, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
              <input
                className={field}
                placeholder="Judul sumber"
                value={s.title}
                onChange={(e) => {
                  const next = [...p.sources];
                  next[i] = { ...s, title: e.target.value };
                  set("sources", next);
                }}
              />
              <input
                className={field}
                placeholder="URL (opsional)"
                value={s.url ?? ""}
                onChange={(e) => {
                  const next = [...p.sources];
                  next[i] = { ...s, url: e.target.value };
                  set("sources", next);
                }}
              />
              <select
                className={`${field} w-auto`}
                value={s.type}
                onChange={(e) => {
                  const next = [...p.sources];
                  next[i] = { ...s, type: e.target.value as SourceType };
                  set("sources", next);
                }}
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => set("sources", p.sources.filter((_, j) => j !== i))}
                className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="label">Isi artikel (Markdown)</span>
          <label className="cursor-pointer border border-dashed border-ink/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-ink hover:bg-ink-wash">
            + sisipkan gambar
            <input type="file" accept="image/*" className="hidden" onChange={onInlineImage} disabled={busy} />
          </label>
        </div>
        <textarea
          ref={bodyRef}
          className={`${area} min-h-[420px] leading-relaxed`}
          value={p.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder={"Tulis dengan Markdown.\n\n## Subjudul\n\nParagraf… **tebal**, *miring*, [tautan](https://…).\n\nKlik “sisipkan gambar” untuk menaruh foto di sini."}
        />
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-ink/40 pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={() => save("published")}
          className="border border-ink bg-ink px-6 py-2.5 font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-60"
        >
          {busy ? "Menyimpan…" : "Terbitkan"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => save("draft")}
          className="border border-dashed border-ink/70 px-6 py-2.5 font-mono text-[0.8rem] uppercase tracking-wider text-ink transition-colors hover:bg-ink-wash disabled:opacity-60"
        >
          Simpan draft
        </button>
        <a href="/admin" className="font-mono text-[0.72rem] uppercase tracking-wider text-gray hover:text-ink">
          Batal
        </a>
      </div>
    </div>
  );
}
