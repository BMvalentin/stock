"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utilidades/cn";
import type { GrupoNavegacion as Grupo } from "@/constantes/navegacion";
import { ElementoNavegacion } from "@/componentes/panel/ElementoNavegacion";
import { esRutaActiva } from "@/componentes/panel/esRutaActiva";

const EVENTO_CAMBIO = "sidebar:grupo:cambio";

function claveAlmacenamiento(titulo: string): string {
  return `sidebar:grupo:${titulo}`;
}

function leerGuardado(titulo: string, porDefecto: boolean): boolean {
  if (typeof window === "undefined") return porDefecto;
  const guardado = localStorage.getItem(claveAlmacenamiento(titulo));
  return guardado === null ? porDefecto : guardado === "1";
}

function suscribirCambios(callback: () => void): () => void {
  window.addEventListener(EVENTO_CAMBIO, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, callback);
    window.removeEventListener("storage", callback);
  };
}

export function GrupoNavegacion({
  grupo,
  rutaActual,
  alNavegar,
}: {
  grupo: Grupo;
  rutaActual: string;
  alNavegar?: () => void;
}) {
  const titulo = grupo.titulo ?? "";
  const porDefecto = grupo.abiertoPorDefecto ?? false;

  const abierto = useSyncExternalStore(
    suscribirCambios,
    () => leerGuardado(titulo, porDefecto),
    () => porDefecto,
  );

  const contieneActiva = grupo.items.some((item) =>
    esRutaActiva(rutaActual, item.ruta),
  );
  const mostrarAbierto = contieneActiva || abierto;

  const alternar = useCallback(() => {
    const siguiente = !leerGuardado(titulo, porDefecto);
    localStorage.setItem(claveAlmacenamiento(titulo), siguiente ? "1" : "0");
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
  }, [titulo, porDefecto]);

  return (
    <div>
      <button
        type="button"
        onClick={alternar}
        aria-expanded={mostrarAbierto}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          contieneActiva
            ? "font-medium text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        )}
      >
        <span className="truncate">{titulo}</span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-zinc-400 transition-transform",
            mostrarAbierto && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>

      {mostrarAbierto ? (
        <div className="space-y-0.5 pl-3">
          {grupo.items.map((item) => (
            <ElementoNavegacion
              key={item.ruta}
              item={item}
              rutaActual={rutaActual}
              alNavegar={alNavegar}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
