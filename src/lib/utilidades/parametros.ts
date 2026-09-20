// Lee un parámetro de búsqueda de Next y devuelve un string limpio o undefined.
export function leerParametro(
  valor: string | string[] | undefined,
): string | undefined {
  const crudo = Array.isArray(valor) ? valor[0] : valor;
  const limpio = crudo?.trim();
  return limpio ? limpio : undefined;
}
