"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITEMS_NAVEGACION } from "@/constantes/navegacion";
import { puedeAcceder } from "@/lib/seguridad/puedeAcceder";
import { cn } from "@/lib/utilidades/cn";
import type { Rol } from "@/generated/prisma/enums";

export function BarraLateral({
  rol,
  alNavegar,
}: {
  rol: Rol;
  alNavegar?: () => void;
}) {
  const rutaActual = usePathname();
  const items = ITEMS_NAVEGACION.filter((item) => puedeAcceder(rol, item.ruta));

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white">
          S
        </span>
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Gestión de Stock
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          // El dashboard vive en /admin: solo se marca activo con coincidencia
          // exacta para no resaltarlo en todas las secciones hijas.
          const activo =
            item.ruta === "/admin"
              ? rutaActual === "/admin"
              : rutaActual === item.ruta ||
                rutaActual.startsWith(`${item.ruta}/`);
          const Icono = item.icono;

          return (
            <Link
              key={item.ruta}
              href={item.ruta}
              onClick={alNavegar}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                activo
                  ? "bg-zinc-900 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icono className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.etiqueta}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
