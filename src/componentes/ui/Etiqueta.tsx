import type { ReactNode } from "react";
import { cn } from "@/lib/utilidades/cn";

export type TonoEtiqueta =
  | "neutral"
  | "exito"
  | "alerta"
  | "peligro"
  | "info";

const TONOS: Record<TonoEtiqueta, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  exito: "bg-emerald-50 text-emerald-700",
  alerta: "bg-amber-50 text-amber-700",
  peligro: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

export function Etiqueta({
  tono = "neutral",
  children,
}: {
  tono?: TonoEtiqueta;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONOS[tono],
      )}
    >
      {children}
    </span>
  );
}
