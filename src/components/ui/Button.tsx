import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

const styles = {
  dark: "bg-stone-50 text-forest-950 hover:bg-white",
  ghost: "text-sand-100 hover:bg-white/10",
  primary: "bg-forest-900 text-stone-50 hover:bg-forest-800",
  secondary: "border border-stone-300 bg-white text-forest-950 hover:bg-stone-100",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-data-cyan disabled:pointer-events-none disabled:opacity-60";

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}

export function ButtonLink({ className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, styles[variant], className)} href={href} {...props} />;
}
