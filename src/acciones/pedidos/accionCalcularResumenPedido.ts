"use server";

import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { calcularTotalesPedido } from "@/servicios/pedidos/calcularTotalesPedido";
import { calcularCostoEnvio } from "@/servicios/configuracion/calcularCostoEnvio";
import type { ResumenPedidoCalculado } from "@/tipos/pedidoFormulario";
import type { TipoEntrega } from "@/generated/prisma/enums";

export type ResultadoResumenPedido =
  | { ok: true; resumen: ResumenPedidoCalculado }
  | { ok: false; error: string };

const RESUMEN_VACIO: ResumenPedidoCalculado = {
  lineas: [],
  subtotal: 0,
  costoEnvio: 0,
  total: 0,
};

// Calcula el resumen del pedido en el servidor para la vista previa del
// formulario. Reutiliza los mismos servicios que la creación: el cliente nunca
// determina precios ni envío.
export async function accionCalcularResumenPedido(
  lineas: { productoId: string; cantidad: number }[],
  metodoPagoId: string,
  tipoEntrega: TipoEntrega,
): Promise<ResultadoResumenPedido> {
  await requerirSesion();

  if (lineas.length === 0) {
    return { ok: true, resumen: RESUMEN_VACIO };
  }

  if (!metodoPagoId) {
    return { ok: false, error: "Seleccioná un método de pago." };
  }

  try {
    const { lineas: calculadas, subtotal } = await calcularTotalesPedido(
      lineas,
      metodoPagoId,
    );

    const costoEnvio = await calcularCostoEnvio(
      tipoEntrega,
      calculadas.map((linea) => ({
        cantidad: linea.cantidad.toNumber(),
        unidadesPorBulto: linea.unidadesPorBulto,
      })),
    );

    return {
      ok: true,
      resumen: {
        lineas: calculadas.map((linea) => ({
          productoId: linea.productoId,
          nombreProducto: linea.nombreProducto,
          unidadVenta: linea.unidadVenta,
          precioUnitario: linea.precioUnitario.toNumber(),
          cantidad: linea.cantidad.toNumber(),
          subtotal: linea.subtotal.toNumber(),
        })),
        subtotal: subtotal.toNumber(),
        costoEnvio: costoEnvio.toNumber(),
        total: subtotal.add(costoEnvio).toNumber(),
      },
    };
  } catch (error) {
    if (error instanceof ErrorNegocio) return { ok: false, error: error.message };
    throw error;
  }
}
