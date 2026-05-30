import type { Metadata } from "next";
import { FieldNotesContent } from "./FieldNotesContent";

export const metadata: Metadata = {
  title: "NaLI — Catatan Lapangan",
  description: "Dokumentasikan catatan lapangan dan observasi lapangan kamu secara terstruktur dengan NaLI.",
};

export default function FieldNotesPage() {
  return <FieldNotesContent />;
}
