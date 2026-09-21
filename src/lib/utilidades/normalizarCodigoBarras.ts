// Normaliza un código de barras detectado o escrito a mano: quita espacios
// al inicio, al final y los internos. No cambia mayúsculas/minúsculas porque
// Code 128 distingue mayúsculas de minúsculas.
export function normalizarCodigoBarras(valor: string): string {
  return valor.trim().replace(/\s+/g, "");
}
