import Link from "next/link";
import type { PedidoListado } from "@/servicios/pedidos/listarPedidos";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  TONOS_ESTADO_PEDIDO,
} from "@/constantes/estadosPedido";
import {
  ETIQUETAS_ESTADO_PAGO,
  TONOS_ESTADO_PAGO,
} from "@/constantes/estadosPago";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { Etiqueta } from "@/componentes/ui/Etiqueta";

export function TablaPedidos({
  pedidos,
  moneda,
  locale,
}: {
  pedidos: PedidoListado[];
  moneda: string;
  locale: string;
}) {
  return (
    <TablaDatos
      columnas={[
        { encabezado: "Pedido" },
        { encabezado: "Cliente" },
        { encabezado: "Localidad" },
        { encabezado: "Fecha" },
        { encabezado: "Entrega" },
        { encabezado: "Pago" },
        { encabezado: "Estado" },
        { encabezado: "Estado de pago" },
        { encabezado: "Total", alineacion: "der" },
      ]}
      filas={pedidos.map((pedido) => ({
        id: pedido.id,
        celdas: [
          <Link
            key="numero"
            href={`/pedidos/${pedido.id}`}
            className="text-sm font-medium text-zinc-900 hover:underline"
          >
            #{pedido.numero}
          </Link>,
          <div key="cliente" className="min-w-0">
            <p className="truncate text-sm text-zinc-800">{pedido.cliente}</p>
            <p className="truncate text-xs text-zinc-500">{pedido.telefono}</p>
          </div>,
          <span key="localidad" className="truncate text-xs text-zinc-600">
            {pedido.localidad ?? "—"}
          </span>,
          <span key="fecha" className="whitespace-nowrap text-xs text-zinc-500">
            {formatearFechaHora(pedido.createdAt, locale)}
          </span>,
          <span key="entrega" className="text-xs text-zinc-600">
            {pedido.tipoEntrega === "RETIRO" ? "Retiro" : "Envío"}
          </span>,
          <span key="metodo" className="text-xs text-zinc-600">
            {pedido.metodoPago ?? "—"}
          </span>,
          <Etiqueta key="estado" tono={TONOS_ESTADO_PEDIDO[pedido.estado]}>
            {ETIQUETAS_ESTADO_PEDIDO[pedido.estado]}
          </Etiqueta>,
          <Etiqueta key="pago" tono={TONOS_ESTADO_PAGO[pedido.estadoPago]}>
            {ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]}
          </Etiqueta>,
          <span key="total" className="text-sm font-medium text-zinc-900">
            {formatearMoneda(pedido.total, moneda, locale)}
          </span>,
        ],
      }))}
    />
  );
}
