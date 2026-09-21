import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone } from "lucide-react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { obtenerPedido } from "@/servicios/pedidos/obtenerPedido";
import { estadosSiguientesPedido } from "@/servicios/pedidos/estadosSiguientesPedido";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  TONOS_ESTADO_PEDIDO,
} from "@/constantes/estadosPedido";
import {
  ETIQUETAS_ESTADO_PAGO,
  TONOS_ESTADO_PAGO,
} from "@/constantes/estadosPago";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { SUFIJOS_PRECIO_UNIDAD_VENTA } from "@/constantes/unidadesVenta";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Dato } from "@/componentes/ui/Dato";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { AccionesEstadoPedido } from "@/componentes/pedidos/AccionesEstadoPedido";
import { AccionesPago } from "@/componentes/pedidos/AccionesPago";
import { BotonAbrirMapa } from "@/componentes/pedidos/BotonAbrirMapa";

export const metadata = { title: "Detalle de pedido" };

export default async function PaginaDetallePedido({
  params,
}: PageProps<"/admin/pedidos/[id]">) {
  const usuario = await requerirSesion();
  const { id } = await params;
  const esAdmin = usuario.rol === "ADMIN";

  const [pedido, configuracion] = await Promise.all([
    obtenerPedido(id),
    obtenerConfiguracionGeneral(),
  ]);

  if (!pedido) notFound();

  const { moneda, locale } = configuracion;
  const siguientes = estadosSiguientesPedido(pedido.estado);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Pedido #${pedido.numero}`}
        descripcion={formatearFechaHora(pedido.createdAt, locale)}
        acciones={
          <EnlaceBoton href="/admin/pedidos" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta tono={TONOS_ESTADO_PEDIDO[pedido.estado]}>
          {ETIQUETAS_ESTADO_PEDIDO[pedido.estado]}
        </Etiqueta>
        <Etiqueta tono={TONOS_ESTADO_PAGO[pedido.estadoPago]}>
          Pago: {ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]}
        </Etiqueta>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Productos</h2>
            <div className="mt-3">
              <TablaDatos
                columnas={[
                  { encabezado: "Producto" },
                  { encabezado: "Precio unitario", alineacion: "der" },
                  { encabezado: "Cantidad", alineacion: "der" },
                  { encabezado: "Subtotal", alineacion: "der" },
                ]}
                filas={pedido.detalles.map((detalle) => ({
                  id: detalle.id,
                  celdas: [
                    <Link
                      key="nombre"
                      href={`/admin/productos/${detalle.productoId}`}
                      className="text-sm text-zinc-800 hover:underline"
                    >
                      {detalle.nombreProducto}
                    </Link>,
                    <span key="precio" className="whitespace-nowrap">
                      {formatearMoneda(detalle.precioUnitario, moneda, locale)}{" "}
                      {SUFIJOS_PRECIO_UNIDAD_VENTA[detalle.unidadVenta]}
                    </span>,
                    <span key="cantidad" className="whitespace-nowrap">
                      {formatearCantidad(
                        detalle.cantidad,
                        detalle.unidadVenta,
                        locale,
                      )}
                    </span>,
                    <span key="subtotal" className="font-medium text-zinc-900">
                      {formatearMoneda(detalle.subtotal, moneda, locale)}
                    </span>,
                  ],
                }))}
              />
            </div>

            <dl className="mt-4 ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="text-zinc-800">
                  {formatearMoneda(pedido.subtotal, moneda, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Envío</dt>
                <dd className="text-zinc-800">
                  {formatearMoneda(pedido.costoEnvio, moneda, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2">
                <dt className="font-medium text-zinc-900">Total</dt>
                <dd className="font-semibold text-zinc-900">
                  {formatearMoneda(pedido.total, moneda, locale)}
                </dd>
              </div>
            </dl>
          </Tarjeta>

          <Tarjeta className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Historial de pagos
            </h2>
            {pedido.pagos.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Todavía no hay pagos registrados.
              </p>
            ) : (
              <div className="mt-3">
                <TablaDatos
                  columnas={[
                    { encabezado: "Fecha" },
                    { encabezado: "Monto", alineacion: "der" },
                    { encabezado: "Estado" },
                    { encabezado: "Usuario" },
                    { encabezado: "Observación" },
                  ]}
                  filas={pedido.pagos.map((pago) => ({
                    id: pago.id,
                    celdas: [
                      <span
                        key="fecha"
                        className="whitespace-nowrap text-xs text-zinc-500"
                      >
                        {formatearFechaHora(pago.createdAt, locale)}
                      </span>,
                      <span key="monto">
                        {formatearMoneda(pago.monto, moneda, locale)}
                      </span>,
                      <Etiqueta key="estado" tono={TONOS_ESTADO_PAGO[pago.estado]}>
                        {ETIQUETAS_ESTADO_PAGO[pago.estado]}
                      </Etiqueta>,
                      <span key="usuario" className="text-zinc-600">
                        {pago.usuario ?? "—"}
                      </span>,
                      <span key="obs" className="text-zinc-500">
                        {pago.observacion ?? "—"}
                      </span>,
                    ],
                  }))}
                />
              </div>
            )}
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Cliente</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Dato etiqueta="Nombre" valor={pedido.clienteNombre} />
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-400">
                  Teléfono
                </dt>
                <dd>
                  <a
                    href={`tel:${pedido.clienteTelefono}`}
                    className="inline-flex items-center gap-1 text-zinc-800 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {pedido.clienteTelefono}
                  </a>
                </dd>
              </div>
            </dl>
          </Tarjeta>

          <Tarjeta className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Entrega</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Dato
                etiqueta="Tipo"
                valor={
                  pedido.tipoEntrega === "RETIRO"
                    ? "Retiro en el local"
                    : "Envío a domicilio"
                }
              />
              <Dato
                etiqueta="Dirección"
                valor={pedido.clienteDireccion ?? pedido.direccionEntrega}
              />
              <Dato etiqueta="Localidad" valor={pedido.clienteLocalidad} />
              <Dato etiqueta="Referencia" valor={pedido.referenciaEntrega} />
              <Dato etiqueta="Método de pago" valor={pedido.metodoPago} />
              <Dato etiqueta="Registrado por" valor={pedido.vendedor} />
              {esAdmin ? (
                <Dato etiqueta="Observaciones" valor={pedido.observaciones} />
              ) : null}
            </dl>
            {pedido.tipoEntrega === "ENVIO_DOMICILIO" || pedido.mapsUrl ? (
              <div className="mt-4">
                <BotonAbrirMapa
                  mapsUrl={pedido.mapsUrl}
                  direccion={pedido.clienteDireccion ?? pedido.direccionEntrega}
                  localidad={pedido.clienteLocalidad}
                />
              </div>
            ) : null}
          </Tarjeta>

          {esAdmin ? (
            <>
              <Tarjeta className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                  Estado del pedido
                </h2>
                <AccionesEstadoPedido
                  pedidoId={pedido.id}
                  siguientes={siguientes}
                />
              </Tarjeta>

              <Tarjeta className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                  Estado del pago
                </h2>
                <AccionesPago
                  pedidoId={pedido.id}
                  estadoPago={pedido.estadoPago}
                />
              </Tarjeta>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
