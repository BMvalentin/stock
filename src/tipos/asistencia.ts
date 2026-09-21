// Acción de fichaje que corresponde registrar. La jornada soporta hasta dos
// tramos (continua = solo tramo 1; partida = tramo 1 y 2).
export type AccionFichaje =
  | "ENTRADA_TRAMO_1"
  | "SALIDA_TRAMO_1"
  | "ENTRADA_TRAMO_2"
  | "SALIDA_TRAMO_2";

export type ProximoFichaje = AccionFichaje | "COMPLETA";

// Estado derivado de la jornada, para mostrar en la UI. No reemplaza a
// `EstadoAsistencia` (PRESENTE/AUSENTE/JUSTIFICADO), que sigue siendo el estado
// administrativo del día.
export type EstadoJornada =
  | "AUSENTE"
  | "JUSTIFICADO"
  | "SIN_REGISTRO"
  | "TRAMO_1_EN_CURSO"
  | "TRAMO_2_PENDIENTE"
  | "TRAMO_2_EN_CURSO"
  | "COMPLETA";

// Horas registradas de la jornada. null = sin registrar.
export type TramosAsistencia = {
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
};
