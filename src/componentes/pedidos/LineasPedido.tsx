"use client";

import { Trash2 } from "lucide-react";
import type { LineaPedidoUI } from "@/tipos/pedidoFormulario";
import type { UnidadVenta } from "@/generated/prisma/enums";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { etiquetaModalidadLinea } from "@/lib/utilidades/etiquetaModalidadLinea";
import { sufijoPrecioModalidadLinea } from "@/lib/utilidades/sufijoPrecioModalidadLinea";
import { Boton } from "@/componentes/ui/Boton";

// Lista editable de líneas del pedido. El subtotal que se muestra es solo una
// ayuda visual; el servidor recalcula precios y totales al guardar. Un producto
// con venta suelta puede aparecer como bolsa y como suelto.
export function LineasPedido({
  lineas,
  metodoPagoId,
  moneda,
  locale,
  onCambiarCantidad,
  onCambiarModalidad,
  onQuitar,
}: {
  lineas: LineaPedidoUI[];
  metodoPagoId: string;
  moneda: string;
  locale: string;
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onCambiarModalidad: (id: string, modalidad: UnidadVenta) => void;
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
        const esSuelto = linea.modalidad !== linea.unidadVenta;
        const pesoLinea =
          linea.modalidad === "UNIDAD" ? linea.pesoPresentacionKg : null;
        const precios = esSuelto ? linea.preciosSuelto : linea.precios;
        const precio =
          precios.find((actual) => actual.metodoPagoId === metodoPagoId)
            ?.precio ?? null;
        const subtotal = precio === null ? null : precio * linea.cantidad;
        const porPeso = linea.modalidad === "KILOGRAMO";

        return (
          <li key={linea.id} className="rounded-lg border border-zinc-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {linea.nombre}
                </p>
                <p className="text-xs text-zinc-500">
                  {etiquetaModalidadLinea({
                    unidadVenta: linea.modalidad,
                    pesoPresentacionKg: pesoLinea,
                  })}
                  {linea.sku ? ` · SKU ${linea.sku}` : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  Precio:{" "}
                  {precio === null
                    ? "sin precio para el método elegido"
                    : `${formatearMoneda(precio, moneda, locale)} ${sufijoPrecioModalidadLinea(
                        {
                          unidadVenta: linea.modalidad,
                          pesoPresentacionKg: pesoLinea,
                        },
                      )}`}
                </p>
                <p className="text-xs text-zinc-400">
                  Stock:{" "}
                  {linea.permiteVentaSuelta
                    ? formatearStockPresentacion(
                        linea.stockActual,
                        linea.pesoPresentacionKg,
                        locale,
                      )
                    : formatearCantidad(
                        linea.stockActual,
                        linea.unidadVenta,
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

            {linea.permiteVentaSuelta ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Boton
                  tamano="sm"
                  variante={
                    linea.modalidad === "UNIDAD" ? "primario" : "secundario"
                  }
                  onClick={() => onCambiarModalidad(linea.id, "UNIDAD")}
                >
                  {linea.pesoPresentacionKg
                    ? `Bolsa ${linea.pesoPresentacionKg} kg`
                    : "Por bulto"}
                </Boton>
                <Boton
                  tamano="sm"
                  variante={
                    linea.modalidad === "KILOGRAMO" ? "primario" : "secundario"
                  }
                  onClick={() => onCambiarModalidad(linea.id, "KILOGRAMO")}
                >
                  Venta suelta / kg
                </Boton>
              </div>
            ) : null}

            <div className="mt-3 flex items-end justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <span>Cantidad</span>
                <input
                  type="number"
                  min={porPeso ? "0.001" : "1"}
                  step={porPeso ? "0.001" : "1"}
                  value={linea.cantidad}
                  onChange={(evento) =>
                    onCambiarCantidad(
                      linea.id,
                      Number(evento.target.value),
                    )
                  }
                  className="h-9 w-28 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  aria-label={`Cantidad de ${linea.nombre}`}
                />
                <span className="text-zinc-500">
                  {porPeso
                    ? "kg"
                    : linea.pesoPresentacionKg
                      ? "bolsas"
                      : "u."}
                </span>
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
