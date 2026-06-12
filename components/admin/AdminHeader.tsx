import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function AdminHeader({ active }: { active?: "dashboard" | "analytics" }) {
  return (
    <header className="border-b border-dashed border-ink/50 bg-paper">
      <div className="container-editorial flex h-16 items-center justify-between">
        <div className="flex items-baseline gap-5">
          <Link href="/admin" className="font-display text-lg font-bold uppercase tracking-tight text-ink">
            NaLI · Admin
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/admin"
              className={`font-mono text-[0.72rem] uppercase tracking-[0.16em] ${active === "dashboard" ? "text-ink underline underline-offset-4" : "text-gray hover:text-ink"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/analytics"
              className={`font-mono text-[0.72rem] uppercase tracking-[0.16em] ${active === "analytics" ? "text-ink underline underline-offset-4" : "text-gray hover:text-ink"}`}
            >
              Statistik
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-gray hover:text-ink"
          >
            Lihat situs →
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
