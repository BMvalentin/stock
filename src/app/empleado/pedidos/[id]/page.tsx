import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { obtenerPedido } from "@/servicios/pedidos/obtenerPedido";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  TONOS_ESTADO_PEDIDO,
} from "@/constantes/estadosPedido";
import {
  ETIQUETAS_ESTADO_PAGO,
  TONOS_ESTADO_PAGO,
} from "@/constantes/estadosPago";
import { formatearFechaHoraCompacta } from "@/lib/utilidades/formatearFechaHoraCompacta";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Dato } from "@/componentes/ui/Dato";
import { ProductosPedido } from "@/componentes/pedidos/ProductosPedido";
import { PagosPedido } from "@/componentes/pedidos/PagosPedido";
import { TotalesPedido } from "@/componentes/pedidos/TotalesPedido";
import { BotonAbrirMapa } from "@/componentes/pedidos/BotonAbrirMapa";

export const metadata = { title: "Detalle de pedido" };

export default async function PaginaDetallePedidoEmpleado({
  params,
}: PageProps<"/empleado/pedidos/[id]">) {
  await requerirEmpleado();
  const { id } = await params;

  const [pedido, configuracion] = await Promise.all([
    obtenerPedido(id, { incluirObservaciones: false }),
    obtenerConfiguracionGeneral(),
  ]);

  if (!pedido) notFound();

  const { moneda, locale } = configuracion;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Pedido #${pedido.numero}`}
        descripcion={formatearFechaHoraCompacta(pedido.createdAt, locale)}
        acciones={
          <EnlaceBoton href="/empleado/pedidos" variante="secundario">
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
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Tarjeta className="p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Productos</h2>
            <div className="mt-3">
              <ProductosPedido
                detalles={pedido.detalles}
                moneda={moneda}
                locale={locale}
              />
            </div>

            <TotalesPedido
              subtotal={pedido.subtotal}
              costoEnvio={pedido.costoEnvio}
              total={pedido.total}
              moneda={moneda}
              locale={locale}
            />
          </Tarjeta>

          <Tarjeta className="p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Historial de pagos
            </h2>
            <PagosPedido
              pagos={pedido.pagos}
              moneda={moneda}
              locale={locale}
            />
          </Tarjeta>
        </div>

        <div className="min-w-0 space-y-6">
          <Tarjeta className="p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Cliente</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Dato etiqueta="Nombre" valor={pedido.clienteNombre} />
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-400">
                  Teléfono
                </dt>
                <dd className="break-words">
                  <a
                    href={`tel:${pedido.clienteTelefono}`}
                    className="inline-flex items-center gap-1 text-zinc-800 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    {pedido.clienteTelefono}
                  </a>
                </dd>
              </div>
            </dl>
          </Tarjeta>

          <Tarjeta className="p-4 sm:p-5">
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
        </div>
      </div>
    </div>
  );
}
