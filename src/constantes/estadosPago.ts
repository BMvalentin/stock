import type { EstadoPago } from "@/generated/prisma/enums";
import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export const ETIQUETAS_ESTADO_PAGO: Record<EstadoPago, string> = {
  PENDIENTE: "Pendiente",
  AVISADO: "Avisado",
  CONFIRMADO: "Confirmado",
  RECHAZADO: "Rechazado",
};

export const TONOS_ESTADO_PAGO: Record<EstadoPago, TonoEtiqueta> = {
  PENDIENTE: "alerta",
  AVISADO: "info",
  CONFIRMADO: "exito",
  RECHAZADO: "peligro",
};

export const ESTADOS_PAGO: EstadoPago[] = [
  "PENDIENTE",
  "AVISADO",
  "CONFIRMADO",
  "RECHAZADO",
];
