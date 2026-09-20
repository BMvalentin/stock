export const REGISTROS_POR_PAGINA = 20;

// Normaliza el parámetro `pagina` de la URL a un entero positivo.
export function normalizarPagina(
  valor: string | string[] | undefined,
): number {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const numero = Number(crudo);
  return Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : 1;
}

// Calcula el total de páginas a partir del total de registros.
export function calcularTotalPaginas(
  totalRegistros: number,
  porPagina = REGISTROS_POR_PAGINA,
): number {
  return Math.max(1, Math.ceil(totalRegistros / porPagina));
}
