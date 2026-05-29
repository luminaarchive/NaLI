import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catatan Lapangan | NaLI",
  description: "Kelola catatan lapangan, praktikum, dan data observasi mentah Anda secara aman di dalam repositori NaLI Anda.",
};

export default function FieldNotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
