import type { TipoMovimiento } from "@/generated/prisma/enums";
import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export const ETIQUETAS_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  AJUSTE_POSITIVO: "Ajuste positivo",
  AJUSTE_NEGATIVO: "Ajuste negativo",
  VENTA: "Venta",
  DEVOLUCION: "Devolución",
};

export const TONOS_TIPO_MOVIMIENTO: Record<TipoMovimiento, TonoEtiqueta> = {
  INGRESO: "exito",
  EGRESO: "peligro",
  AJUSTE_POSITIVO: "exito",
  AJUSTE_NEGATIVO: "peligro",
  VENTA: "info",
  DEVOLUCION: "alerta",
};

export const TIPOS_MOVIMIENTO: TipoMovimiento[] = [
  "INGRESO",
  "EGRESO",
  "AJUSTE_POSITIVO",
  "AJUSTE_NEGATIVO",
  "VENTA",
  "DEVOLUCION",
];
