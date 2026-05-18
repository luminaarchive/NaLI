import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "glass";
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "glass";
};

const styles = {
  dark: "bg-white text-[#09090b] hover:bg-white/90",
  ghost: "border border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white",
  glass:
    "border border-white/[0.08] bg-white/[0.04] text-white/90 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/[0.15]",
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500",
  secondary:
    "border border-white/[0.1] bg-white/[0.06] text-white hover:bg-white/[0.1] hover:border-white/[0.18]",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-60";

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}

export function ButtonLink({ className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, styles[variant], className)} href={href} {...props} />;
}
