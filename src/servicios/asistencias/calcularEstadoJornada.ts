import type { EstadoAsistencia } from "@/generated/prisma/enums";
import type { EstadoJornada, TramosAsistencia } from "@/tipos/asistencia";

// Deriva el estado visible de la jornada a partir del estado administrativo y
// de los tramos registrados. Permite distinguir una jornada completa de una que
// todavía tiene el tramo 1 en curso o el tramo 2 pendiente.
export function calcularEstadoJornada(datos: {
  estado: EstadoAsistencia;
  tramos: TramosAsistencia;
  esperaSegundoTramo: boolean;
}): EstadoJornada {
  if (datos.estado === "AUSENTE") return "AUSENTE";
  if (datos.estado === "JUSTIFICADO") return "JUSTIFICADO";

  const { tramos } = datos;

  const sinRegistro =
    !tramos.horaEntrada &&
    !tramos.horaSalida &&
    !tramos.horaEntradaTramo2 &&
    !tramos.horaSalidaTramo2;

  if (sinRegistro) return "SIN_REGISTRO";

  const tramo1Completo = Boolean(tramos.horaEntrada && tramos.horaSalida);

  if (!tramo1Completo) return "TRAMO_1_EN_CURSO";

  if (!datos.esperaSegundoTramo) return "COMPLETA";

  if (!tramos.horaEntradaTramo2) return "TRAMO_2_PENDIENTE";
  if (!tramos.horaSalidaTramo2) return "TRAMO_2_EN_CURSO";

  return "COMPLETA";
}
