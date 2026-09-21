import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PAGINA_POR_DEFECTO } from "@/constantes/paginacion";
import { cn } from "@/lib/utilidades/cn";
import { SelectorTamanoPagina } from "@/componentes/ui/SelectorTamanoPagina";

function rangoPaginas(pagina: number, totalPaginas: number): number[] {
  const ventana = 2;
  const inicio = Math.max(1, pagina - ventana);
  const fin = Math.min(totalPaginas, pagina + ventana);
  const paginas: number[] = [];

  for (let numero = inicio; numero <= fin; numero += 1) {
    paginas.push(numero);
  }

  return paginas;
}

export function Paginacion({
  pagina,
  totalPaginas,
  totalRegistros,
  porPagina,
  baseHref,
  parametros,
}: {
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  porPagina: number;
  baseHref: string;
  parametros?: Record<string, string | undefined>;
}) {
  function construirHref(destino: number): string {
    const busqueda = new URLSearchParams();

    Object.entries(parametros ?? {}).forEach(([clave, valor]) => {
      if (valor) busqueda.set(clave, valor);
    });

    if (porPagina !== PAGINA_POR_DEFECTO) {
      busqueda.set("porPagina", String(porPagina));
    }

    if (destino > 1) busqueda.set("pagina", String(destino));

    const cadena = busqueda.toString();
    return cadena ? `${baseHref}?${cadena}` : baseHref;
  }

  const desde = totalRegistros === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, totalRegistros);
  const paginas = rangoPaginas(pagina, totalPaginas);

  const clasesBase =
    "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 transition-colors";
  const deshabilitado = "pointer-events-none opacity-40";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-zinc-500">
          {desde}–{hasta} de {totalRegistros}
        </p>
        <SelectorTamanoPagina porPagina={porPagina} />
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={construirHref(1)}
          aria-label="Primera página"
          aria-disabled={pagina <= 1}
          className={cn(clasesBase, pagina <= 1 && deshabilitado)}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={construirHref(pagina - 1)}
          aria-label="Página anterior"
          aria-disabled={pagina <= 1}
          className={cn(clasesBase, pagina <= 1 && deshabilitado)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>

        {paginas[0] > 1 ? (
          <span className="px-1 text-xs text-zinc-400">…</span>
        ) : null}

        {paginas.map((numero) => (
          <Link
            key={numero}
            href={construirHref(numero)}
            aria-current={numero === pagina ? "page" : undefined}
            className={cn(
              clasesBase,
              numero === pagina &&
                "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-900",
            )}
          >
            {numero}
          </Link>
        ))}

        {paginas[paginas.length - 1] < totalPaginas ? (
          <span className="px-1 text-xs text-zinc-400">…</span>
        ) : null}

        <Link
          href={construirHref(pagina + 1)}
          aria-label="Página siguiente"
          aria-disabled={pagina >= totalPaginas}
          className={cn(clasesBase, pagina >= totalPaginas && deshabilitado)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={construirHref(totalPaginas)}
          aria-label="Última página"
          aria-disabled={pagina >= totalPaginas}
          className={cn(clasesBase, pagina >= totalPaginas && deshabilitado)}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
