import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";

// Resumen de totales del pedido. A ancho completo en mobile y alineado a la
// derecha con ancho acotado desde tablet. El total se destaca visualmente.
export function TotalesPedido({
  subtotal,
  costoEnvio,
  total,
  moneda,
  locale,
}: {
  subtotal: number;
  costoEnvio: number;
  total: number;
  moneda: string;
  locale: string;
}) {
  return (
    <dl className="mt-4 w-full space-y-2 text-sm sm:ml-auto sm:max-w-xs">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-zinc-500">Subtotal</dt>
        <dd className="text-right text-zinc-800">
          {formatearMoneda(subtotal, moneda, locale)}
        </dd>
      </div>
      <div className="flex items-start justify-between gap-3">
        <dt className="text-zinc-500">Envío</dt>
        <dd className="text-right text-zinc-800">
          {formatearMoneda(costoEnvio, moneda, locale)}
        </dd>
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-zinc-200 pt-3">
        <dt className="text-base font-medium text-zinc-900">Total</dt>
        <dd className="text-right text-base font-semibold text-zinc-900">
          {formatearMoneda(total, moneda, locale)}
        </dd>
      </div>
    </dl>
  );
}
