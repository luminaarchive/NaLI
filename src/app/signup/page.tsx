import type { Metadata } from "next";
import { SignupContent } from "./SignupContent";

export const metadata: Metadata = {
  title: "NaLI — Daftar",
  description: "Buat akun NaLI gratis. Mulai dokumentasi lapangan dan laporan ilmiah berbasis bukti.",
};

export default function SignupPage() {
  return <SignupContent />;
}
