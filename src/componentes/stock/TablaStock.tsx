"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import type { ProductoStock } from "@/servicios/stock/listarStock";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { BotonMovimiento } from "@/componentes/stock/BotonMovimiento";

export function TablaStock({
  productos,
  productosOpciones,
  locale,
  esAdmin,
}: {
  productos: ProductoStock[];
  productosOpciones: OpcionCampo[];
  locale: string;
  esAdmin: boolean;
}) {
  if (productos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin productos"
        descripcion="No se encontraron productos con los filtros aplicados."
      />
    );
  }

  return (
    <TablaDatos
      columnas={[
        { encabezado: "Producto" },
        { encabezado: "Categoría" },
        { encabezado: "Stock actual", alineacion: "centro" },
        { encabezado: "Stock mínimo", alineacion: "centro" },
        { encabezado: "Estado" },
        { encabezado: "Actualizado" },
        { encabezado: "", alineacion: "der" },
      ]}
      filas={productos.map((producto) => {
        const estado = calcularEstadoStock(
          producto.stockActual,
          producto.stockMinimo,
        );

        return {
          id: producto.id,
          celdas: [
            <div key="producto" className="min-w-0">
              <Link
                href={`/admin/productos/${producto.id}`}
                className="truncate text-sm font-medium text-zinc-900 hover:underline"
              >
                {producto.nombre}
              </Link>
              <p className="truncate text-xs text-zinc-500">{producto.sku}</p>
            </div>,
            <span key="categoria" className="text-sm text-zinc-600">
              {producto.categoria}
            </span>,
            <span key="actual" className="text-sm font-medium text-zinc-900">
              {producto.permiteVentaSuelta
                ? formatearStockPresentacion(
                    producto.stockActual,
                    producto.pesoPresentacionKg,
                  )
                : producto.stockActual}
            </span>,
            <span key="minimo" className="text-sm text-zinc-500">
              {producto.permiteVentaSuelta
                ? `${producto.stockMinimo} kg`
                : producto.stockMinimo}
            </span>,
            <Etiqueta key="estado" tono={TONOS_ESTADO_STOCK[estado]}>
              {ETIQUETAS_ESTADO_STOCK[estado]}
            </Etiqueta>,
            <span key="fecha" className="whitespace-nowrap text-xs text-zinc-500">
              {formatearFechaHora(producto.actualizado, locale)}
            </span>,
            <div key="acciones" className="flex justify-end">
              {esAdmin ? (
                <BotonMovimiento
                  productos={productosOpciones}
                  productoInicialId={producto.id}
                  etiqueta="Movimiento"
                  variante="secundario"
                  tamano="sm"
                  icono={
                    <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  }
                />
              ) : (
                <span className="text-xs text-zinc-400">Solo lectura</span>
              )}
            </div>,
          ],
        };
      })}
    />
  );
}
