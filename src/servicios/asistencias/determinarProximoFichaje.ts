import type {
  ProximoFichaje,
  TramosAsistencia,
} from "@/tipos/asistencia";

// Determina qué fichaje corresponde según los tramos ya registrados. La
// secuencia es Entrada 1 → Salida 1 → Entrada 2 → Salida 2. Si el empleado no
// tiene tramo 2 configurado, la jornada es continua y termina en la Salida 1.
export function determinarProximoFichaje(
  tramos: TramosAsistencia,
  esperaSegundoTramo: boolean,
): ProximoFichaje {
  if (!tramos.horaEntrada) return "ENTRADA_TRAMO_1";
  if (!tramos.horaSalida) return "SALIDA_TRAMO_1";

  if (!esperaSegundoTramo) return "COMPLETA";

  if (!tramos.horaEntradaTramo2) return "ENTRADA_TRAMO_2";
  if (!tramos.horaSalidaTramo2) return "SALIDA_TRAMO_2";

  return "COMPLETA";
}
