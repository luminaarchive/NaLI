"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({
  title = "NaLI",
  showBack = false,
  backHref,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-[#09090b]/80 px-4 backdrop-blur-xl">
      {showBack && (
        <button
          onClick={handleBack}
          className="-ml-2 mr-2 p-2 text-white/40 transition-colors hover:text-white"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="flex items-center gap-2">
        <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
          <Image src="/nali-logo.png" alt="NaLI" fill className="object-cover p-0.5" sizes="28px" unoptimized />
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-white">{title}</h1>
      </div>
    </header>
  );
}
