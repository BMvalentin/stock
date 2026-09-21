import Link from "next/link";
import type { ProductoCritico } from "@/servicios/dashboard/obtenerProductosCriticos";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";

export function ListaStockCritico({
  productos,
}: {
  productos: ProductoCritico[];
}) {
  if (productos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin productos críticos"
        descripcion="Todos los productos activos tienen stock suficiente."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {productos.map((producto) => {
        const estado = calcularEstadoStock(
          producto.stockActual,
          producto.stockMinimo,
        );

        return (
          <li key={producto.id}>
            <Link
              href={`/admin/productos/${producto.id}`}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {producto.nombre}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {producto.categoria}
                  {producto.sku ? ` · ${producto.sku}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {producto.stockActual}/{producto.stockMinimo}
                </span>
                <Etiqueta tono={TONOS_ESTADO_STOCK[estado]}>
                  {ETIQUETAS_ESTADO_STOCK[estado]}
                </Etiqueta>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
