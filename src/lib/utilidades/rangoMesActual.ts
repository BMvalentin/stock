import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { instanteEnZona } from "@/lib/utilidades/instanteEnZona";
import { sumarDiasCalendario } from "@/lib/utilidades/sumarDiasCalendario";

// Devuelve el rango del mes calendario actual del comercio, como instantes UTC.
// `fin` es el último instante del mes (inclusive). No depende de la zona del
// servidor.
export function rangoMesActual(): { inicio: Date; fin: Date } {
  const hoy = claveFechaEnZona(new Date(), ZONA_HORARIA);
  const [anio, mes] = hoy.split("-").map(Number);
  const mesTexto = String(mes).padStart(2, "0");

  const primerDia = `${anio}-${mesTexto}-01`;
  const primerDiaSiguiente =
    mes === 12
      ? `${anio + 1}-01-01`
      : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  const ultimoDia = sumarDiasCalendario(primerDiaSiguiente, -1);

  return {
    inicio: instanteEnZona(primerDia, "00:00:00.000", ZONA_HORARIA),
    fin: instanteEnZona(ultimoDia, "23:59:59.999", ZONA_HORARIA),
  };
}
