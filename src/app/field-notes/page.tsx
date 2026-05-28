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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [form, setForm] = useState({
    title: "", raw_notes: "", location_name: "", mountain: "",
    elevation_m: "", weather_notes: "", habitat_type: "", observed_at: "",
  });

  useEffect(() => {
    fetch("/api/field-notes")
      .then(r => r.json())
      .then(d => setNotes(d.notes ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function saveNote() {
    if (!form.title.trim() || !form.raw_notes.trim() || saving) return;
    setSaving(true);
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
      const data = await res.json();
      if (data.note) {
        setNotes(prev => [{ ...data.note, raw_notes: form.raw_notes, is_processed: false } as FieldNote, ...prev]);
        setDialogOpen(false);
        setForm({ title: "", raw_notes: "", location_name: "", mountain: "", elevation_m: "", weather_notes: "", habitat_type: "", observed_at: "" });
      }
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
    <PublicAppShell>
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#f5f0e8] mb-2">Catatan Lapangan</h1>
            <p className="text-[#a1b3a8]">Dokumentasikan observasi lapangan dan analisis dengan NaLI.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" /> Catatan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#08100c] border border-[#14261c] rounded-2xl text-[#f5f0e8] w-full max-w-[calc(100vw-32px)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-[#f5f0e8]">Catatan Lapangan Baru</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-2">
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Judul *</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({...p,title:e.target.value}))} placeholder="Contoh: Observasi Macan Tutul — Merbabu 2706" className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Lokasi</Label>
                    <Input value={form.location_name} onChange={e => setForm(p => ({...p,location_name:e.target.value}))} placeholder="Nama lokasi" className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30" />
                  </div>
                  <div>
                    <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Elevasi (m)</Label>
                    <Input type="number" value={form.elevation_m} onChange={e => setForm(p => ({...p,elevation_m:e.target.value}))} placeholder="Contoh: 2400" className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Gunung Pilot</Label>
                    <Select value={form.mountain} onValueChange={v => setForm(p => ({...p,mountain:v}))}>
                      <SelectTrigger className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] rounded-xl"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                      <SelectContent className="bg-[#08100c] border-[#14261c]">
                        {MOUNTAINS.map(m => <SelectItem key={m} value={m} className="text-[#a1b3a8] focus:text-[#f5f0e8] focus:bg-[#14261c] capitalize cursor-pointer">{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Tipe Habitat</Label>
                    <Select value={form.habitat_type} onValueChange={v => setForm(p => ({...p,habitat_type:v}))}>
                      <SelectTrigger className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] rounded-xl"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                      <SelectContent className="bg-[#08100c] border-[#14261c]">
                        {HABITATS.map(h => <SelectItem key={h.value} value={h.value} className="text-[#a1b3a8] focus:text-[#f5f0e8] focus:bg-[#14261c] cursor-pointer">{h.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Tanggal Observasi</Label>
                  <Input type="datetime-local" value={form.observed_at} onChange={e => setForm(p => ({...p,observed_at:e.target.value}))} className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] rounded-xl focus-visible:ring-[#00FFB3]/30" />
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Kondisi Cuaca</Label>
                  <Input value={form.weather_notes} onChange={e => setForm(p => ({...p,weather_notes:e.target.value}))} placeholder="Cerah, berawan, kabut, hujan ringan..." className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30" />
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Catatan Lapangan *</Label>
                  <Textarea value={form.raw_notes} onChange={e => setForm(p => ({...p,raw_notes:e.target.value}))} placeholder="Deskripsikan observasi secara bebas: spesies yang ditemukan, perilaku, kondisi habitat, tanda-tanda kehadiran, ancaman yang terlihat..." rows={5} className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl resize-none focus-visible:ring-[#00FFB3]/30" />
                </div>
                <Button onClick={saveNote} disabled={!form.title.trim() || !form.raw_notes.trim() || saving} className="w-full rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] disabled:opacity-50 cursor-pointer">
                  {saving ? "Menyimpan..." : "Simpan Catatan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="bg-[#08100c] border border-[#14261c] rounded-2xl h-28 animate-pulse" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-[#14261c] mx-auto mb-4" />
            <p className="text-[#a1b3a8] mb-2">Belum ada catatan lapangan.</p>
            <p className="text-[#a1b3a8]/50 text-sm">Mulai dokumentasikan observasi lapanganmu.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map(note => (
              <Card key={note.id} className="bg-[#08100c] border-[#14261c] rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-serif text-[#f5f0e8] text-base leading-snug">{note.title}</CardTitle>
                    {note.is_processed && (
                      <Badge className="border-[#00FFB3]/25 bg-[#00FFB3]/10 text-[#00FFB3] text-xs flex-shrink-0">
                        Dianalisis
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {note.location_name && (
                      <span className="flex items-center gap-1 text-xs text-[#a1b3a8]/60">
                        <MapPin className="h-3 w-3" />{note.location_name}
                      </span>
                    )}
                    {note.mountain_context && (
                      <span className="flex items-center gap-1 text-xs text-[#a1b3a8]/60">
                        <Mountain className="h-3 w-3" />{note.mountain_context}
                      </span>
                    )}
                    {note.elevation_m && (
                      <span className="text-xs text-[#a1b3a8]/60">{note.elevation_m}m</span>
                    )}
                    {note.observed_at && (
                      <span className="flex items-center gap-1 text-xs text-[#a1b3a8]/60">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.observed_at).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#a1b3a8] line-clamp-2 leading-relaxed">{note.raw_notes}</p>
                  <Button
                    onClick={() => analyzeNote(note)}
                    variant="outline"
                    className="mt-3 rounded-xl border-[#14261c] text-[#a1b3a8] hover:text-[#f5f0e8] hover:border-[#1e3525] text-xs h-auto py-1.5 px-3 cursor-pointer"
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
