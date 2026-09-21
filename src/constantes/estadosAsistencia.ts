import type {
  EstadoAsistencia,
  OrigenAsistencia,
} from "@/generated/prisma/enums";
import type { EstadoJornada } from "@/tipos/asistencia";
import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export const ETIQUETAS_ESTADO_ASISTENCIA: Record<EstadoAsistencia, string> = {
  PRESENTE: "Presente",
  AUSENTE: "Ausente",
  JUSTIFICADO: "Justificado",
};

export const TONOS_ESTADO_ASISTENCIA: Record<EstadoAsistencia, TonoEtiqueta> = {
  PRESENTE: "exito",
  AUSENTE: "peligro",
  JUSTIFICADO: "alerta",
};

export const ESTADOS_ASISTENCIA: EstadoAsistencia[] = [
  "PRESENTE",
  "AUSENTE",
  "JUSTIFICADO",
];

// Etiquetas del estado derivado de la jornada (según los tramos registrados).
export const ETIQUETAS_ESTADO_JORNADA: Record<EstadoJornada, string> = {
  AUSENTE: "Ausente",
  JUSTIFICADO: "Justificado",
  SIN_REGISTRO: "Sin registro",
  TRAMO_1_EN_CURSO: "Tramo 1 en curso",
  TRAMO_2_PENDIENTE: "Tramo 2 pendiente",
  TRAMO_2_EN_CURSO: "Tramo 2 en curso",
  COMPLETA: "Completa",
};

export const TONOS_ESTADO_JORNADA: Record<EstadoJornada, TonoEtiqueta> = {
  AUSENTE: "peligro",
  JUSTIFICADO: "alerta",
  SIN_REGISTRO: "neutral",
  TRAMO_1_EN_CURSO: "info",
  TRAMO_2_PENDIENTE: "info",
  TRAMO_2_EN_CURSO: "info",
  COMPLETA: "exito",
};

export const ETIQUETAS_ORIGEN_ASISTENCIA: Record<OrigenAsistencia, string> = {
  QR: "QR",
  MANUAL_ADMIN: "Manual",
};
