import type { UnidadVenta } from "@/generated/prisma/enums";

// Etiqueta de la modalidad vendida en una línea de pedido. Distingue la bolsa
// de la venta suelta cuando el producto tiene presentación; los productos sin
// presentación mantienen sus etiquetas genéricas ("Unidad" / "Por kg").
export function etiquetaModalidadLinea(linea: {
  unidadVenta: UnidadVenta;
  pesoPresentacionKg: number | null;
}): string {
  if (linea.pesoPresentacionKg !== null) {
    return linea.unidadVenta === "UNIDAD" ? "Bolsa" : "Suelto";
  }

  return linea.unidadVenta === "UNIDAD" ? "Unidad" : "Por kg";
}
