// Convierte un parámetro de fecha (YYYY-MM-DD) en Date, o undefined si es
// inválido. `finDelDia` permite incluir todo el día en el límite superior.
export function parsearFechaFiltro(
  valor: string | undefined,
  finDelDia = false,
): Date | undefined {
  if (!valor) return undefined;
  const fecha = new Date(`${valor}T${finDelDia ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}
