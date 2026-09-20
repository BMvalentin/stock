import Link from "next/link";
import type { ReactNode } from "react";
import { Boton } from "@/componentes/ui/Boton";

export function BarraFiltros({
  baseHref,
  limpiarHref,
  children,
}: {
  baseHref: string;
  limpiarHref?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={baseHref}
      method="get"
      className="flex flex-wrap items-center gap-2"
    >
      {children}
      <Boton type="submit" variante="secundario" tamano="sm">
        Filtrar
      </Boton>
      {limpiarHref ? (
        <Link
          href={limpiarHref}
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Limpiar
        </Link>
      ) : null}
    </form>
  );
}
