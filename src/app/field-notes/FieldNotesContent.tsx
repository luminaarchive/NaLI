"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Plus, BookOpen, MapPin, Calendar, Mountain } from "lucide-react";

interface FieldNote {
  id: string;
  title: string;
  location_name: string | null;
  mountain_context: string | null;
  elevation_m: number | null;
  raw_notes: string;
  weather_notes: string | null;
  habitat_type: string | null;
  observed_at: string | null;
  created_at: string;
  is_processed: boolean;
}

const MOUNTAINS = ["semeru", "merbabu", "lawu", "sindoro-sumbing", "rinjani"];
const HABITATS = [
  { value: "forest-primary", label: "Hutan Primer" },
  { value: "forest-secondary", label: "Hutan Sekunder" },
  { value: "grassland", label: "Padang Rumput" },
  { value: "scrubland", label: "Semak Belukar" },
  { value: "wetland", label: "Lahan Basah" },
  { value: "edge", label: "Ekoton/Tepi Hutan" },
];

export function FieldNotesContent() {
  const router = useRouter();
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [form, setForm] = useState({
    title: "",
    raw_notes: "",
    location_name: "",
    mountain: "",
    elevation_m: "",
    weather_notes: "",
    habitat_type: "",
    observed_at: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    fetch("/api/field-notes")
      .then(async (r) => {
        clearTimeout(timeout);
        if (!r.ok) {
          setIsGuest(true);
          const local = localStorage.getItem("nali-local-notes");
          setNotes(local ? JSON.parse(local) : []);
          return;
        }
        const d = await r.json();
        if (d.notes && d.notes.length > 0) {
          setNotes(d.notes);
        } else {
          const local = localStorage.getItem("nali-local-notes");
          if (local) {
            setNotes(JSON.parse(local));
          }
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setIsGuest(true);
        const local = localStorage.getItem("nali-local-notes");
        setNotes(local ? JSON.parse(local) : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveNote() {
    if (!form.raw_notes.trim() || saving) return;
    setSaving(true);

    const localSave = () => {
      const newNote: FieldNote = {
        id: `local-note-${Date.now()}`,
        title: form.title.trim() || form.raw_notes.slice(0, 40),
        raw_notes: form.raw_notes.trim(),
        location_name: form.location_name || null,
        mountain_context: form.mountain || null,
        elevation_m: form.elevation_m ? parseInt(form.elevation_m) : null,
        weather_notes: form.weather_notes || null,
        habitat_type: form.habitat_type || null,
        observed_at: form.observed_at || null,
        created_at: new Date().toISOString(),
        is_processed: false,
      };

      const local = localStorage.getItem("nali-local-notes");
      const current = local ? JSON.parse(local) : [];
      const updated = [newNote, ...current];
      localStorage.setItem("nali-local-notes", JSON.stringify(updated));
      setNotes(updated);
      setDialogOpen(false);
      setForm({
        title: "",
        raw_notes: "",
        location_name: "",
        mountain: "",
        elevation_m: "",
        weather_notes: "",
        habitat_type: "",
        observed_at: "",
      });
    };

    if (isGuest) {
      localSave();
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/field-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          raw_notes: form.raw_notes,
          location_name: form.location_name || null,
          mountain_context: form.mountain || null,
          elevation_m: form.elevation_m ? parseInt(form.elevation_m) : null,
          weather_notes: form.weather_notes || null,
          habitat_type: form.habitat_type || null,
          observed_at: form.observed_at || null,
        }),
      });

      if (res.status === 401) {
        setIsGuest(true);
        localSave();
        return;
      }

      const data = await res.json();
      if (data.note) {
        setNotes((prev) => [{ ...data.note, raw_notes: form.raw_notes, is_processed: false } as FieldNote, ...prev]);
        setDialogOpen(false);
        setForm({
          title: "",
          raw_notes: "",
          location_name: "",
          mountain: "",
          elevation_m: "",
          weather_notes: "",
          habitat_type: "",
          observed_at: "",
        });
      } else {
        localSave();
      }
    } catch {
      setIsGuest(true);
      localSave();
    } finally {
      setSaving(false);
    }
  }

  async function analyzeNote(note: FieldNote) {
    try {
      const prompt = `Analisis catatan lapangan berikut dan buat laporan biodiversitas terstruktur:\n\nJudul: ${note.title}\nLokasi: ${note.location_name ?? "tidak disebutkan"}\nGunung: ${note.mountain_context ?? "tidak disebutkan"}\nElevasi: ${note.elevation_m ? note.elevation_m + "m" : "tidak disebutkan"}\nHabitat: ${note.habitat_type ?? "tidak disebutkan"}\nCuaca: ${note.weather_notes ?? "tidak disebutkan"}\n\nCatatan Lapangan:\n${note.raw_notes}`;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      if (!res.ok) return;
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6));
            if (chunk.type === "session_created" && chunk.sessionId) {
              reader.cancel();
              router.push(`/s/${chunk.sessionId}`);
              return;
            }
          } catch {}
        }
      }
    } catch {}
  }

  return (
    <PublicAppShell isHomepage={true}>
      <div className="mx-auto max-w-4xl px-4 py-16 text-[#1e3525]">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-serif text-3xl font-semibold text-[#1e3525] sm:text-4xl">Catatan Lapangan</h1>
            <p className="text-[#4a6455]">Dokumentasikan observasi lapangan dan analisis dengan NaLI.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              {/* Desktop button */}
              <Button className="hidden cursor-pointer items-center gap-2 rounded-xl bg-[#1e3525] text-white hover:bg-[#162d1d] sm:flex">
                <Plus className="h-4 w-4" /> Catatan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="m-0 h-full w-full max-w-full overflow-y-auto rounded-none border-0 border-[#1e3525]/12 bg-white text-[#1e3525] shadow-2xl sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border">
              <DialogHeader>
                <DialogTitle className="font-serif text-[#1e3525]">Catatan Lapangan Baru</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs text-[#4a6455]">Judul (opsional)</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Judul catatan (opsional)"
                    className="rounded-xl border-[#1e3525]/12 bg-white text-[#1e3525] placeholder:text-[#4a6455]/40 focus-visible:ring-[#1e3525]/30"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-[#4a6455]">Catatan Lapangan *</Label>
                  <Textarea
                    value={form.raw_notes}
                    onChange={(e) => setForm((p) => ({ ...p, raw_notes: e.target.value }))}
                    placeholder="Tulis observasi lapangan kamu di sini..."
                    rows={5}
                    className="resize-none rounded-xl border-[#1e3525]/12 bg-white text-[#1e3525] placeholder:text-[#4a6455]/40 focus-visible:ring-[#1e3525]/30"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-[#4a6455]">Lokasi</Label>
                  <Input
                    value={form.location_name}
                    onChange={(e) => setForm((p) => ({ ...p, location_name: e.target.value }))}
                    placeholder="Lokasi (contoh: Lereng Semeru, 2.100 mdpl)"
                    className="rounded-xl border-[#1e3525]/12 bg-white text-[#1e3525] placeholder:text-[#4a6455]/40 focus-visible:ring-[#1e3525]/30"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-[#4a6455]">Tanggal Observasi</Label>
                  <Input
                    type="date"
                    value={form.observed_at}
                    onChange={(e) => setForm((p) => ({ ...p, observed_at: e.target.value }))}
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="rounded-xl border-[#1e3525]/12 bg-white text-[#1e3525] focus-visible:ring-[#1e3525]/30"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={saveNote}
                    disabled={!form.raw_notes.trim() || saving}
                    className="flex-1 cursor-pointer rounded-xl bg-[#1e3525] text-white hover:bg-[#162d1d] disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Catatan"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1 cursor-pointer rounded-xl text-[#4a6455] hover:text-[#1e3525]"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-[#1e3525]/12 bg-white shadow-sm" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-[#1e3525]/12 bg-white/50 p-8 py-20 text-center shadow-[0_4px_20px_rgba(30,53,37,0.02)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1e3525]/12 bg-[#1e3525]/5">
              <BookOpen className="h-7 w-7 text-[#1e3525]/40" />
            </div>
            <p className="mb-2 font-serif text-lg font-semibold text-[#1e3525]">Belum ada catatan lapangan</p>
            <p className="mx-auto mb-6 max-w-[320px] text-sm leading-relaxed text-[#4a6455]">
              Mulai dokumentasi lapangan kamu. Catatan tersimpan di perangkat ini (lokal) sampai kamu masuk akun.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => setDialogOpen(true)}
                className="h-11 min-h-[44px] cursor-pointer rounded-xl bg-[#1e3525] px-5 text-sm text-white hover:bg-[#162d1d]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Catatan Baru
              </Button>
              <Button
                onClick={() => router.push("/create-report")}
                variant="outline"
                className="h-11 min-h-[44px] cursor-pointer rounded-xl border-[#1e3525]/12 bg-white px-5 text-sm text-[#4a6455] shadow-sm hover:border-[#1e3525] hover:text-[#1e3525]"
              >
                Buat Laporan
              </Button>
            </div>
            {isGuest && (
              <p className="mt-6 text-xs text-[#4a6455]/60">
                <Link href="/login" className="font-medium text-[#1e3525] underline-offset-2 hover:underline">
                  Masuk akun
                </Link>{" "}
                untuk menyimpan catatan ke cloud
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {isGuest && (
              <div className="mb-2 rounded-xl border border-amber-600/10 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-800">
                🔒 Mode Tamu: Catatan disimpan secara lokal di browser perangkat ini. Login untuk sinkronisasi cloud.
              </div>
            )}
            {notes.map((note) => (
              <Card
                key={note.id}
                className="rounded-2xl border-[#1e3525]/12 bg-white shadow-[0_4px_20px_rgba(30,53,37,0.02)]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-serif text-base leading-snug text-[#1e3525]">{note.title}</CardTitle>
                    {note.is_processed && (
                      <Badge className="flex-shrink-0 border-emerald-600/25 bg-emerald-500/10 text-xs text-emerald-800">
                        Dianalisis
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {note.location_name && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <MapPin className="h-3 w-3" />
                        {note.location_name}
                      </span>
                    )}
                    {note.mountain_context && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <Mountain className="h-3 w-3" />
                        {note.mountain_context}
                      </span>
                    )}
                    {note.elevation_m && <span className="text-xs text-[#4a6455]">{note.elevation_m}m</span>}
                    {note.observed_at && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.observed_at).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm leading-relaxed text-[#4a6455]">{note.raw_notes}</p>
                  <Button
                    onClick={() => analyzeNote(note)}
                    variant="outline"
                    className="mt-3 h-auto cursor-pointer rounded-xl border-[#1e3525]/12 bg-white px-3 py-1.5 text-xs text-[#4a6455] shadow-sm hover:border-[#1e3525] hover:text-[#1e3525]"
                  >
                    Analisis dengan NaLI →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB - only visible on small screens */}
      <button
        onClick={() => setDialogOpen(true)}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3525] text-white shadow-[0_4px_20px_rgba(30,53,37,0.25)] transition hover:bg-[#162d1d] sm:hidden"
        aria-label="Catatan Baru"
      >
        <Plus className="h-6 w-6" />
      </button>
    </PublicAppShell>
  );
}
