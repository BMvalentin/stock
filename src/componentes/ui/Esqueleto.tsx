import { cn } from "@/lib/utilidades/cn";

export function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200", className)}
      aria-hidden
    />
  );
}
