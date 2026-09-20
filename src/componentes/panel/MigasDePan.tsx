"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  ETIQUETAS_RUTA,
  SEGMENTOS_ESPECIALES,
} from "@/constantes/navegacion";

type Miga = { etiqueta: string; href: string };

function construirMigas(ruta: string): Miga[] {
  const segmentos = ruta.split("/").filter(Boolean);

  if (segmentos.length === 0) {
    return [{ etiqueta: "Dashboard", href: "/dashboard" }];
  }

  const migas: Miga[] = [];
  let acumulado = "";

  segmentos.forEach((segmento, indice) => {
    acumulado += `/${segmento}`;

    if (indice === 0) {
      migas.push({
        etiqueta: ETIQUETAS_RUTA[acumulado] ?? segmento,
        href: acumulado,
      });
      return;
    }

    const esEspecial = SEGMENTOS_ESPECIALES.includes(segmento);
    migas.push({
      etiqueta: esEspecial
        ? (ETIQUETAS_RUTA[segmento] ?? segmento)
        : "Detalle",
      href: acumulado,
    });
  });

  return migas;
}

export function MigasDePan() {
  const ruta = usePathname();
  const migas = construirMigas(ruta);

  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex items-center gap-1 text-sm">
        {migas.map((miga, indice) => {
          const ultima = indice === migas.length - 1;

          return (
            <li key={miga.href} className="flex min-w-0 items-center gap-1">
              {indice > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
              ) : null}
              {ultima ? (
                <span className="truncate font-medium text-zinc-900">
                  {miga.etiqueta}
                </span>
              ) : (
                <Link
                  href={miga.href}
                  className="truncate text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  {miga.etiqueta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
