// Normaliza un CUIT/CUIL a solo dígitos (11). La presentación con guiones se
// resuelve al mostrar con `formatearCuit`.
export function normalizarCuit(valor: string): string {
  return valor.replace(/\D/g, "");
}
