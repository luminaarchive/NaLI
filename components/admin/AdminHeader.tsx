import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { Glyph } from "@/components/Glyph";

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
              className={`inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] ${active === "dashboard" ? "text-ink underline underline-offset-4" : "text-gray hover:text-ink"}`}
            >
              <Glyph name="dashboard" className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/admin/analytics"
              className={`inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] ${active === "analytics" ? "text-ink underline underline-offset-4" : "text-gray hover:text-ink"}`}
            >
              <Glyph name="stats" className="h-3.5 w-3.5" />
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
