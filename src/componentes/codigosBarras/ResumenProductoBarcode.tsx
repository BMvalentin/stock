import Image from "next/image";
import Link from "next/link";
import { Eye, ImageOff } from "lucide-react";
import type { ProductoPorBarcode } from "@/servicios/productos/buscarProductoPorBarcode";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import { TAMANO_MINIATURA_PRODUCTO } from "@/constantes/imagenes";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { urlImagenCloudinary } from "@/lib/utilidades/urlImagenCloudinary";
import { Etiqueta } from "@/componentes/ui/Etiqueta";

// Resumen de un producto encontrado por código de barras. Presentación pura:
// imagen, nombre, categoría, stock, estado, precios y acceso al detalle.
export function ResumenProductoBarcode({
  producto,
  moneda,
  locale,
}: {
  producto: ProductoPorBarcode;
  moneda: string;
  locale: string;
}) {
  const estado = calcularEstadoStock(
    producto.stockActual,
    producto.stockMinimo,
  );

  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3">
      {producto.imageUrl ? (
        <Image
          src={urlImagenCloudinary(
            producto.imageUrl,
            TAMANO_MINIATURA_PRODUCTO.ancho,
            TAMANO_MINIATURA_PRODUCTO.alto,
          )}
          alt={producto.nombre}
          width={TAMANO_MINIATURA_PRODUCTO.ancho}
          height={TAMANO_MINIATURA_PRODUCTO.alto}
          className="h-12 w-12 shrink-0 rounded-md border border-zinc-200 object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300">
          <ImageOff className="h-4 w-4" strokeWidth={1.5} />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={`/productos/${producto.id}`}
          className="block truncate text-sm font-medium text-zinc-900 hover:underline"
        >
          {producto.nombre}
        </Link>
        <p className="truncate text-xs text-zinc-500">
          {producto.categoria} · SKU {producto.sku}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span>
            Stock: {producto.stockActual} · Mín: {producto.stockMinimo}
          </span>
          <Etiqueta tono={TONOS_ESTADO_STOCK[estado]}>
            {ETIQUETAS_ESTADO_STOCK[estado]}
          </Etiqueta>
          <Etiqueta tono={producto.activo ? "exito" : "neutral"}>
            {producto.activo ? "Activo" : "Inactivo"}
          </Etiqueta>
        </div>

        {producto.precios.length > 0 ? (
          <p className="truncate text-xs text-zinc-500">
            {producto.precios
              .map(
                (precio) =>
                  `${precio.metodo}: ${formatearMoneda(precio.precio, moneda, locale)}`,
              )
              .join(" · ")}
          </p>
        ) : null}

        <Link
          href={`/productos/${producto.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 transition-colors hover:text-zinc-900"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          Ver producto
        </Link>
      </div>
    </div>
  );
}
