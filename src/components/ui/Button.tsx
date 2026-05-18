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
  dark: "bg-[#07100B] text-stone-50 hover:bg-[#111814]",
  ghost: "border border-transparent text-forest-900 hover:bg-[#E8EFE4]",
  primary: "bg-[#173D2B] text-stone-50 hover:bg-[#102b1e]",
  secondary: "border border-[#DDD5C7] bg-white text-[#111814] hover:bg-[#FCFAF4]",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 disabled:pointer-events-none disabled:opacity-60";

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(base, styles[variant], className)} {...props} />;
}

export function ButtonLink({ className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, styles[variant], className)} href={href} {...props} />;
}
