// Normaliza el parámetro `pagina` de la URL a un entero positivo.
export function normalizarPagina(
  valor: string | string[] | undefined,
): number {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const numero = Number(crudo);
  return Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : 1;
}
