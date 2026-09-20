"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utilidades/cn";

const ANCHOS = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  ancho = "md",
  children,
}: {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion?: string;
  ancho?: keyof typeof ANCHOS;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;

    function alPresionar(evento: KeyboardEvent) {
      if (evento.key === "Escape") alCerrar();
    }

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="fixed inset-0 bg-zinc-900/40"
        onClick={alCerrar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          "relative z-10 my-8 w-full rounded-xl border border-zinc-200 bg-white shadow-xl",
          ANCHOS[ancho],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-zinc-900">{titulo}</h2>
            {descripcion ? (
              <p className="text-sm text-zinc-500">{descripcion}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            className="-mr-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
