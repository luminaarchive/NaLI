import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk ke Akun | NaLI",
  description: "Masuk ke akun NaLI Anda untuk mengakses riwayat laporan lapangan, draf akademik, dan data observasi lingkungan secara aman.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
