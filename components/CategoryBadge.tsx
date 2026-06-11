import Link from "next/link";
import type { Category } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";

const HREF: Record<Category, string> = {
  alam: "/alam",
  sejarah: "/sejarah",
  investigasi: "/investigasi",
  "catatan-lapangan": "/catatan-lapangan",
};

export function CategoryBadge({
  category,
  asLink = true,
}: {
  category: Category;
  asLink?: boolean;
}) {
  const inner = (
    <span className="label text-ink underline decoration-dashed decoration-1 underline-offset-4">
      {CATEGORY_LABEL[category]}
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link
      href={HREF[category]}
      className="transition-opacity hover:opacity-70"
      aria-label={`Kategori ${CATEGORY_LABEL[category]}`}
    >
      {inner}
    </Link>
  );
}
