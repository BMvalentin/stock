import { Prisma } from "@/generated/prisma/client";
import type { UnidadVenta } from "@/generated/prisma/enums";

// Cantidad de stock que consume una línea de pedido, expresada en la unidad de
// stock del producto. Una venta por presentación (`UNIDAD`) con peso definido
// descuenta `cantidad × pesoPresentacionKg` kilogramos; la venta suelta y los
// productos sin presentación descuentan la cantidad tal cual.
export function calcularCantidadStockLinea(
  unidadVenta: UnidadVenta,
  cantidad: Prisma.Decimal,
  pesoPresentacionKg: Prisma.Decimal | null,
): Prisma.Decimal {
  if (unidadVenta === "UNIDAD" && pesoPresentacionKg !== null) {
    return cantidad.mul(pesoPresentacionKg);
  }

  return cantidad;
}
