import type { EstadoStock } from "@/constantes/estadoStock";

// Determina el estado visual del stock de un producto a partir de su stock
// actual y su stock mínimo. El stock crítico es la mitad del mínimo.
export function calcularEstadoStock(
  stockActual: number,
  stockMinimo: number,
): EstadoStock {
  if (stockActual <= 0) return "SIN_STOCK";
  if (stockMinimo <= 0) return "NORMAL";
  if (stockActual <= Math.ceil(stockMinimo / 2)) return "CRITICO";
  if (stockActual <= stockMinimo) return "BAJO";
  return "NORMAL";
}
