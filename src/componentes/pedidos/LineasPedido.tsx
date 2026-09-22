"use client";

import { Trash2 } from "lucide-react";
import type {
  LineaPedidoUI,
  ResumenPedidoCalculado,
} from "@/tipos/pedidoFormulario";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import { Boton } from "@/componentes/ui/Boton";

// Lista editable de líneas del pedido. El precio y el subtotal los calcula el
// servidor (`resumen`); acá solo se muestran. Cada modalidad es una línea.
export function LineasPedido({
  lineas,
  resumen,
  moneda,
  locale,
  onCambiarCantidad,
  onQuitar,
}: {
  lineas: LineaPedidoUI[];
  resumen: ResumenPedidoCalculado | null;
  moneda: string;
  locale: string;
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onQuitar: (id: string) => void;
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
        const calculada = resumen?.lineas.find(
          (actual) =>
            actual.productoId === linea.productoId &&
            actual.modalidadId === linea.modalidadId,
        );
        const porPeso = linea.unidadVenta === "KILOGRAMO";

        return (
          <li key={linea.id} className="rounded-lg border border-zinc-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {linea.nombre}
                </p>
                <p className="text-xs text-zinc-500">
                  {linea.modalidadNombre}
                  {linea.sku ? ` · SKU ${linea.sku}` : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  Precio:{" "}
                  {calculada
                    ? `${formatearMoneda(
                        calculada.precioUnitario,
                        moneda,
                        locale,
                      )}${porPeso ? " / kg" : " c/u"}`
                    : "—"}
                </p>
                <p className="text-xs text-zinc-400">
                  Stock:{" "}
                  {formatearCantidad(
                    linea.stockActual,
                    linea.unidadStock,
                    locale,
                  )}
                </p>
              </div>

              <Boton
                variante="fantasma"
                tamano="sm"
                onClick={() => onQuitar(linea.id)}
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
                  min={porPeso ? "0.001" : "1"}
                  step={porPeso ? "0.001" : "1"}
                  value={linea.cantidad}
                  onChange={(evento) =>
                    onCambiarCantidad(linea.id, Number(evento.target.value))
                  }
                  className="h-9 w-28 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  aria-label={`Cantidad de ${linea.nombre}`}
                />
                <span className="text-zinc-500">
                  {porPeso ? "kg" : "u."}
                </span>
              </label>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Subtotal
                </p>
                <p className="text-sm font-medium text-zinc-900">
                  {calculada
                    ? formatearMoneda(calculada.subtotal, moneda, locale)
                    : "—"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
