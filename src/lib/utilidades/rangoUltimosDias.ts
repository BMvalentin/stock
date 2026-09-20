// Devuelve el rango de los últimos N días (incluyendo el día actual).
export function rangoUltimosDias(dias: number): { inicio: Date; fin: Date } {
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);
  const inicio = new Date(fin);
  inicio.setDate(inicio.getDate() - (dias - 1));
  inicio.setHours(0, 0, 0, 0);
  return { inicio, fin };
}
