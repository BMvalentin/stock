// Devuelve el rango del mes calendario actual (desde el día 1 hasta el fin).
export function rangoMesActual(): { inicio: Date; fin: Date } {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
  return { inicio, fin };
}
