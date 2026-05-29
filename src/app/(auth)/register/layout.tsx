import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Baru | NaLI",
  description: "Daftar akun NaLI baru untuk mulai menyusun draf laporan observasi, mencatat temuan lapangan, dan mengelola evidence table Anda.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
