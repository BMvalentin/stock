"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TAMANOS_PAGINA } from "@/constantes/paginacion";

// Selector de tamaño de página. Al cambiar el tamaño vuelve a la página 1 para
// no quedar fuera de rango, conservando el resto de los filtros.
export function SelectorTamanoPagina({ porPagina }: { porPagina: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function cambiarTamano(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("porPagina", valor);
    params.delete("pagina");

    const cadena = params.toString();
    router.push(cadena ? `${pathname}?${cadena}` : pathname);
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>Filas</span>
      <select
        value={porPagina}
        onChange={(evento) => cambiarTamano(evento.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      >
        {TAMANOS_PAGINA.map((tamano) => (
          <option key={tamano} value={tamano}>
            {tamano}
          </option>
        ))}
      </select>
    </label>
  );
}
