import type { ReactNode } from "react";
import { cn } from "@/lib/utilidades/cn";

export function Tarjeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
