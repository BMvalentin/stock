import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerCliente } from "@/servicios/clientes/obtenerCliente";
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
import { formatearFecha } from "@/lib/utilidades/formatearFecha";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Dato } from "@/componentes/ui/Dato";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";

export const metadata = { title: "Detalle de cliente" };

export default async function PaginaDetalleCliente({
  params,
}: PageProps<"/clientes/[id]">) {
  await requerirAdmin();
  const { id } = await params;

  const [cliente, configuracion] = await Promise.all([
    obtenerCliente(id),
    obtenerConfiguracionGeneral(),
  ]);

  if (!cliente) notFound();

  const { moneda, locale } = configuracion;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={cliente.nombre}
        descripcion={`Cliente desde ${formatearFecha(cliente.createdAt, locale)}`}
        acciones={
          <EnlaceBoton href="/clientes" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Datos</h2>
            <Etiqueta tono={cliente.activo ? "exito" : "neutral"}>
              {cliente.activo ? "Activo" : "Inactivo"}
            </Etiqueta>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <Dato etiqueta="Teléfono" valor={cliente.telefono} />
            <Dato etiqueta="Correo" valor={cliente.email} />
            <Dato etiqueta="Dirección" valor={cliente.direccion} />
            <Dato etiqueta="Localidad" valor={cliente.localidad} />
            <Dato etiqueta="Código postal" valor={cliente.codigoPostal} />
            <Dato etiqueta="Observaciones" valor={cliente.observaciones} />
          </dl>
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Total comprado
            </p>
            <p className="text-lg font-semibold text-zinc-900">
              {formatearMoneda(cliente.totalComprado, moneda, locale)}
            </p>
          </div>
        </Tarjeta>

        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">Pedidos</h2>
          {cliente.pedidos.length === 0 ? (
            <EstadoVacio
              titulo="Sin pedidos"
              descripcion="Este cliente todavía no realizó pedidos."
            />
          ) : (
            <TablaDatos
              columnas={[
                { encabezado: "Pedido" },
                { encabezado: "Fecha" },
                { encabezado: "Estado" },
                { encabezado: "Pago" },
                { encabezado: "Total", alineacion: "der" },
              ]}
              filas={cliente.pedidos.map((pedido) => ({
                id: pedido.id,
                celdas: [
                  <Link
                    key="numero"
                    href={`/pedidos/${pedido.id}`}
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    #{pedido.numero}
                  </Link>,
                  <span
                    key="fecha"
                    className="whitespace-nowrap text-xs text-zinc-500"
                  >
                    {formatearFecha(pedido.createdAt, locale)}
                  </span>,
                  <Etiqueta
                    key="estado"
                    tono={TONOS_ESTADO_PEDIDO[pedido.estado]}
                  >
                    {ETIQUETAS_ESTADO_PEDIDO[pedido.estado]}
                  </Etiqueta>,
                  <Etiqueta
                    key="pago"
                    tono={TONOS_ESTADO_PAGO[pedido.estadoPago]}
                  >
                    {ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]}
                  </Etiqueta>,
                  <span key="total" className="font-medium text-zinc-900">
                    {formatearMoneda(pedido.total, moneda, locale)}
                  </span>,
                ],
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
