import type { UnidadVenta } from "@/generated/prisma/enums";

// Sufijo del precio unitario según la modalidad vendida. La venta por kg usa
// "/ kg"; una presentación con contenido usa "/ bolsa" y el resto "/ unidad".
export function sufijoPrecioModalidadLinea(linea: {
  unidadVenta: UnidadVenta;
  contenido?: number | null;
  pesoPresentacionKg?: number | null;
}): string {
  if (linea.unidadVenta === "KILOGRAMO") return "/ kg";

  const presentacion = linea.contenido ?? linea.pesoPresentacionKg ?? null;

  return presentacion !== null ? "/ bolsa" : "/ unidad";
}
