import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";

// Fecha de hoy como Date a medianoche UTC, según el calendario del comercio.
// Es el formato que usan las columnas `@db.Date`.
export function fechaHoyCalendario(): Date {
  const clave = claveFechaEnZona(new Date(), ZONA_HORARIA);
  return new Date(`${clave}T00:00:00.000Z`);
}
