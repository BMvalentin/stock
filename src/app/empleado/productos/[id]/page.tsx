import { notFound } from "next/navigation";
import Image from "next/image";
import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { obtenerProducto } from "@/servicios/productos/obtenerProducto";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { calcularEstadoStock } from "@/servicios/stock/calcularEstadoStock";
import {
  ETIQUETAS_ESTADO_STOCK,
  TONOS_ESTADO_STOCK,
} from "@/constantes/estadoStock";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { urlImagenCloudinary } from "@/lib/utilidades/urlImagenCloudinary";
import { TAMANO_DETALLE_PRODUCTO } from "@/constantes/imagenes";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Dato } from "@/componentes/ui/Dato";

export const metadata = { title: "Detalle de producto" };

function describirRegla(
  regla: {
    tipoPrecio: "UNITARIO" | "TOTAL" | "PRESENTACION";
    cantidadDesde: number;
    cantidadHasta: number | null;
    precio: number;
    metodoPagoNombre: string | null;
  },
  unidad: string,
  moneda: string,
  locale: string,
): string {
  const metodo = regla.metodoPagoNombre ? ` · ${regla.metodoPagoNombre}` : "";

  if (regla.tipoPrecio !== "UNITARIO") {
    return `${regla.cantidadDesde} ${unidad} por ${formatearMoneda(
      regla.precio,
      moneda,
      locale,
    )}${metodo}`;
  }

  const rango =
    regla.cantidadHasta === null
      ? `${regla.cantidadDesde}+`
      : `${regla.cantidadDesde}–${regla.cantidadHasta}`;

  return `${rango} ${unidad}: ${formatearMoneda(
    regla.precio,
    moneda,
    locale,
  )} c/u${metodo}`;
}

export default async function PaginaDetalleProductoEmpleado({
  params,
}: PageProps<"/empleado/productos/[id]">) {
  await requerirEmpleado();
  const { id } = await params;

  const [producto, configuracion] = await Promise.all([
    obtenerProducto(id),
    obtenerConfiguracionGeneral(),
  ]);

  if (!producto) notFound();

  const { moneda, locale } = configuracion;
  const estado = calcularEstadoStock(
    producto.stockActual,
    producto.stockMinimo,
  );
  const modalidadBase = producto.modalidades.find(
    (modalidad) => modalidad.esBase,
  );
  const esPeso = producto.unidadStock === "KILOGRAMO";

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={producto.nombre}
        descripcion={
          producto.sku
            ? `SKU ${producto.sku} · ${producto.categoria}`
            : producto.categoria
        }
        acciones={
          <EnlaceBoton href="/empleado/productos" variante="secundario">
            Volver
          </EnlaceBoton>
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
              etiqueta="Unidad de stock"
              valor={esPeso ? "Kilogramos" : "Unidades"}
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
                  {esPeso
                    ? formatearStockPresentacion(
                        producto.stockActual,
                        modalidadBase?.contenido ?? null,
                        locale,
                      )
                    : producto.stockActual}
                </p>
                <p className="text-xs text-zinc-500">
                  Mínimo: {producto.stockMinimo}
                  {esPeso ? " kg" : ""}
                </p>
              </div>
              <Etiqueta tono={TONOS_ESTADO_STOCK[estado]}>
                {ETIQUETAS_ESTADO_STOCK[estado]}
              </Etiqueta>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Modalidades y precios
          </h2>
          {producto.modalidades.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Sin modalidades cargadas.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {producto.modalidades.map((modalidad) => {
                const unidad =
                  modalidad.unidadVenta === "KILOGRAMO" ? "kg" : "u.";

                return (
                  <div key={modalidad.id}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {modalidad.nombre}
                      </p>
                      {modalidad.esBase ? (
                        <Etiqueta tono="info">Principal</Etiqueta>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {modalidad.unidadVenta === "KILOGRAMO"
                        ? "Por kg"
                        : "Por unidad"}
                      {modalidad.etiquetaPresentacion
                        ? ` · ${modalidad.etiquetaPresentacion}`
                        : ""}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {modalidad.reglas.length === 0 ? (
                        <li className="text-xs text-zinc-400">Sin precios.</li>
                      ) : (
                        modalidad.reglas.map((regla) => (
                          <li
                            key={regla.id}
                            className="text-xs text-zinc-600"
                          >
                            {describirRegla(regla, unidad, moneda, locale)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
