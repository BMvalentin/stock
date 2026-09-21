import type { EstadoLiquidacion } from "@/generated/prisma/enums";
import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export const ETIQUETAS_ESTADO_LIQUIDACION: Record<EstadoLiquidacion, string> = {
  ABIERTA: "Abierta",
  CALCULADA: "Calculada",
  PAGADA: "Pagada",
  CANCELADA: "Cancelada",
};

export const TONOS_ESTADO_LIQUIDACION: Record<EstadoLiquidacion, TonoEtiqueta> =
  {
    ABIERTA: "info",
    CALCULADA: "alerta",
    PAGADA: "exito",
    CANCELADA: "neutral",
  };

export const ESTADOS_LIQUIDACION: EstadoLiquidacion[] = [
  "ABIERTA",
  "CALCULADA",
  "PAGADA",
  "CANCELADA",
];
