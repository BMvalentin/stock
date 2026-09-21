"use client";

import { Trash2 } from "lucide-react";
import type { LineaPedidoUI } from "@/tipos/pedidoFormulario";
import {
  ETIQUETAS_UNIDAD_VENTA,
  SUFIJOS_PRECIO_UNIDAD_VENTA,
} from "@/constantes/unidadesVenta";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import { Boton } from "@/componentes/ui/Boton";

// Lista editable de líneas del pedido. El subtotal que se muestra es solo una
// ayuda visual; el servidor recalcula precios y totales al guardar.
export function LineasPedido({
  lineas,
  metodoPagoId,
  moneda,
  locale,
  onCambiarCantidad,
  onQuitar,
}: {
  lineas: LineaPedidoUI[];
  metodoPagoId: string;
  moneda: string;
  locale: string;
  onCambiarCantidad: (productoId: string, cantidad: number) => void;
  onQuitar: (productoId: string) => void;
}) {
  if (lineas.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Todavía no agregaste productos. Buscá por nombre, SKU o código de
        barras.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {lineas.map((linea) => {
        const esPeso = linea.unidadVenta === "KILOGRAMO";
        const precio =
          linea.precios.find((actual) => actual.metodoPagoId === metodoPagoId)
            ?.precio ?? null;
        const subtotal = precio === null ? null : precio * linea.cantidad;

        return (
          <li
            key={linea.productoId}
            className="rounded-lg border border-zinc-200 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {linea.nombre}
                </p>
                <p className="text-xs text-zinc-500">
                  {ETIQUETAS_UNIDAD_VENTA[linea.unidadVenta]} · SKU {linea.sku}
                </p>
                <p className="text-xs text-zinc-500">
                  Precio:{" "}
                  {precio === null
                    ? "sin precio para el método elegido"
                    : `${formatearMoneda(precio, moneda, locale)} ${
                        SUFIJOS_PRECIO_UNIDAD_VENTA[linea.unidadVenta]
                      }`}
                </p>
                <p className="text-xs text-zinc-400">
                  Stock: {formatearCantidad(linea.stockActual, linea.unidadVenta, locale)}
                </p>
              </div>

              <Boton
                variante="fantasma"
                tamano="sm"
                onClick={() => onQuitar(linea.productoId)}
                aria-label={`Quitar ${linea.nombre}`}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Boton>
            </div>

            <div className="mt-3 flex items-end justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <span>Cantidad</span>
                <input
                  type="number"
                  min={esPeso ? "0.001" : "1"}
                  step={esPeso ? "0.001" : "1"}
                  value={linea.cantidad}
                  onChange={(evento) =>
                    onCambiarCantidad(
                      linea.productoId,
                      Number(evento.target.value),
                    )
                  }
                  className="h-9 w-28 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  aria-label={`Cantidad de ${linea.nombre}`}
                />
                <span className="text-zinc-500">{esPeso ? "kg" : "u."}</span>
              </label>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Subtotal
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {subtotal === null
                    ? "—"
                    : formatearMoneda(subtotal, moneda, locale)}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
