import type { UnidadVenta } from "@/generated/prisma/enums";

// Etiqueta de la modalidad vendida en una línea de pedido. Usa el nombre de la
// modalidad si está disponible (pedidos nuevos) y, para pedidos históricos, cae
// a la lógica anterior (bolsa vs. suelto según la presentación).
export function etiquetaModalidadLinea(linea: {
  modalidadNombre?: string | null;
  unidadVenta: UnidadVenta;
  contenido?: number | null;
  pesoPresentacionKg?: number | null;
}): string {
  if (linea.modalidadNombre) return linea.modalidadNombre;

  const presentacion = linea.contenido ?? linea.pesoPresentacionKg ?? null;

  if (presentacion !== null) {
    return linea.unidadVenta === "UNIDAD" ? "Bolsa" : "Suelto";
  }

  return linea.unidadVenta === "UNIDAD" ? "Unidad" : "Por kg";
}
