// Devuelve la fecha calendario (YYYY-MM-DD) de un instante en la zona indicada.
// Se usa `en-CA` porque su formato corto ya es ISO (YYYY-MM-DD).
export function claveFechaEnZona(fecha: Date, zona: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}
