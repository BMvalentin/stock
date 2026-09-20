import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export type EstadoStock = "SIN_STOCK" | "CRITICO" | "BAJO" | "NORMAL";

export const ETIQUETAS_ESTADO_STOCK: Record<EstadoStock, string> = {
  SIN_STOCK: "Sin stock",
  CRITICO: "Crítico",
  BAJO: "Bajo",
  NORMAL: "Normal",
};

export const TONOS_ESTADO_STOCK: Record<EstadoStock, TonoEtiqueta> = {
  SIN_STOCK: "peligro",
  CRITICO: "peligro",
  BAJO: "alerta",
  NORMAL: "exito",
};

export const ESTADOS_STOCK: EstadoStock[] = [
  "SIN_STOCK",
  "CRITICO",
  "BAJO",
  "NORMAL",
];
