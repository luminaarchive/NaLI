import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "light";

interface NaLILogoMarkProps {
  className?: string;
  size?: number;
  variant: LogoVariant;
}

interface NaLILogoProps extends NaLILogoMarkProps {
  href?: string | null;
  showWordmark?: boolean;
}

export function NaLILogoMark({ className, size = 32, variant }: NaLILogoMarkProps) {
  const stroke = variant === "dark" ? "#1e3525" : "#f5f0e8";

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 100 100"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 72 C8 60 13 48 23 39 C31 32 32 18 40 17 C49 16 58 40 66 40 C76 40 68 18 82 16 C95 15 94 34 89 45 C85 53 78 59 74 68 C70 78 66 84 59 83 C50 82 41 63 35 61 C28 59 31 76 24 80 C18 83 13 79 11 72 Z"
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="5.5"
      />
      <path
        d="M18 69 C17 61 20 53 28 46 C36 39 36 27 41 25 C46 24 56 48 66 48 C82 48 75 26 82 24 C88 23 88 34 83 43 C79 51 72 57 68 66 C64 75 62 77 58 76 C51 74 42 54 34 53 C22 52 28 68 21 71 C19 72 18 71 18 69 Z"
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function NaLILogo({
  className,
  href = "/",
  showWordmark = true,
  size = 32,
  variant,
}: NaLILogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <NaLILogoMark size={size} variant={variant} />
      {showWordmark ? (
        <span
          className={cn(
            "font-serif text-xl font-semibold leading-none",
            variant === "dark" ? "text-[#1e3525]" : "text-[#f5f0e8]",
          )}
        >
          NaLI
        </span>
      ) : null}
    </span>
  );

  if (href === null) {
    return content;
  }

  return (
    <Link aria-label="NaLI beranda" className="inline-flex min-h-[44px] items-center" href={href}>
      {content}
    </Link>
  );
}

export default NaLILogo;
