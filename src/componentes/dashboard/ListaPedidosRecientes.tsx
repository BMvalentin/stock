import Link from "next/link";
import type { PedidoReciente } from "@/servicios/dashboard/obtenerPedidosRecientes";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
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

export function ListaPedidosRecientes({
  pedidos,
  moneda,
  locale,
}: {
  pedidos: PedidoReciente[];
  moneda: string;
  locale: string;
}) {
  if (pedidos.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin pedidos todavía"
        descripcion="Los pedidos creados aparecerán acá."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {pedidos.map((pedido) => (
        <li key={pedido.id}>
          <Link
            href={`/pedidos/${pedido.id}`}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                #{pedido.numero} · {pedido.cliente}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {formatearFechaHora(pedido.createdAt, locale)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Etiqueta tono={TONOS_ESTADO_PEDIDO[pedido.estado]}>
                {ETIQUETAS_ESTADO_PEDIDO[pedido.estado]}
              </Etiqueta>
              <Etiqueta tono={TONOS_ESTADO_PAGO[pedido.estadoPago]}>
                {ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]}
              </Etiqueta>
              <span className="text-sm font-medium text-zinc-900">
                {formatearMoneda(pedido.total, moneda, locale)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
