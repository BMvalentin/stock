// Convierte "YYYY-MM-DD" en Date a medianoche UTC (formato de columnas
// `@db.Date`). Devuelve undefined si el valor no es una fecha válida.
export function parsearFechaCalendario(valor: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return undefined;

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  if (Number.isNaN(fecha.getTime())) return undefined;

  return fecha.toISOString().slice(0, 10) === valor ? fecha : undefined;
}
