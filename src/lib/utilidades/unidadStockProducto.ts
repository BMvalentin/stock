import type { UnidadVenta } from "@/generated/prisma/enums";

// Unidad en la que se lleva el stock de un producto (campo explícito
// `Producto.unidadStock`).
export function unidadStockProducto(producto: {
  unidadStock: UnidadVenta;
}): UnidadVenta {
  return producto.unidadStock;
}
