import { AdminShell } from "@/components/admin/AdminShell";
import { ReportAdminActions } from "@/components/admin/ReportAdminActions";
import { getAllReports, type CitizenReport } from "@/lib/reports";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<CitizenReport["status"], string> = {
  baru: "Baru",
  ditinjau: "Ditinjau",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

function ReportCard({ r }: { r: CitizenReport }) {
  return (
    <li className="border border-dashed border-ink/50 bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[0.64rem] uppercase tracking-wider text-ink/55">
          {STATUS_LABEL[r.status]} · {formatDate(r.createdAt)}
          {r.missionId && ` · misi: ${r.missionId}`}
        </span>
        <ReportAdminActions report={r} />
      </div>

      <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{r.subject}</h3>
      <p className="mt-1.5 whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
        {r.description}
      </p>

      <dl className="mt-3 space-y-1 font-mono text-[0.72rem] text-gray">
        {r.locationLabel && (
          <div>
            <span className="text-ink/55">Lokasi: </span>
            {r.locationLabel}
          </div>
        )}
        {r.lat != null && r.lng != null && (
          <div>
            <span className="text-ink/55">Koordinat: </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=13/${r.lat}/${r.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-teal"
            >
              {r.lat.toFixed(5)}, {r.lng.toFixed(5)} ↗
            </a>
          </div>
        )}
        {(r.reporterName || r.reporterContact) && (
          <div>
            <span className="text-ink/55">Pelapor: </span>
            {[r.reporterName, r.reporterContact].filter(Boolean).join(" · ")}
          </div>
        )}
      </dl>

      {r.photoUrl && (
        <a href={r.photoUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.photoUrl}
            alt={`Foto laporan: ${r.subject}`}
            className="max-h-48 w-auto border border-dashed border-ink/40"
          />
        </a>
      )}
    </li>
  );
}

export default async function AdminReportsPage() {
  const all = await getAllReports();
  const groups = [
    { key: "baru", title: "Baru, menunggu triase", rows: all.filter((r) => r.status === "baru") },
    { key: "ditinjau", title: "Sedang ditinjau", rows: all.filter((r) => r.status === "ditinjau") },
    {
      key: "terverifikasi",
      title: "Terverifikasi",
      rows: all.filter((r) => r.status === "terverifikasi"),
    },
    { key: "ditolak", title: "Ditolak", rows: all.filter((r) => r.status === "ditolak") },
  ];

  return (
    <AdminShell active="reports">
      <div className="p-6 sm:p-10">
        <header className="border-b border-dashed border-ink/40 pb-5">
          <h1 className="font-display text-3xl font-black text-ink">Laporan warga</h1>
          <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
            Observasi lapangan dari pembaca, lewat <code className="text-ink-deep">/misi</code>.
            Semua <span className="text-ink">belum terverifikasi</span> dan privat. Promosikan
            ke artikel/koreksi hanya setelah konfirmasi sumber independen.
          </p>
          {/* PHASE-3 SEAM (Bucket C, Internal Intelligence Lab): the Lab's Ghost
              Signals / Lazarus candidates will surface here as outbound "Misi
              Verifikasi Lapangan" that citizens can be dispatched to investigate,
              closing the loop back into this inbox. */}
        </header>

        {all.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada laporan. Form publik ada di <code className="text-ink-deep">/misi</code>{" "}
              (bagian &ldquo;Lapor temuan lapangan&rdquo;).
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {groups.map((g) =>
              g.rows.length === 0 ? null : (
                <section key={g.key}>
                  <h2 className="label text-ink/70">
                    {g.title} ({g.rows.length})
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {g.rows.map((r) => (
                      <ReportCard key={r.id} r={r} />
                    ))}
                  </ul>
                </section>
              ),
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
