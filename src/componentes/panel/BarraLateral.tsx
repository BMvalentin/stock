"use client";

import { usePathname } from "next/navigation";
import {
  GRUPOS_NAVEGACION_ADMIN,
  GRUPOS_NAVEGACION_EMPLEADO,
  type GrupoNavegacion,
} from "@/constantes/navegacion";
import type { Rol } from "@/generated/prisma/enums";
import { ElementoNavegacion } from "@/componentes/panel/ElementoNavegacion";
import { GrupoNavegacion as AcordeonNavegacion } from "@/componentes/panel/GrupoNavegacion";

function gruposParaRol(rol: Rol): GrupoNavegacion[] {
  return rol === "ADMIN"
    ? GRUPOS_NAVEGACION_ADMIN
    : GRUPOS_NAVEGACION_EMPLEADO;
}

export function BarraLateral({
  rol,
  alNavegar,
}: {
  rol: Rol;
  alNavegar?: () => void;
}) {
  const rutaActual = usePathname();
  const grupos = gruposParaRol(rol);

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
        {grupos.map((grupo, indice) =>
          grupo.titulo ? (
            <AcordeonNavegacion
              key={grupo.titulo}
              grupo={grupo}
              rutaActual={rutaActual}
              alNavegar={alNavegar}
            />
          ) : (
            <div key={indice} className="space-y-0.5">
              {grupo.items.map((item) => (
                <ElementoNavegacion
                  key={item.ruta}
                  item={item}
                  rutaActual={rutaActual}
                  alNavegar={alNavegar}
                />
              ))}
            </div>
          ),
        )}
      </nav>
    </div>
  );
}
