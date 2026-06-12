"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SERIES } from "@/lib/series";
import {
  CLAIM_STATUS_LABEL,
  CONFIDENCE_LABEL,
  type ArticleImage,
  type ArticleSource,
  type Category,
  type ClaimLedgerItem,
  type ClaimStatus,
  type Confidence,
  type EvidenceBasis,
  type ExternalVisualEvidence,
  type SourceType,
  type Status,
} from "@/lib/types";

export interface EditablePost {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  updated?: string | null;
  category: Category;
  tags: string[];
  summary: string;
  confidence: Confidence;
  status: Status;
  evidenceBasis?: EvidenceBasis | null;
  firstPartyFieldwork: boolean;
  series: string[];
  sources: ArticleSource[];
  claimLedger: ClaimLedgerItem[];
  limitations: string[];
  images: ArticleImage[];
  externalVisuals: ExternalVisualEvidence[];
  coverImage?: string | null;
  body: string;
}

const CATEGORIES: { v: Category; l: string }[] = [
  { v: "alam", l: "Alam" },
  { v: "sejarah", l: "Sejarah" },
  { v: "investigasi", l: "Investigasi" },
];
const CONFIDENCES = (Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((v) => ({
  v,
  l: CONFIDENCE_LABEL[v],
}));
const EVIDENCE_BASES: EvidenceBasis[] = [
  "sumber terbuka",
  "arsip historis",
  "jurnal ilmiah",
  "dokumen pemerintah",
  "observasi pihak ketiga",
  "campuran",
];
const CLAIM_STATUSES = Object.keys(CLAIM_STATUS_LABEL) as ClaimStatus[];
const SOURCE_TYPES: SourceType[] = ["jurnal", "arsip", "buku", "media", "laporan", "lainnya"];
const EV_LIMITATION_DEFAULT = "Lisensi belum jelas; NaLI tidak menampilkan ulang gambar ini.";

const DEMO_TERMS = /\bseed\b|contoh \(seed\)|\bdummy\b|\bplaceholder\b|bersifat ilustratif|\bilustratif\b/i;
const FIRST_PERSON_FIELD =
  /observasi kami|kami melihat|kami menemukan|kami mengamati|kami amati di lapangan|dari lokasi sebenarnya|kami kunjungi langsung|kami memotret di lapangan|kami mengukur di lapangan/i;

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
const miniBtn =
  "border border-dashed border-ink/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-ink hover:bg-ink-wash";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-ink/40 p-4">
      <span className="label mb-3 block text-ink-deep">{title}</span>
      {children}
    </div>
  );
}

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
      updated: null,
      category: "alam",
      tags: [],
      summary: "",
      confidence: "needs-verification",
      status: "draft",
      evidenceBasis: "sumber terbuka",
      firstPartyFieldwork: false,
      series: [],
      sources: [],
      claimLedger: [],
      limitations: [],
      images: [],
      externalVisuals: [],
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

  /** Editor-side trust validation. Drafts pass; publishing enforces the rules. */
  function publishErrors(): string[] {
    const e: string[] = [];
    if (DEMO_TERMS.test(p.body) || DEMO_TERMS.test(p.summary))
      e.push("Hapus kata demo/placeholder (seed/contoh (seed)/dummy/placeholder/ilustratif).");
    if (!p.firstPartyFieldwork && FIRST_PERSON_FIELD.test(p.body))
      e.push("Ada klaim observasi lapangan orang pertama, tapi 'observasi lapangan pertama' tidak dicentang.");
    if (!p.evidenceBasis) e.push("Pilih Basis bukti (evidence basis).");
    if (p.claimLedger.filter((c) => c.claim.trim()).length === 0)
      e.push("Claim Ledger wajib diisi minimal satu klaim.");
    if (p.limitations.filter((l) => l.trim()).length === 0)
      e.push("Batasan (limitations) wajib diisi minimal satu.");
    if (p.sources.filter((s) => s.title.trim()).length === 0)
      e.push("Minimal satu sumber/rujukan.");
    p.images.forEach((img, i) => {
      for (const k of ["sourceUrl", "license", "attribution", "alt", "caption", "checkedAt"] as const) {
        if (!String(img[k] ?? "").trim())
          e.push(`Foto berlisensi #${i + 1}: field "${k}" wajib diisi.`);
      }
    });
    p.externalVisuals.forEach((ev, i) => {
      if (!ev.title.trim()) e.push(`Bukti visual eksternal #${i + 1}: judul wajib.`);
      if (!ev.sourceUrl.trim()) e.push(`Bukti visual eksternal #${i + 1}: URL sumber wajib.`);
      if (!ev.shows.trim()) e.push(`Bukti visual eksternal #${i + 1}: deskripsi 'menampilkan' wajib.`);
      if (!ev.limitation.trim()) e.push(`Bukti visual eksternal #${i + 1}: catatan keterbatasan wajib.`);
      if (!ev.checkedAt.trim()) e.push(`Bukti visual eksternal #${i + 1}: tanggal dicek wajib.`);
    });
    return e;
  }

  async function save(status: Status) {
    const title = p.title.trim();
    const slug = (p.slug || slugify(title)).trim();
    if (!title) return setMsg("Judul wajib diisi.");
    if (!slug) return setMsg("Slug wajib diisi.");

    if (status === "published") {
      const errs = publishErrors();
      if (errs.length) {
        setMsg(`Tidak bisa terbit — perbaiki dulu:\n• ${errs.join("\n• ")}`);
        return;
      }
    }

    setBusy(true);
    setMsg(null);
    const row = {
      slug,
      title,
      subtitle: p.subtitle,
      date: p.date,
      updated: p.updated || null,
      category: p.category,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      summary: p.summary,
      confidence: p.confidence,
      status,
      evidence_basis: p.evidenceBasis || null,
      first_party_fieldwork: p.firstPartyFieldwork,
      series: p.series,
      sources: p.sources.filter((s) => s.title.trim()),
      claim_ledger: p.claimLedger.filter((c) => c.claim.trim()),
      limitations: p.limitations.filter((l) => l.trim()),
      images: p.images.filter((i) => (i.src || i.sourceUrl)),
      external_visuals: p.externalVisuals.filter((e) => e.title.trim()),
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
        <pre className="whitespace-pre-wrap border border-dashed border-ink/60 bg-ink-wash px-4 py-2 font-mono text-[0.8rem] text-ink-deep">
          {msg}
        </pre>
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

      {/* evidence basis + fieldwork flag */}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="label mb-1 block">Basis bukti (evidence basis)</span>
          <select
            className={field}
            value={p.evidenceBasis ?? ""}
            onChange={(e) => set("evidenceBasis", (e.target.value || null) as EvidenceBasis | null)}
          >
            <option value="">— pilih —</option>
            {EVIDENCE_BASES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <label className="flex items-start gap-3 pt-6">
          <input
            type="checkbox"
            checked={p.firstPartyFieldwork}
            onChange={(e) => set("firstPartyFieldwork", e.target.checked)}
            className="mt-1"
          />
          <span className="font-mono text-[0.78rem] leading-snug text-gray">
            Observasi lapangan pertama NaLI ada &amp; ditampilkan.{" "}
            <span className="text-confidence-medium">Biarkan kosong</span> kecuali bukti
            lapangan asli benar-benar dimiliki.
          </span>
        </label>
      </div>

      <label className="block">
        <span className="label mb-1 block">Tag (pisahkan dengan koma)</span>
        <input className={field} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="harimau-jawa, satwa-endemik" />
      </label>

      {/* series */}
      <Section title="Seri">
        <div className="flex flex-wrap gap-3">
          {SERIES.map((s) => (
            <label key={s.slug} className="flex items-center gap-2 font-mono text-[0.74rem] text-ink-charcoal">
              <input
                type="checkbox"
                checked={p.series.includes(s.slug)}
                onChange={(e) =>
                  set(
                    "series",
                    e.target.checked
                      ? [...p.series, s.slug]
                      : p.series.filter((x) => x !== s.slug),
                  )
                }
              />
              {s.title}
            </label>
          ))}
        </div>
      </Section>

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
      <Section title="Sumber / Rujukan">
        <button
          type="button"
          onClick={() => set("sources", [...p.sources, { title: "", url: "", type: "jurnal" }])}
          className={miniBtn}
        >
          + tambah sumber
        </button>
        <div className="mt-2 space-y-2">
          {p.sources.map((s, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
              <input className={field} placeholder="Judul sumber" value={s.title}
                onChange={(e) => { const n = [...p.sources]; n[i] = { ...s, title: e.target.value }; set("sources", n); }} />
              <input className={field} placeholder="URL (opsional)" value={s.url ?? ""}
                onChange={(e) => { const n = [...p.sources]; n[i] = { ...s, url: e.target.value }; set("sources", n); }} />
              <select className={`${field} w-auto`} value={s.type}
                onChange={(e) => { const n = [...p.sources]; n[i] = { ...s, type: e.target.value as SourceType }; set("sources", n); }}>
                {SOURCE_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
              <button type="button" onClick={() => set("sources", p.sources.filter((_, j) => j !== i))}
                className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash">✕</button>
            </div>
          ))}
        </div>
      </Section>

      {/* claim ledger */}
      <Section title="Claim Ledger (wajib untuk terbit)">
        <button type="button"
          onClick={() => set("claimLedger", [...p.claimLedger, { claim: "", status: "didukung sumber", sources: "", limitation: "" }])}
          className={miniBtn}>+ tambah klaim</button>
        <div className="mt-2 space-y-3">
          {p.claimLedger.map((c, i) => (
            <div key={i} className="grid gap-2 border-l-2 border-dashed border-ink/40 pl-3 md:grid-cols-[2fr_1fr]">
              <input className={field} placeholder="Klaim" value={c.claim}
                onChange={(e) => { const n = [...p.claimLedger]; n[i] = { ...c, claim: e.target.value }; set("claimLedger", n); }} />
              <select className={field} value={c.status}
                onChange={(e) => { const n = [...p.claimLedger]; n[i] = { ...c, status: e.target.value as ClaimStatus }; set("claimLedger", n); }}>
                {CLAIM_STATUSES.map((s) => (<option key={s} value={s}>{CLAIM_STATUS_LABEL[s]}</option>))}
              </select>
              <input className={field} placeholder="Sumber, mis. [1][2]" value={c.sources ?? ""}
                onChange={(e) => { const n = [...p.claimLedger]; n[i] = { ...c, sources: e.target.value }; set("claimLedger", n); }} />
              <div className="flex gap-2">
                <input className={field} placeholder="Catatan/keterbatasan" value={c.limitation ?? ""}
                  onChange={(e) => { const n = [...p.claimLedger]; n[i] = { ...c, limitation: e.target.value }; set("claimLedger", n); }} />
                <button type="button" onClick={() => set("claimLedger", p.claimLedger.filter((_, j) => j !== i))}
                  className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash">✕</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* limitations */}
      <Section title="Batasan & hal yang belum pasti (wajib untuk terbit)">
        <button type="button" onClick={() => set("limitations", [...p.limitations, ""])} className={miniBtn}>+ tambah batasan</button>
        <div className="mt-2 space-y-2">
          {p.limitations.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input className={field} placeholder="Satu batasan…" value={l}
                onChange={(e) => { const n = [...p.limitations]; n[i] = e.target.value; set("limitations", n); }} />
              <button type="button" onClick={() => set("limitations", p.limitations.filter((_, j) => j !== i))}
                className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash">✕</button>
            </div>
          ))}
        </div>
      </Section>

      {/* displayable licensed images */}
      <Section title="Foto berlisensi yang ditampilkan (wajib lisensi jelas)">
        <p className="mb-2 font-mono text-[0.72rem] leading-relaxed text-gray">
          Hanya foto domain publik / CC0 / CC BY / CC BY-SA / lisensi lembaga terbuka.
          Tanpa AI. Tiap field wajib diisi.
        </p>
        <button type="button"
          onClick={() => set("images", [...p.images, { src: "", title: "", creator: "", sourceUrl: "", license: "", licenseUrl: "", attribution: "", alt: "", caption: "", checkedAt: new Date().toISOString().slice(0, 10) }])}
          className={miniBtn}>+ tambah foto</button>
        <div className="mt-2 space-y-4">
          {p.images.map((img, i) => {
            const upd = (patch: Partial<ArticleImage>) => { const n = [...p.images]; n[i] = { ...img, ...patch }; set("images", n); };
            return (
              <div key={i} className="grid gap-2 border-l-2 border-dashed border-ink/40 pl-3 md:grid-cols-2">
                <div className="md:col-span-2 flex items-center gap-3">
                  <label className="cursor-pointer border border-dashed border-ink/60 px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-wider text-ink hover:bg-ink-wash">
                    Unggah file
                    <input type="file" accept="image/*" className="hidden" disabled={busy}
                      onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); const url = await uploadImage(f); if (url) upd({ src: url }); setBusy(false); e.target.value = ""; }} />
                  </label>
                  {img.src && <span className="truncate font-mono text-[0.66rem] text-gray">{img.src}</span>}
                </div>
                <input className={field} placeholder="src (path/URL) atau kosong jika kredit saja" value={img.src ?? ""} onChange={(e) => upd({ src: e.target.value })} />
                <input className={field} placeholder="Judul foto" value={img.title ?? ""} onChange={(e) => upd({ title: e.target.value })} />
                <input className={field} placeholder="Pembuat/fotografer/lembaga" value={img.creator ?? ""} onChange={(e) => upd({ creator: e.target.value })} />
                <input className={field} placeholder="URL sumber (halaman)" value={img.sourceUrl} onChange={(e) => upd({ sourceUrl: e.target.value })} />
                <input className={field} placeholder="Lisensi (mis. Public domain / CC BY-SA)" value={img.license} onChange={(e) => upd({ license: e.target.value })} />
                <input className={field} placeholder="URL lisensi (opsional)" value={img.licenseUrl ?? ""} onChange={(e) => upd({ licenseUrl: e.target.value })} />
                <input className={field} placeholder="Atribusi (teks kredit)" value={img.attribution} onChange={(e) => upd({ attribution: e.target.value })} />
                <input className={field} placeholder="Alt text (aksesibilitas)" value={img.alt} onChange={(e) => upd({ alt: e.target.value })} />
                <input className={field} placeholder="Caption" value={img.caption} onChange={(e) => upd({ caption: e.target.value })} />
                <div className="flex gap-2">
                  <input type="date" className={field} value={img.checkedAt ?? ""} onChange={(e) => upd({ checkedAt: e.target.value })} />
                  <button type="button" onClick={() => set("images", p.images.filter((_, j) => j !== i))}
                    className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* external visual evidence */}
      <Section title="Bukti visual eksternal (ditautkan, TIDAK ditampilkan)">
        <p className="mb-2 font-mono text-[0.72rem] leading-relaxed text-gray">
          Foto/video nyata dengan lisensi belum jelas. Hanya tautan + deskripsi. Jangan
          unduh, host, atau tampilkan ulang.
        </p>
        <button type="button"
          onClick={() => set("externalVisuals", [...p.externalVisuals, { title: "", creator: "", sourceUrl: "", platform: "", shows: "", supportsClaim: "", limitation: EV_LIMITATION_DEFAULT, checkedAt: new Date().toISOString().slice(0, 10) }])}
          className={miniBtn}>+ tambah bukti visual</button>
        <div className="mt-2 space-y-4">
          {p.externalVisuals.map((ev, i) => {
            const upd = (patch: Partial<ExternalVisualEvidence>) => { const n = [...p.externalVisuals]; n[i] = { ...ev, ...patch }; set("externalVisuals", n); };
            return (
              <div key={i} className="grid gap-2 border-l-2 border-dashed border-ink/40 pl-3 md:grid-cols-2">
                <input className={field} placeholder="Judul/deskripsi" value={ev.title} onChange={(e) => upd({ title: e.target.value })} />
                <input className={field} placeholder="URL halaman sumber" value={ev.sourceUrl} onChange={(e) => upd({ sourceUrl: e.target.value })} />
                <input className={field} placeholder="Platform (mis. Mongabay)" value={ev.platform ?? ""} onChange={(e) => upd({ platform: e.target.value })} />
                <input className={field} placeholder="Pembuat/lembaga (jika tahu)" value={ev.creator ?? ""} onChange={(e) => upd({ creator: e.target.value })} />
                <input className={`${field} md:col-span-2`} placeholder="Apa yang ditampilkan" value={ev.shows} onChange={(e) => upd({ shows: e.target.value })} />
                <input className={`${field} md:col-span-2`} placeholder="Mendukung klaim mana" value={ev.supportsClaim ?? ""} onChange={(e) => upd({ supportsClaim: e.target.value })} />
                <input className={field} placeholder="Keterbatasan" value={ev.limitation} onChange={(e) => upd({ limitation: e.target.value })} />
                <div className="flex gap-2">
                  <input type="date" className={field} value={ev.checkedAt} onChange={(e) => upd({ checkedAt: e.target.value })} />
                  <button type="button" onClick={() => set("externalVisuals", p.externalVisuals.filter((_, j) => j !== i))}
                    className="border border-dashed border-ink/60 px-3 font-mono text-[0.7rem] text-confidence-medium hover:bg-ink-wash">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

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
          placeholder={"Tulis dengan Markdown.\n\n## Subjudul\n\nParagraf…"}
        />
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-ink/40 pt-5">
        <button type="button" disabled={busy} onClick={() => save("published")}
          className="border border-ink bg-ink px-6 py-2.5 font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-60">
          {busy ? "Menyimpan…" : "Terbitkan"}
        </button>
        <button type="button" disabled={busy} onClick={() => save("draft")}
          className="border border-dashed border-ink/70 px-6 py-2.5 font-mono text-[0.8rem] uppercase tracking-wider text-ink transition-colors hover:bg-ink-wash disabled:opacity-60">
          Simpan draft
        </button>
        <a href="/admin" className="font-mono text-[0.72rem] uppercase tracking-wider text-gray hover:text-ink">Batal</a>
      </div>
    </div>
  );
}
