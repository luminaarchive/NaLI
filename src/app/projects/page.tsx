"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderOpen, Pin, MessageSquare } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  mountain_context: string | null;
  is_pinned: boolean;
  session_count: number;
  updated_at: string;
}

const MOUNTAINS = [
  { value: "semeru", label: "Semeru" },
  { value: "merbabu", label: "Merbabu" },
  { value: "lawu", label: "Lawu" },
  { value: "sindoro-sumbing", label: "Sindoro-Sumbing" },
  { value: "rinjani", label: "Rinjani" },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", instructions: "", mountain: "" });

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function createProject() {
    if (!form.name.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          instructions: form.instructions || null,
          mountain_context: form.mountain || null,
        }),
      });
      const data = await res.json();
      if (data.project) {
        setProjects(prev => [data.project, ...prev]);
        setDialogOpen(false);
        setForm({ name: "", description: "", instructions: "", mountain: "" });
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <PublicAppShell>
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#f5f0e8] mb-2">
              Proyek Riset
            </h1>
            <p className="text-[#a1b3a8]">
              Workspace persisten untuk riset berulang. Setiap sesi baru mewarisi konteks proyekmu.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" /> Proyek Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#08100c] border border-[#14261c] rounded-2xl text-[#f5f0e8] max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-[#f5f0e8]">Buat Proyek Baru</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-2">
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Nama Proyek *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Contoh: Monitoring Macan Tutul Merbabu 2026"
                    className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30"
                  />
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Gunung Pilot (opsional)</Label>
                  <Select value={form.mountain} onValueChange={v => setForm(p => ({ ...p, mountain: v }))}>
                    <SelectTrigger className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] rounded-xl w-full">
                      <SelectValue placeholder="Pilih gunung..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#08100c] border-[#14261c]">
                      {MOUNTAINS.map(m => (
                        <SelectItem key={m.value} value={m.value} className="text-[#a1b3a8] focus:text-[#f5f0e8] focus:bg-[#14261c] cursor-pointer">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Deskripsi (opsional)</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Tujuan dan ruang lingkup proyek..."
                    rows={2}
                    className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl resize-none focus-visible:ring-[#00FFB3]/30"
                  />
                </div>
                <div>
                  <Label className="text-[#a1b3a8] text-xs mb-1.5 block">Instruksi Master (opsional)</Label>
                  <Textarea
                    value={form.instructions}
                    onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                    placeholder="Konteks khusus yang selalu diterapkan di setiap sesi dalam proyek ini..."
                    rows={3}
                    className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl resize-none focus-visible:ring-[#00FFB3]/30"
                  />
                </div>
                <Button
                  onClick={createProject}
                  disabled={!form.name.trim() || creating}
                  className="w-full rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Membuat..." : "Buat Proyek"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-[#08100c] border border-[#14261c] rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-12 w-12 text-[#14261c] mx-auto mb-4" />
            <p className="text-[#a1b3a8] mb-2">Belum ada proyek.</p>
            <p className="text-[#a1b3a8]/50 text-sm">Buat proyek pertamamu untuk mengorganisir riset berulang.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(p => (
              <Card
                key={p.id}
                className="bg-[#08100c] border-[#14261c] rounded-2xl cursor-pointer hover:border-[#1e3525] transition-colors"
                onClick={() => router.push("/")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-serif text-[#f5f0e8] text-base leading-snug">{p.name}</CardTitle>
                    {p.is_pinned && <Pin className="h-3.5 w-3.5 text-[#00FFB3] flex-shrink-0 mt-0.5" />}
                  </div>
                  {p.mountain_context && (
                    <Badge className="w-fit border-[#14261c] bg-transparent text-[#a1b3a8] text-xs capitalize">
                      🏔️ {p.mountain_context}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {p.description && (
                    <p className="text-sm text-[#a1b3a8] line-clamp-2 leading-relaxed">{p.description}</p>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-[#a1b3a8]/50">
                    <MessageSquare className="h-3 w-3" />
                    <span>{p.session_count} sesi</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicAppShell>
  );
}
