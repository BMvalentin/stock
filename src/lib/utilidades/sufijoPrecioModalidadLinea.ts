import type { UnidadVenta } from "@/generated/prisma/enums";

// Sufijo del precio unitario según la modalidad vendida. La venta suelta y los
// productos por kg usan "/ kg"; la presentación con peso usa "/ bolsa" y el
// resto "/ unidad".
export function sufijoPrecioModalidadLinea(linea: {
  unidadVenta: UnidadVenta;
  pesoPresentacionKg: number | null;
}): string {
  if (linea.unidadVenta === "KILOGRAMO") return "/ kg";
  return linea.pesoPresentacionKg !== null ? "/ bolsa" : "/ unidad";
}
