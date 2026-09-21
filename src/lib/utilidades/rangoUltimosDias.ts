import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { instanteEnZona } from "@/lib/utilidades/instanteEnZona";
import { sumarDiasCalendario } from "@/lib/utilidades/sumarDiasCalendario";

// Devuelve el rango de los últimos N días (incluyendo el día actual) según el
// calendario del comercio, como instantes UTC. No depende de la zona del
// servidor.
export function rangoUltimosDias(dias: number): { inicio: Date; fin: Date } {
  const hoy = claveFechaEnZona(new Date(), ZONA_HORARIA);
  const primerDia = sumarDiasCalendario(hoy, -(dias - 1));

  return {
    inicio: instanteEnZona(primerDia, "00:00:00.000", ZONA_HORARIA),
    fin: instanteEnZona(hoy, "23:59:59.999", ZONA_HORARIA),
  };
}
