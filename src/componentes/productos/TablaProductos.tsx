"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, ImageOff, Pencil, Power } from "lucide-react";
import type { ProductoListado } from "@/servicios/productos/listarProductos";
import { accionCambiarEstadoProducto } from "@/acciones/productos/accionCambiarEstadoProducto";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import { TAMANO_MINIATURA_PRODUCTO } from "@/constantes/imagenes";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { urlImagenCloudinary } from "@/lib/utilidades/urlImagenCloudinary";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Alerta } from "@/componentes/ui/Alerta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";

export function TablaProductos({
  productos,
  moneda,
  locale,
  esAdmin,
}: {
  productos: ProductoListado[];
  moneda: string;
  locale: string;
  esAdmin: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function alternarEstado(producto: ProductoListado) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoProducto(
        producto.id,
        !producto.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  if (productos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin productos"
        descripcion="No se encontraron productos con los filtros aplicados."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <TablaDatos
        columnas={[
          { encabezado: "Img" },
          { encabezado: "Producto" },
          { encabezado: "Categoría" },
          { encabezado: "Precios" },
          { encabezado: "Stock", alineacion: "centro" },
          { encabezado: "Estado" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={productos.map((producto) => {
          const estado = calcularEstadoStock(
            producto.stockActual,
            producto.stockMinimo,
          );
          const modalidadBase = producto.modalidades.find(
            (modalidad) => modalidad.esBase,
          );
          const esPeso = producto.unidadStock === "KILOGRAMO";

          return {
            id: producto.id,
            celdas: [
              producto.imageUrl ? (
                <Image
                  key="imagen"
                  src={urlImagenCloudinary(
                    producto.imageUrl,
                    TAMANO_MINIATURA_PRODUCTO.ancho,
                    TAMANO_MINIATURA_PRODUCTO.alto,
                  )}
                  alt={producto.nombre}
                  width={TAMANO_MINIATURA_PRODUCTO.ancho}
                  height={TAMANO_MINIATURA_PRODUCTO.alto}
                  className="h-10 w-10 rounded-md border border-zinc-200 object-cover"
                />
              ) : (
                <div
                  key="imagen"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300"
                  aria-hidden
                >
                  <ImageOff className="h-4 w-4" strokeWidth={1.5} />
                </div>
              ),
              <div key="producto" className="min-w-0">
                <Link
                  href={`/admin/productos/${producto.id}`}
                  className="truncate text-sm font-medium text-zinc-900 hover:underline"
                >
                  {producto.nombre}
                </Link>
                <p className="truncate text-xs text-zinc-500">{producto.sku}</p>
                {producto.modalidades.length > 1 ? (
                  <Etiqueta tono="info">
                    {producto.modalidades.length} modalidades
                  </Etiqueta>
                ) : null}
              </div>,
              <span key="categoria" className="text-sm text-zinc-600">
                {producto.categoria}
              </span>,
              <div key="precios" className="space-y-0.5">
                {producto.modalidades.length === 0 ? (
                  <span className="text-xs text-zinc-400">Sin precios</span>
                ) : (
                  producto.modalidades.map((modalidad) => (
                    <p
                      key={modalidad.modalidadId}
                      className="whitespace-nowrap text-xs text-zinc-600"
                    >
                      <span className="text-zinc-400">
                        {modalidad.nombre}:
                      </span>{" "}
                      {modalidad.precio === null
                        ? "sin precio"
                        : formatearMoneda(modalidad.precio, moneda, locale)}
                      {modalidad.unidadVenta === "KILOGRAMO" ? " / kg" : ""}
                    </p>
                  ))
                )}
              </div>,
              <div key="stock" className="space-y-1">
                <p className="text-sm font-medium text-zinc-900">
                  {esPeso
                    ? formatearStockPresentacion(
                        producto.stockActual,
                        modalidadBase?.contenido ?? null,
                      )
                    : producto.stockActual}
                </p>
                <Etiqueta tono={TONOS_ESTADO_STOCK[estado]}>
                  {ETIQUETAS_ESTADO_STOCK[estado]}
                </Etiqueta>
              </div>,
              <Etiqueta
                key="estado"
                tono={producto.activo ? "exito" : "neutral"}
              >
                {producto.activo ? "Activo" : "Inactivo"}
              </Etiqueta>,
              <div key="acciones" className="flex justify-end">
                <MenuAcciones
                  items={[
                    {
                      etiqueta: "Ver detalle",
                      icono: <Eye className="h-4 w-4" strokeWidth={1.75} />,
                      href: `/admin/productos/${producto.id}`,
                    },
                    ...(esAdmin
                      ? [
                          {
                            etiqueta: "Editar",
                            icono: (
                              <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            ),
                            href: `/admin/productos/${producto.id}/editar`,
                          },
                          {
                            etiqueta: producto.activo
                              ? "Desactivar"
                              : "Reactivar",
                            icono: (
                              <Power className="h-4 w-4" strokeWidth={1.75} />
                            ),
                            peligro: producto.activo,
                            accion: () => alternarEstado(producto),
                            confirmacion: producto.activo
                              ? {
                                  titulo: "Desactivar producto",
                                  descripcion: `¿Desactivar "${producto.nombre}"? No se elimina del historial.`,
                                  textoConfirmar: "Desactivar",
                                }
                              : undefined,
                          },
                        ]
                      : []),
                  ]}
                />
              </div>,
            ],
          };
        })}
      />
    </div>
  );
}
