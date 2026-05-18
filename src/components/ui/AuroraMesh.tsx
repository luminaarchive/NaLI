import { cn } from "@/lib/utils";

export function AuroraMesh({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="aurora-mesh absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,6,0.12),rgba(5,8,6,0.94))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(5,8,6,0.36)_58%,rgba(5,8,6,0.92)_100%)]" />
    </div>
  );
}
