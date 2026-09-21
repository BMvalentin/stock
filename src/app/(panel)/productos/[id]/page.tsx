import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { obtenerProducto } from "@/servicios/productos/obtenerProducto";
import { obtenerMovimientosProducto } from "@/servicios/productos/obtenerMovimientosProducto";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import {
  ETIQUETAS_TIPO_MOVIMIENTO,
  TONOS_TIPO_MOVIMIENTO,
} from "@/constantes/tiposMovimiento";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { urlImagenCloudinary } from "@/lib/utilidades/urlImagenCloudinary";
import { TAMANO_DETALLE_PRODUCTO } from "@/constantes/imagenes";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Dato } from "@/componentes/ui/Dato";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { BotonEstadoProducto } from "@/componentes/productos/BotonEstadoProducto";

export const metadata = { title: "Detalle de producto" };

export default async function PaginaDetalleProducto({
  params,
}: PageProps<"/productos/[id]">) {
  const usuario = await requerirSesion();
  const { id } = await params;
  const esAdmin = usuario.rol === "ADMIN";

  const [producto, movimientos, configuracion] = await Promise.all([
    obtenerProducto(id),
    obtenerMovimientosProducto(id),
    obtenerConfiguracionGeneral(),
  ]);

  if (!producto) notFound();

  const estado = calcularEstadoStock(
    producto.stockActual,
    producto.stockMinimo,
  );

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={producto.nombre}
        descripcion={`SKU ${producto.sku} · ${producto.categoria}`}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            <EnlaceBoton href="/productos" variante="secundario">
              Volver
            </EnlaceBoton>
            {esAdmin ? (
              <>
                <EnlaceBoton
                  href={`/productos/${producto.id}/editar`}
                  variante="secundario"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  Editar
                </EnlaceBoton>
                <BotonEstadoProducto
                  id={producto.id}
                  activo={producto.activo}
                />
              </>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Producto</h2>
            <Etiqueta tono={producto.activo ? "exito" : "neutral"}>
              {producto.activo ? "Activo" : "Inactivo"}
            </Etiqueta>
          </div>
          {producto.imageUrl ? (
            <Image
              src={urlImagenCloudinary(
                producto.imageUrl,
                TAMANO_DETALLE_PRODUCTO.ancho,
                TAMANO_DETALLE_PRODUCTO.alto,
              )}
              alt={`Imagen de ${producto.nombre}`}
              width={TAMANO_DETALLE_PRODUCTO.ancho}
              height={TAMANO_DETALLE_PRODUCTO.alto}
              className="mt-4 h-40 w-40 rounded-md border border-zinc-200 object-cover"
            />
          ) : null}
          <dl className="mt-4 space-y-3 text-sm">
            <Dato etiqueta="Categoría" valor={producto.categoria} />
            <Dato etiqueta="SKU" valor={producto.sku} />
            <Dato etiqueta="Código de barras" valor={producto.barcode} />
            <Dato
              etiqueta="Unidades por bulto"
              valor={producto.unidadesPorBulto}
            />
            <Dato etiqueta="Descripción" valor={producto.descripcion} />
          </dl>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Stock</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-zinc-900">
                  {producto.stockActual}
                </p>
                <p className="text-xs text-zinc-500">
                  Mínimo: {producto.stockMinimo}
                </p>
              </div>
              <Etiqueta tono={TONOS_ESTADO_STOCK[estado]}>
                {ETIQUETAS_ESTADO_STOCK[estado]}
              </Etiqueta>
            </div>
            {esAdmin ? (
              <EnlaceBoton
                href={`/stock?producto=${producto.id}`}
                variante="secundario"
              >
                Registrar movimiento
              </EnlaceBoton>
            ) : null}
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Precios</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {producto.precios.length === 0 ? (
              <p className="text-zinc-500">Sin precios cargados.</p>
            ) : (
              producto.precios.map((precio) => (
                <div
                  key={precio.metodoPagoId}
                  className="flex items-center justify-between"
                >
                  <dt className="text-zinc-500">{precio.metodo}</dt>
                  <dd className="font-medium text-zinc-900">
                    {formatearMoneda(
                      precio.precio,
                      configuracion.moneda,
                      configuracion.locale,
                    )}
                  </dd>
                </div>
              ))
            )}
          </dl>
        </Tarjeta>
      </div>

      <Tarjeta className="p-5">
        <h2 className="text-sm font-semibold text-zinc-900">
          Proveedores asociados
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {producto.proveedores.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin proveedores asociados.</p>
          ) : (
            producto.proveedores.map((proveedor) => (
              <Link
                key={proveedor.id}
                href={`/proveedores/${proveedor.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                {proveedor.nombre}
                {proveedor.esPrincipal ? (
                  <Etiqueta tono="info">Principal</Etiqueta>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </Tarjeta>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Movimientos recientes
        </h2>
        {movimientos.length === 0 ? (
          <EstadoVacio
            titulo="Sin movimientos"
            descripcion="Este producto todavía no tiene movimientos de stock."
          />
        ) : (
          <TablaDatos
            columnas={[
              { encabezado: "Fecha" },
              { encabezado: "Tipo" },
              { encabezado: "Cantidad", alineacion: "der" },
              { encabezado: "Stock", alineacion: "der" },
              { encabezado: "Usuario" },
              { encabezado: "Motivo" },
            ]}
            filas={movimientos.map((movimiento) => ({
              id: movimiento.id,
              celdas: [
                <span key="fecha" className="whitespace-nowrap text-xs text-zinc-500">
                  {formatearFechaHora(
                    movimiento.createdAt,
                    configuracion.locale,
                  )}
                </span>,
                <Etiqueta
                  key="tipo"
                  tono={TONOS_TIPO_MOVIMIENTO[movimiento.tipo]}
                >
                  {ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]}
                </Etiqueta>,
                <span key="cantidad" className="font-medium text-zinc-900">
                  {movimiento.cantidad}
                </span>,
                <span key="stock" className="text-xs text-zinc-500">
                  {movimiento.stockAnterior} → {movimiento.stockPosterior}
                </span>,
                <span key="usuario" className="text-zinc-600">
                  {movimiento.usuario ?? "—"}
                </span>,
                <span key="motivo" className="text-zinc-500">
                  {movimiento.motivo ?? "—"}
                </span>,
              ],
            }))}
          />
        )}
      </div>
    </div>
  );
}
