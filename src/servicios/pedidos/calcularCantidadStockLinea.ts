import { Prisma } from "@/generated/prisma/client";

// Cantidad de stock que consume una línea de pedido, expresada en la unidad de
// stock del producto. `contenido` es lo que consume una unidad de la modalidad
// (ej. 15 para una bolsa de 15 kg); null equivale a 1 (venta por unidad o
// suelto por kg).
export function calcularCantidadStockLinea(
  contenido: Prisma.Decimal | null,
  cantidad: Prisma.Decimal,
): Prisma.Decimal {
  if (contenido === null) return cantidad;

  return cantidad.mul(contenido);
}
