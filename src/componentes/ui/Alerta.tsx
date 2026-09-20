import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utilidades/cn";

export type TonoAlerta = "info" | "exito" | "advertencia" | "error";

const TONOS: Record<TonoAlerta, { clases: string; Icono: typeof Info }> = {
  info: { clases: "bg-blue-50 text-blue-800", Icono: Info },
  exito: { clases: "bg-emerald-50 text-emerald-800", Icono: CircleCheck },
  advertencia: {
    clases: "bg-amber-50 text-amber-800",
    Icono: TriangleAlert,
  },
  error: { clases: "bg-red-50 text-red-800", Icono: CircleAlert },
};

export function Alerta({
  tono = "info",
  children,
}: {
  tono?: TonoAlerta;
  children: ReactNode;
}) {
  const { clases, Icono } = TONOS[tono];

  return (
    <div
      role={tono === "error" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
        clases,
      )}
    >
      <Icono className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      <div>{children}</div>
    </div>
  );
}
