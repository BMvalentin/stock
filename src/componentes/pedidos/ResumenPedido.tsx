"use client";

import type { ResumenPedidoCalculado } from "@/tipos/pedidoFormulario";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { Alerta } from "@/componentes/ui/Alerta";

// Resumen del pedido calculado en el servidor. Muestra subtotal, envío y total
// reales; no realiza cálculos financieros en el navegador.
export function ResumenPedido({
  resumen,
  calculando,
  error,
  moneda,
  locale,
}: {
  resumen: ResumenPedidoCalculado | null;
  calculando: boolean;
  error: string | null;
  moneda: string;
  locale: string;
}) {
  if (error) {
    return <Alerta tono="advertencia">{error}</Alerta>;
  }

  const subtotal = resumen?.subtotal ?? 0;
  const costoEnvio = resumen?.costoEnvio ?? 0;
  const total = resumen?.total ?? 0;

  return (
    <div className="space-y-2">
      <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Subtotal</dt>
          <dd className="text-zinc-800">
            {formatearMoneda(subtotal, moneda, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Envío</dt>
          <dd className="text-zinc-800">
            {formatearMoneda(costoEnvio, moneda, locale)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-zinc-100 pt-2">
          <dt className="font-medium text-zinc-900">Total</dt>
          <dd className="font-semibold text-zinc-900">
            {formatearMoneda(total, moneda, locale)}
          </dd>
        </div>
      </dl>
      {calculando ? (
        <p className="text-right text-xs text-zinc-400">Calculando…</p>
      ) : null}
    </div>
  );
}
