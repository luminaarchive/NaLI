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
import { Plus, FileText, MapPin, Calendar, Mountain } from "lucide-react";

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

const MOUNTAINS = ["semeru","merbabu","lawu","sindoro-sumbing","rinjani"];
const HABITATS = [
  { value: "forest-primary", label: "Hutan Primer" },
  { value: "forest-secondary", label: "Hutan Sekunder" },
  { value: "grassland", label: "Padang Rumput" },
  { value: "scrubland", label: "Semak Belukar" },
  { value: "wetland", label: "Lahan Basah" },
  { value: "edge", label: "Ekoton/Tepi Hutan" },
];

export default function FieldNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [form, setForm] = useState({
    title: "", raw_notes: "", location_name: "", mountain: "",
    elevation_m: "", weather_notes: "", habitat_type: "", observed_at: "",
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
      setForm({ title: "", raw_notes: "", location_name: "", mountain: "", elevation_m: "", weather_notes: "", habitat_type: "", observed_at: "" });
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
        setNotes(prev => [{ ...data.note, raw_notes: form.raw_notes, is_processed: false } as FieldNote, ...prev]);
        setDialogOpen(false);
        setForm({ title: "", raw_notes: "", location_name: "", mountain: "", elevation_m: "", weather_notes: "", habitat_type: "", observed_at: "" });
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-[#1e3525]">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1e3525] mb-2">Catatan Lapangan</h1>
            <p className="text-[#4a6455]">Dokumentasikan observasi lapangan dan analisis dengan NaLI.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#1e3525] text-white hover:bg-[#162d1d] flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" /> Catatan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-[#1e3525]/12 rounded-2xl text-[#1e3525] w-full max-w-[calc(100vw-32px)] sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-[#1e3525]">Catatan Lapangan Baru</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-2">
                <div>
                  <Label className="text-[#4a6455] text-xs mb-1.5 block">Judul (opsional)</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({...p,title:e.target.value}))} placeholder="Judul catatan (opsional)" className="bg-white border-[#1e3525]/12 text-[#1e3525] placeholder:text-[#4a6455]/40 rounded-xl focus-visible:ring-[#1e3525]/30" />
                </div>
                <div>
                  <Label className="text-[#4a6455] text-xs mb-1.5 block">Catatan Lapangan *</Label>
                  <Textarea value={form.raw_notes} onChange={e => setForm(p => ({...p,raw_notes:e.target.value}))} placeholder="Tulis observasi lapangan kamu di sini..." rows={5} className="bg-white border-[#1e3525]/12 text-[#1e3525] placeholder:text-[#4a6455]/40 rounded-xl resize-none focus-visible:ring-[#1e3525]/30" />
                </div>
                <div>
                  <Label className="text-[#4a6455] text-xs mb-1.5 block">Lokasi</Label>
                  <Input value={form.location_name} onChange={e => setForm(p => ({...p,location_name:e.target.value}))} placeholder="Lokasi (contoh: Lereng Semeru, 2.100 mdpl)" className="bg-white border-[#1e3525]/12 text-[#1e3525] placeholder:text-[#4a6455]/40 rounded-xl focus-visible:ring-[#1e3525]/30" />
                </div>
                <div>
                  <Label className="text-[#4a6455] text-xs mb-1.5 block">Tanggal Observasi</Label>
                  <Input type="date" value={form.observed_at} onChange={e => setForm(p => ({...p,observed_at:e.target.value}))} defaultValue={new Date().toISOString().slice(0, 10)} className="bg-white border-[#1e3525]/12 text-[#1e3525] rounded-xl focus-visible:ring-[#1e3525]/30" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button onClick={saveNote} disabled={!form.raw_notes.trim() || saving} className="flex-1 rounded-xl bg-[#1e3525] text-white hover:bg-[#162d1d] disabled:opacity-50 cursor-pointer">
                    {saving ? "Menyimpan..." : "Simpan Catatan"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl text-[#4a6455] hover:text-[#1e3525] cursor-pointer">
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
            {[1,2,3].map(i => <div key={i} className="bg-white border border-[#1e3525]/12 rounded-2xl h-28 animate-pulse shadow-sm" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-[#1e3525]/12 rounded-2xl p-8 shadow-[0_4px_20px_rgba(30,53,37,0.02)]">
            <FileText className="h-12 w-12 text-[#1e3525]/15 mx-auto mb-4" />
            <p className="text-[#1e3525] font-serif text-lg mb-2">Belum ada catatan lapangan.</p>
            <p className="text-[#4a6455] text-sm mb-6">Buat catatan pertama atau mulai dari laporan.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setDialogOpen(true)} className="rounded-xl bg-[#1e3525] text-white hover:bg-[#162d1d] cursor-pointer text-xs h-10 px-4">
                Buat Catatan Lokal
              </Button>
              <Button onClick={() => router.push("/create-report")} variant="outline" className="rounded-xl border-[#1e3525]/12 text-[#4a6455] hover:text-[#1e3525] hover:border-[#1e3525] cursor-pointer text-xs h-10 px-4 bg-white shadow-sm">
                Mulai dari Laporan
              </Button>
            </div>
            {isGuest && (
              <p className="mt-4 text-[10px] text-[#4a6455]/70">
                Catatan disimpan secara lokal di browser perangkat ini (tidak ada sinkronisasi cloud).
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {isGuest && (
              <div className="rounded-xl border border-amber-600/10 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-800 mb-2">
                🔒 Mode Tamu: Catatan disimpan secara lokal di browser perangkat ini. Login untuk sinkronisasi cloud.
              </div>
            )}
            {notes.map(note => (
              <Card key={note.id} className="bg-white border-[#1e3525]/12 rounded-2xl shadow-[0_4px_20px_rgba(30,53,37,0.02)]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-serif text-[#1e3525] text-base leading-snug">{note.title}</CardTitle>
                    {note.is_processed && (
                      <Badge className="border-emerald-600/25 bg-emerald-500/10 text-emerald-800 text-xs flex-shrink-0">
                        Dianalisis
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {note.location_name && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <MapPin className="h-3 w-3" />{note.location_name}
                      </span>
                    )}
                    {note.mountain_context && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <Mountain className="h-3 w-3" />{note.mountain_context}
                      </span>
                    )}
                    {note.elevation_m && (
                      <span className="text-xs text-[#4a6455]">{note.elevation_m}m</span>
                    )}
                    {note.observed_at && (
                      <span className="flex items-center gap-1 text-xs text-[#4a6455]">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.observed_at).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4a6455] line-clamp-2 leading-relaxed">{note.raw_notes}</p>
                  <Button
                    onClick={() => analyzeNote(note)}
                    variant="outline"
                    className="mt-3 rounded-xl border-[#1e3525]/12 text-[#4a6455] hover:text-[#1e3525] hover:border-[#1e3525] text-xs h-auto py-1.5 px-3 cursor-pointer bg-white shadow-sm"
                  >
                    Analisis dengan NaLI →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicAppShell>
  );
}
