import type { Category } from "@/lib/types";

/**
 * Decorative line-art motif per pillar — a quiet identity mark in the corner
 * of the pillar header, drawn in the pillar's own accent (currentColor → ink).
 * Inspired by the corner flourishes on the Nous family of sites, rebuilt as
 * NaLI archive line-art. Purely decorative (aria-hidden, pointer-events-none),
 * hidden on small screens, reduced-motion-safe.
 */
const MOTIFS: Partial<Record<Category, React.ReactNode>> = {
  // ALAM — stylised topographic contours (terrain / nature)
  alam: (
    <>
      <path d="M14 70C28 50 50 46 66 56C82 66 98 60 106 44" />
      <path d="M18 82C34 64 54 60 70 68C85 76 99 71 108 58" />
      <path d="M24 94C42 78 60 74 76 82C89 89 100 85 110 73" />
    </>
  ),
  // SEJARAH — a colonnade of arches (heritage / archive)
  sejarah: (
    <>
      <path d="M18 104V58a18 18 0 0 1 36 0v46" />
      <path d="M60 104V58a18 18 0 0 1 36 0v46" />
      <path d="M8 104h104" />
    </>
  ),
  // INVESTIGASI — magnifier + crosshair (case file / scrutiny)
  investigasi: (
    <>
      <circle cx="52" cy="52" r="30" />
      <path d="M74 74 99 99" />
      <path d="M52 34v36M34 52h36" />
    </>
  ),
  // CATATAN LAPANGAN — a field location pin
  "catatan-lapangan": (
    <>
      <path d="M60 20a26 26 0 0 0-26 26c0 19 26 46 26 46s26-27 26-46a26 26 0 0 0-26-26Z" />
      <circle cx="60" cy="46" r="9" />
    </>
  ),
};

export function PillarMotif({ category }: { category: Category }) {
  const motif = MOTIFS[category];
  if (!motif) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      className="pointer-events-none absolute right-5 top-6 hidden h-28 w-28 text-ink/20 motion-safe:animate-fade-up sm:block lg:right-10 lg:h-36 lg:w-36"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {motif}
    </svg>
  );
}
