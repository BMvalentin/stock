import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { instanteEnZona } from "@/lib/utilidades/instanteEnZona";

// Convierte un parámetro de fecha (YYYY-MM-DD) en el instante UTC del inicio
// (o fin) de ese día calendario en la zona del comercio, sin depender de la
// zona del servidor. `finDelDia` incluye todo el día en el límite superior.
export function parsearFechaFiltro(
  valor: string | undefined,
  finDelDia = false,
): Date | undefined {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return undefined;

  const fecha = instanteEnZona(
    valor,
    finDelDia ? "23:59:59.999" : "00:00:00.000",
    ZONA_HORARIA,
  );

  if (Number.isNaN(fecha.getTime())) return undefined;

  return claveFechaEnZona(fecha, ZONA_HORARIA) === valor ? fecha : undefined;
}
