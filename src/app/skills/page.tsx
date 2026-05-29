"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Repeat, Layers } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  prompt_template: string;
  category: string;
  icon_emoji: string;
  is_builtin: boolean;
  usage_count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  identification: "Identifikasi",
  survey: "Survey",
  conservation: "Konservasi",
  education: "Edukasi",
  general: "Umum",
};

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(d => setSkills(d.skills ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleUseSkill(skill: Skill) {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: skill.prompt_template }),
      });
      if (!res.ok) throw new Error();
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
    } catch {
      router.push("/");
    }
  }

  const builtin = skills.filter(s => s.is_builtin);
  const custom = skills.filter(s => !s.is_builtin);
  const categories = [...new Set(builtin.map(s => s.category))];

  return (
    <PublicAppShell>
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#f5f0e8] mb-4">
            NaLI Skills
          </h1>
          <p className="text-[#a1b3a8] text-lg max-w-xl mx-auto">
            Template riset lapangan siap pakai. Satu klik untuk memulai sesi dengan konteks yang tepat.
          </p>
        </div>

        {/* Why skills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Sparkles, title: "Spesialisasi", desc: "Setiap skill dirancang untuk tugas lapangan spesifik dengan konteks yang sudah terstruktur." },
            { icon: Repeat, title: "Dapat Diulang", desc: "Gunakan template yang sama berkali-kali untuk konsistensi dokumentasi lapangan." },
            { icon: Layers, title: "Komposabel", desc: "Kombinasikan skills untuk workflow kompleks dari identifikasi hingga laporan akhir." },
          ].map(item => (
            <div key={item.title} className="bg-[#08100c] border border-[#14261c] rounded-2xl p-5">
              <item.icon className="h-5 w-5 text-[#00FFB3] mb-3" />
              <h3 className="font-serif text-[#f5f0e8] font-semibold mb-1">{item.title}</h3>
              <p className="text-[#a1b3a8] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Skills tabs */}
        <Tabs defaultValue="builtin">
          <TabsList className="bg-[#08100c] border border-[#14261c] rounded-xl p-1 mb-8">
            <TabsTrigger
              value="builtin"
              className="rounded-lg text-[#a1b3a8] data-[state=active]:bg-[#1e3525] data-[state=active]:text-[#f5f0e8] text-sm cursor-pointer"
            >
              Skills Resmi NaLI
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="rounded-lg text-[#a1b3a8] data-[state=active]:bg-[#1e3525] data-[state=active]:text-[#f5f0e8] text-sm cursor-pointer"
            >
              Skills Kamu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builtin">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="bg-[#08100c] border border-[#14261c] rounded-2xl h-36 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(cat => (
                  <div key={cat}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#00FFB3]/70 mb-4">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {builtin.filter(s => s.category === cat).map(skill => (
                        <Card key={skill.id} className="bg-[#08100c] border-[#14261c] rounded-2xl flex flex-col">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{skill.icon_emoji}</span>
                              <Badge className="border-[#00FFB3]/25 bg-[#00FFB3]/10 text-[#00FFB3] text-xs">
                                Resmi NaLI
                              </Badge>
                            </div>
                            <CardTitle className="font-serif text-[#f5f0e8] text-base">{skill.name}</CardTitle>
                            <CardDescription className="text-[#a1b3a8] text-sm leading-relaxed">{skill.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <div className="bg-[#0b1a12] border border-[#14261c] rounded-xl p-3 max-h-20 overflow-hidden relative">
                              <p className="text-xs text-[#a1b3a8]/60 font-mono leading-relaxed whitespace-pre-wrap">
                                {skill.prompt_template.slice(0, 120)}...
                              </p>
                              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0b1a12] to-transparent" />
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              onClick={() => handleUseSkill(skill)}
                              className="w-full rounded-xl bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] text-sm cursor-pointer"
                            >
                              Gunakan Skill →
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom">
            <div className="text-center py-16">
              <p className="text-[#a1b3a8] mb-2">Belum ada skill custom.</p>
              <p className="text-[#a1b3a8]/50 text-sm mb-6">
                Selesaikan sesi yang bagus, lalu simpan sebagai skill untuk digunakan kembali.
              </p>
              <Badge className="border-[#14261c] bg-transparent text-[#a1b3a8] text-xs">
                Fitur simpan skill - segera hadir
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicAppShell>
  );
}
