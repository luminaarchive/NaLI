import Link from "next/link";
import type { ReactNode } from "react";
import { Glyph, type GlyphName } from "@/components/Glyph";
import { NaliMark } from "@/components/brand/NaliMark";
import { LogoutButton } from "./LogoutButton";

type AdminActive = "dashboard" | "analytics" | "contradictions";

function NavRow({
  href,
  glyph,
  label,
  active = false,
}: {
  href: string;
  glyph: GlyphName;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`flex items-center gap-3 border border-dashed px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-ink/40 bg-ink text-paper"
          : "border-transparent text-gray hover:border-ink/40 hover:bg-ink-wash hover:text-ink"
      }`}
    >
      <Glyph name={glyph} className="h-4 w-4 shrink-0" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

/**
 * Admin chrome, a sticky left icon-sidebar (icon-only on mobile, icon+label
 * on lg) + a content area. Inspired by the Nous Portal dashboard nav, in NaLI
 * ink. Replaces the old top AdminHeader.
 */
export function AdminShell({
  active,
  children,
}: {
  active?: AdminActive;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="sticky top-0 flex h-screen w-14 shrink-0 flex-col justify-between border-r border-dashed border-ink/50 bg-ink-wash/20 lg:w-56">
        <div>
          <Link
            href="/admin"
            className="flex h-16 items-center gap-2 border-b border-dashed border-ink/30 px-4"
          >
            <NaliMark className="h-7 w-auto shrink-0 text-ink" />
            <span className="hidden font-display text-base font-bold uppercase tracking-tight text-ink lg:inline">
              NaLI · Admin
            </span>
          </Link>
          <nav className="mt-3 flex flex-col gap-1.5 px-2">
            <NavRow href="/admin" glyph="dashboard" label="Dashboard" active={active === "dashboard"} />
            <NavRow href="/admin/posts/new" glyph="plus" label="Tulisan baru" />
            <NavRow href="/admin/analytics" glyph="stats" label="Statistik" active={active === "analytics"} />
            <NavRow href="/admin/contradictions" glyph="contradiction" label="Kontradiksi" active={active === "contradictions"} />
          </nav>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-dashed border-ink/30 p-2">
          <NavRow href="/" glyph="external" label="Lihat situs" />
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
