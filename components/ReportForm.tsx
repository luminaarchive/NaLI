"use client";

import { useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  ReportForm (Step 2.3): public field-observation intake on /misi.           */
/*                                                                            */
/*  Posts multipart form-data to /api/report. GPS + photo are progressive      */
/*  enhancements (the form works without either). A report is an UNVERIFIED    */
/*  observation; copy makes that explicit.                                     */
/* -------------------------------------------------------------------------- */

interface MissionOption {
  id: string;
  judul: string;
}

const field =
  "w-full border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.8rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none";

export function ReportForm({ missions = [] }: { missions?: MissionOption[] }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "loading" | "error">("idle");
  const [missionId, setMissionId] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const ready = subject.trim().length > 0 && description.trim().length > 0 && status !== "sending";

  function captureGps() {
    if (!("geolocation" in navigator)) {
      setGeoState("error");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState("idle");
      },
      () => setGeoState("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPhotoName(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg("Foto maksimal 5 MB.");
      e.target.value = "";
      setPhotoName(null);
      return;
    }
    setErrorMsg("");
    setPhotoName(f.name);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData();
    fd.set("subject", subject.trim());
    fd.set("description", description.trim());
    fd.set("location_label", locationLabel.trim());
    fd.set("reporter_name", reporterName.trim());
    fd.set("reporter_contact", reporterContact.trim());
    fd.set("mission_id", missionId);
    fd.set("website", honeypotRef.current?.value ?? ""); // honeypot
    if (coords) {
      fd.set("lat", String(coords.lat));
      fd.set("lng", String(coords.lng));
    }
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("photo", file);

    try {
      const res = await fetch("/api/report", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim laporan.");
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim laporan.");
    }
  }

  if (status === "ok") {
    return (
      <div className="border border-dashed border-ink/60 bg-ink-wash/40 p-5">
        <p className="font-mono text-[0.82rem] leading-relaxed text-ink-charcoal">
          Terima kasih. Laporanmu masuk ke antrean tinjauan NaLI. Ini catatan{" "}
          <strong>belum terverifikasi</strong>; tim akan memeriksanya sebelum, jika layak,
          menjadikannya bagian dari riset.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* honeypot: visually hidden, off the tab order */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <label className="block">
        <span className="label text-gray">Apa yang kamu lihat?</span>
        <input
          type="text"
          required
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Mis. burung biru kecil, sungai berubah warna, situs batu"
          className={`mt-1 ${field}`}
        />
      </label>

      <label className="block">
        <span className="label text-gray">Ceritakan detailnya</span>
        <textarea
          required
          rows={4}
          maxLength={5000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kapan, di mana, apa yang terjadi, dan kenapa menurutmu ini penting."
          className={`mt-1 ${field}`}
        />
      </label>

      {missions.length > 0 && (
        <label className="block">
          <span className="label text-gray">Terkait misi (opsional)</span>
          <select
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            className={`mt-1 ${field}`}
          >
            <option value="">Tidak terkait misi tertentu</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.judul}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="label text-gray">Lokasi (nama tempat)</span>
        <input
          type="text"
          maxLength={200}
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
          placeholder="Mis. Gunung Sahendaruman, Sangihe"
          className={`mt-1 ${field}`}
        />
      </label>

      {/* GPS: explicit consent, never automatic */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={captureGps}
          className="border border-dashed border-ink/60 px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink transition-colors hover:bg-ink-wash"
        >
          {geoState === "loading" ? "Mengambil…" : "◎ Tandai koordinat GPS"}
        </button>
        {coords && (
          <span className="font-mono text-[0.72rem] text-ink-deep">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}{" "}
            <button
              type="button"
              onClick={() => setCoords(null)}
              className="ml-1 text-gray underline hover:text-ink"
            >
              hapus
            </button>
          </span>
        )}
        {geoState === "error" && (
          <span className="font-mono text-[0.7rem] text-gray">
            GPS tidak tersedia. Isi nama lokasi saja.
          </span>
        )}
      </div>

      <label className="block">
        <span className="label text-gray">Foto (opsional, maks 5 MB)</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPhotoChange}
          className={`mt-1 ${field} file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:font-mono file:text-[0.7rem] file:uppercase file:text-paper`}
        />
        {photoName && (
          <span className="mt-1 block font-mono text-[0.7rem] text-gray">{photoName}</span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label text-gray">Namamu (opsional)</span>
          <input
            type="text"
            maxLength={120}
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="label text-gray">Kontak (opsional)</span>
          <input
            type="text"
            maxLength={200}
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
            placeholder="Email, agar kami bisa menindaklanjuti"
            className={`mt-1 ${field}`}
          />
        </label>
      </div>

      {errorMsg && (
        <p className="font-mono text-[0.72rem] text-red-500 dark:text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!ready}
        className="border border-ink bg-ink px-5 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "sending" ? "Mengirim…" : "Kirim laporan"}
      </button>
      <p className="font-mono text-[0.68rem] leading-relaxed text-gray-light">
        Laporan masuk privat ke tim NaLI dan ditinjau manual. Catatanmu{" "}
        <strong>belum terverifikasi</strong> sampai diperiksa. Untuk spesies langka,
        koordinat persis tidak akan dipublikasikan demi keamanan satwa.
      </p>
    </form>
  );
}
