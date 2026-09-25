import Link from "next/link";
import { cn } from "@/lib/utilidades/cn";
import type { ItemNavegacion } from "@/constantes/navegacion";
import { esRutaActiva } from "@/componentes/panel/esRutaActiva";

export function ElementoNavegacion({
  item,
  rutaActual,
  alNavegar,
}: {
  item: ItemNavegacion;
  rutaActual: string;
  alNavegar?: () => void;
}) {
  const activo = esRutaActiva(rutaActual, item.ruta);
  const Icono = item.icono;

  return (
    <Link
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
}
