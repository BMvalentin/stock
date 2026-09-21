import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { formatearCantidad } from "@/lib/utilidades/formatearCantidad";
import type { LineaCalculada } from "@/servicios/pedidos/calcularTotalesPedido";

// Valida que haya stock suficiente para las líneas calculadas. Es una
// verificación de lectura al crear el pedido; el descuento real (con guarda de
// concurrencia) ocurre al pasar el pedido a CONFIRMADO.
export function validarStockPedido(lineas: LineaCalculada[]): void {
  for (const linea of lineas) {
    if (linea.stockActual.lt(linea.cantidadStock)) {
      throw new ErrorNegocio(
        `No hay stock suficiente de ${linea.nombreProducto}. Disponible: ${formatearCantidad(
          linea.stockActual.toNumber(),
          linea.unidadStock,
        )}.`,
      );
    }
  }
}
