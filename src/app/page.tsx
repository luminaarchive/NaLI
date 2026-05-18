import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Layers3,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { HomeCommandBox } from "@/components/report/HomeCommandBox";
import { AuroraMesh } from "@/components/ui/AuroraMesh";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SiteFooter, SiteNav } from "@/components/ui/SiteNav";
import { buildJsonLdGraph } from "@/lib/seo/site";

const steps = ["Masukkan bahan", "Evidence Gate", "Draft terstruktur", "Evidence Table", "Review manusia"];
const templates = ["Observasi Lingkungan", "Praktikum Biologi", "Field Trip", "KKN Lingkungan", "Survei Flora/Fauna"];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <SiteNav dark />

      <main>
        <section className="relative isolate overflow-hidden bg-[#050806] text-stone-50">
          <AuroraMesh />
          <div className="topography-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1160px] content-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="max-w-[720px] self-center">
              <Badge tone="dark">NaLI Learn & Report MVP</Badge>
              <h1 className="mt-5 text-[2.65rem] leading-[1.04] font-semibold tracking-[0] sm:text-6xl">
                Ubah catatan lapangan menjadi laporan berbasis bukti.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
                NaLI membantu menyusun draft laporan sains, lingkungan, dan observasi tanpa mengarang data, sitasi,
                atau klaim.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Evidence Table", "Uncertainty Note", "No Fake Citation", "Human Review"].map((item) => (
                  <Badge key={item} tone="cyan">
                    {item}
                  </Badge>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/field-intelligence" variant="ghost">
                  Lihat Field Intelligence
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
            <div className="self-center lg:-mr-8">
              <HomeCommandBox />
            </div>
          </div>
        </section>

        <Section eyebrow="Apa yang NaLI lakukan?" title="Dari bahan mentah ke struktur yang bisa diperiksa.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Layers3,
                title: "Susun bahan",
                text: "Catatan, URL, lokasi, atau ringkasan file dirapikan menjadi struktur awal.",
              },
              {
                icon: ClipboardList,
                title: "Buat draft",
                text: "NaLI menyusun draft hanya dari bahan pengguna dan menandai batas buktinya.",
              },
              {
                icon: FileSearch,
                title: "Tampilkan batasan",
                text: "Evidence table, uncertainty note, dan checklist review muncul di hasil.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title}>
                  <Icon className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-forest-700">{item.text}</p>
                </Card>
              );
            })}
          </div>
        </Section>

        <Section dark eyebrow="Dua mode, satu engine" title="Public learning sekarang, field intelligence bertahap.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card tone="dark">
              <Badge tone="cyan">MVP aktif</Badge>
              <h3 className="mt-4 text-3xl font-semibold">NaLI Learn & Report</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Untuk siswa, mahasiswa, guru, NGO/CSR junior, peneliti junior, dan komunitas alam yang perlu menyusun
                laporan berbasis bahan.
              </p>
              <ButtonLink className="mt-5" href="/learn-report" variant="dark">
                Pelajari Public Mode
              </ButtonLink>
            </Card>
            <Card tone="dark">
              <Badge tone="amber">Positioning profesional</Badge>
              <h3 className="mt-4 text-3xl font-semibold">NaLI Field Intelligence</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Arah profesional untuk observasi, review queue, Darwin Core export, threat layer, patrol planner, dan
                Living Species Vault. Belum semua aktif di MVP publik.
              </p>
              <ButtonLink className="mt-5" href="/field-intelligence" variant="dark">
                Lihat Field Intelligence
              </ButtonLink>
            </Card>
          </div>
        </Section>

        <Section eyebrow="Alur evidence-based" title="NaLI memulai dari bukti, lalu mengajak manusia meninjau.">
          <div className="grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <Card className="p-4" key={step}>
                <span className="font-mono text-xs font-semibold text-olive-700">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-4 min-h-12 text-sm font-semibold leading-6">{step}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section eyebrow="Kalau belum punya bahan" title="NaLI membantu mulai, bukan memalsukan laporan.">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-warning-amber/50 bg-warning-amber/15 p-5">
              <h3 className="text-2xl font-semibold">Panduan awal</h3>
              <p className="mt-3 text-sm leading-7 text-forest-800">
                Jika kamu mulai dari nol, NaLI membuat rencana observasi, template field note, checklist bukti, dan
                daftar jenis sumber yang perlu dicari. Itu belum menjadi draft laporan.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Observation plan", "Field note template", "Evidence checklist", "Source search checklist"].map((item) => (
                <Card className="p-4" key={item}>
                  <ListChecks className="h-5 w-5 text-olive-700" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold">{item}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Section eyebrow="Template laporan" title="Mulai dari format yang sudah dikenal.">
          <div className="flex flex-wrap gap-3">
            {templates.map((template) => (
              <Badge className="min-h-10 px-4 text-sm" key={template} tone="green">
                {template}
              </Badge>
            ))}
          </div>
        </Section>

        <Section eyebrow="Integritas akademik" title="NaLI membantu menyusun, bukan menggantikan tanggung jawab.">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Tidak menerima empty prompt untuk draft",
              "Tidak membuat sitasi palsu",
              "Tidak membuat data palsu",
              "Output bukan karya final",
            ].map((item) => (
              <div className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4" key={item}>
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-olive-700" aria-hidden="true" />
                <p className="text-sm font-semibold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="bg-[#050806] px-4 py-16 text-stone-50 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1160px] flex-col gap-6 rounded-lg border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge tone="cyan">Beta pricing</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Mulai dari satu catatan — atau mulai dari nol.</h2>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Payment gateway belum aktif. MVP bisa dicoba tanpa checkout.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/create-report" variant="dark">
                Buat Draf
              </ButtonLink>
              <ButtonLink href="/create-report?mode=start_from_zero" variant="ghost">
                Buat Panduan Mulai
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({
  children,
  dark = false,
  eyebrow,
  title,
}: {
  children: ReactNode;
  dark?: boolean;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className={dark ? "bg-[#07100c] px-4 py-16 text-stone-50 sm:px-6 lg:px-8" : "px-4 py-16 sm:px-6 lg:px-8"}>
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-8 max-w-[720px]">
          <p className={dark ? "text-xs font-semibold uppercase tracking-[0.08em] text-data-cyan" : "text-xs font-semibold uppercase tracking-[0.08em] text-olive-700"}>
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[0] sm:text-4xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
