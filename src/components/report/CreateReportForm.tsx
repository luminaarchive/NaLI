"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, LinkIcon, Loader2, MapPin, UploadCloud } from "lucide-react";
import { reportTemplates, userRoles, type EvidenceReport } from "@/lib/reports/reportGenerator";

type FormState = {
  template: string;
  title: string;
  role: string;
  notes: string;
  sourceUrls: string;
  location: string;
  uploadedFileNote: string;
  integrityAccepted: boolean;
};

const initialForm: FormState = {
  integrityAccepted: false,
  location: "",
  notes: "",
  role: "mahasiswa",
  sourceUrls: "",
  template: "Laporan Observasi Lingkungan",
  title: "",
  uploadedFileNote: "",
};

function hasMaterial(form: FormState) {
  return [form.notes, form.sourceUrls, form.location, form.uploadedFileNote].some((value) => value.trim().length > 0);
}

export function CreateReportForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materialCount = useMemo(
    () => [form.notes, form.sourceUrls, form.location, form.uploadedFileNote].filter((value) => value.trim()).length,
    [form.location, form.notes, form.sourceUrls, form.uploadedFileNote],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!form.title.trim()) {
      setError("Isi judul laporan terlebih dahulu.");
      return;
    }

    if (!hasMaterial(form)) {
      setError("Masukkan minimal satu bahan: catatan, URL sumber, lokasi, atau keterangan file.");
      return;
    }

    if (!form.integrityAccepted) {
      setError("Centang pernyataan integritas akademik sebelum membuat draft.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports/generate", {
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        id?: string;
        notice?: string;
        report?: EvidenceReport;
      };

      if (!response.ok || !payload.report || !payload.id) {
        setError(payload.error ?? "Draft belum bisa dibuat. Periksa bahan dan coba lagi.");
        return;
      }

      window.localStorage.setItem(`nali-report:${payload.id}`, JSON.stringify(payload.report));
      if (payload.notice) {
        window.localStorage.setItem(`nali-report-notice:${payload.id}`, payload.notice);
      }
      router.push(`/report/${payload.id}`);
    } catch {
      setError("Koneksi ke server gagal. Coba lagi setelah jaringan stabil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-forest-950 text-sm font-semibold">Template laporan</span>
            <select
              className="field-input mt-2"
              value={form.template}
              onChange={(event) => updateField("template", event.target.value)}
            >
              {reportTemplates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-forest-950 text-sm font-semibold">Peran pengguna</span>
            <select
              className="field-input mt-2"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            >
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-forest-950 text-sm font-semibold">Judul laporan</span>
          <input
            className="field-input mt-2"
            placeholder="Contoh: Observasi kualitas air sungai di sekitar sekolah"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </label>
      </section>

      <section className="border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-forest-950 text-sm font-semibold">Bahan minimal</p>
            <p className="text-forest-700 mt-1 text-sm leading-6">
              Masukkan setidaknya satu bahan nyata. NaLI menyusun dari bahan yang kamu berikan.
            </p>
          </div>
          <span className="border-olive-300 bg-olive-100 text-forest-900 rounded-sm border px-3 py-1 text-xs font-semibold">
            {materialCount} bahan
          </span>
        </div>

        <label className="mt-5 block">
          <span className="text-forest-950 flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-olive-700" aria-hidden="true" />
            Catatan utama
          </span>
          <textarea
            className="field-input mt-2 min-h-40 resize-y"
            placeholder="Tulis catatan observasi, bahan praktikum, ringkasan kegiatan, atau poin dari field note."
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </label>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-forest-950 flex items-center gap-2 text-sm font-semibold">
              <LinkIcon className="h-4 w-4 text-olive-700" aria-hidden="true" />
              URL sumber opsional
            </span>
            <textarea
              className="field-input mt-2 min-h-28 resize-y"
              placeholder="Satu URL per baris. Sumber akan ditandai belum terverifikasi di MVP ini."
              value={form.sourceUrls}
              onChange={(event) => updateField("sourceUrls", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-forest-950 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-olive-700" aria-hidden="true" />
              Lokasi opsional
            </span>
            <input
              className="field-input mt-2"
              placeholder="Contoh: Bogor, bantaran Sungai Ciliwung"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
            <p className="text-forest-700 mt-2 text-xs leading-5">
              Lokasi dicatat sebagai bahan pengguna dan belum diverifikasi otomatis.
            </p>
          </label>
        </div>

        <div className="border-stone-200 bg-stone-50 mt-4 border p-4">
          <div className="flex items-start gap-3">
            <UploadCloud className="mt-0.5 h-5 w-5 text-olive-700" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-forest-950 text-sm font-semibold">Upload file</p>
              <p className="text-forest-700 mt-1 text-sm leading-6">
                Upload belum aktif di MVP ini. Untuk sekarang, tulis nama file atau ringkasan bahan yang akan
                dilampirkan.
              </p>
              <input
                className="field-input mt-3"
                placeholder="Contoh: Foto daun mangrove dan catatan pH dari praktikum"
                value={form.uploadedFileNote}
                onChange={(event) => updateField("uploadedFileNote", event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="flex gap-3">
          <input
            checked={form.integrityAccepted}
            className="mt-1 h-4 w-4 accent-[#315f45]"
            type="checkbox"
            onChange={(event) => updateField("integrityAccepted", event.target.checked)}
          />
          <span className="text-forest-800 text-sm leading-6">
            Saya memahami bahwa output NaLI adalah draft bantuan berbasis bahan, bukan karya final. Saya bertanggung
            jawab untuk memeriksa, mengedit, dan memverifikasi hasil akhir.
          </span>
        </label>

        {error ? (
          <div className="border-rare-red/40 bg-rare-red/8 text-rare-red mt-5 flex gap-3 border p-3 text-sm leading-6">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        {notice ? (
          <div className="border-data-cyan/40 bg-data-cyan/10 text-forest-900 mt-5 flex gap-3 border p-3 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{notice}</p>
          </div>
        ) : null}

        <button
          className="bg-forest-900 hover:bg-forest-800 mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold text-stone-50 transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
          Buat Draf Berbasis Bahan
        </button>
      </section>
    </form>
  );
}
