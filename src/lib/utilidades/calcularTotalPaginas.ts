// Calcula el total de páginas a partir del total de registros.
export function calcularTotalPaginas(
  totalRegistros: number,
  porPagina: number,
): number {
  return Math.max(1, Math.ceil(totalRegistros / porPagina));
}
