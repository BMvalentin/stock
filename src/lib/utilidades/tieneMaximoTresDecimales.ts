// Verifica que un número tenga como máximo 3 decimales (precisión de stock y
// cantidades). Redondea a milésimas para evitar errores de punto flotante.
export function tieneMaximoTresDecimales(valor: number): boolean {
  return Math.abs(valor * 1000 - Math.round(valor * 1000)) < 1e-6;
}
