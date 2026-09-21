import type { UnidadVenta } from "@/generated/prisma/enums";

// Unidad en la que se lleva el stock de un producto. Un producto con venta
// suelta se mide en kilogramos (la bolsa descuenta su peso de presentación);
// el resto conserva la unidad de su modalidad de venta.
export function unidadStockProducto(producto: {
  permiteVentaSuelta: boolean;
  unidadVenta: UnidadVenta;
}): UnidadVenta {
  return producto.permiteVentaSuelta ? "KILOGRAMO" : producto.unidadVenta;
}
