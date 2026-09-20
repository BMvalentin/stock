import type { MovimientoReciente } from "@/servicios/dashboard/obtenerMovimientosRecientes";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import {
  ETIQUETAS_TIPO_MOVIMIENTO,
  TONOS_TIPO_MOVIMIENTO,
} from "@/constantes/tiposMovimiento";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";

export function ListaMovimientosRecientes({
  movimientos,
  locale,
}: {
  movimientos: MovimientoReciente[];
  locale: string;
}) {
  if (movimientos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin movimientos"
        descripcion="Los ingresos, egresos y ventas aparecerán acá."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {movimientos.map((movimiento) => (
        <li
          key={movimiento.id}
          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">
              {movimiento.producto}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {formatearFechaHora(movimiento.createdAt, locale)}
              {movimiento.usuario ? ` · ${movimiento.usuario}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Etiqueta tono={TONOS_TIPO_MOVIMIENTO[movimiento.tipo]}>
              {ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]}
            </Etiqueta>
            <span className="w-10 text-right text-sm font-medium text-zinc-900">
              {movimiento.cantidad}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
