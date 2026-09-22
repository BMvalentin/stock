import type { PagoPedido } from "@/servicios/pedidos/obtenerPedido";
import {
  ETIQUETAS_ESTADO_PAGO,
  TONOS_ESTADO_PAGO,
} from "@/constantes/estadosPago";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { Etiqueta } from "@/componentes/ui/Etiqueta";

// Historial de pagos. En desktop se muestra la tabla; en mobile, una tarjeta por
// pago. Comparte el formateo de fecha y moneda entre ambas vistas.
export function PagosPedido({
  pagos,
  moneda,
  locale,
}: {
  pagos: PagoPedido[];
  moneda: string;
  locale: string;
}) {
  if (pagos.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-500">
        Todavía no hay pagos registrados.
      </p>
    );
  }

  return (
    <>
      <div className="mt-3 hidden md:block">
        <TablaDatos
          columnas={[
            { encabezado: "Fecha" },
            { encabezado: "Monto", alineacion: "der" },
            { encabezado: "Estado" },
            { encabezado: "Usuario" },
            { encabezado: "Observación" },
          ]}
          filas={pagos.map((pago) => ({
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

      <ul className="mt-3 space-y-3 md:hidden">
        {pagos.map((pago) => (
          <li key={pago.id} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 break-words font-medium text-zinc-900">
                {formatearMoneda(pago.monto, moneda, locale)}
              </span>
              <Etiqueta tono={TONOS_ESTADO_PAGO[pago.estado]}>
                {ETIQUETAS_ESTADO_PAGO[pago.estado]}
              </Etiqueta>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {formatearFechaHora(pago.createdAt, locale)}
            </p>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-zinc-500">Usuario</dt>
                <dd className="min-w-0 break-words text-right text-zinc-800">
                  {pago.usuario ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-zinc-500">Observación</dt>
                <dd className="min-w-0 break-words text-right text-zinc-800">
                  {pago.observacion ?? "—"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
