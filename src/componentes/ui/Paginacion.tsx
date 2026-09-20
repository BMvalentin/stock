import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utilidades/cn";

export function Paginacion({
  pagina,
  totalPaginas,
  baseHref,
  parametros,
}: {
  pagina: number;
  totalPaginas: number;
  baseHref: string;
  parametros?: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  function construirHref(destino: number): string {
    const busqueda = new URLSearchParams();

    Object.entries(parametros ?? {}).forEach(([clave, valor]) => {
      if (valor) busqueda.set(clave, valor);
    });

    if (destino > 1) busqueda.set("pagina", String(destino));

    const cadena = busqueda.toString();
    return cadena ? `${baseHref}?${cadena}` : baseHref;
  }

  const clasesBase =
    "inline-flex h-8 items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors";
  const deshabilitado = "pointer-events-none opacity-40";

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-zinc-500">
        Página {pagina} de {totalPaginas}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={construirHref(pagina - 1)}
          aria-disabled={pagina <= 1}
          className={cn(clasesBase, pagina <= 1 && deshabilitado)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </Link>
        <Link
          href={construirHref(pagina + 1)}
          aria-disabled={pagina >= totalPaginas}
          className={cn(clasesBase, pagina >= totalPaginas && deshabilitado)}
        >
          Siguiente
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
