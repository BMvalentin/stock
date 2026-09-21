import type { TipoRemuneracion } from "@/generated/prisma/enums";

export const ETIQUETAS_TIPO_REMUNERACION: Record<TipoRemuneracion, string> = {
  POR_HORA: "Por hora",
  POR_PRODUCCION: "Por producción",
};

export const TIPOS_REMUNERACION: TipoRemuneracion[] = [
  "POR_HORA",
  "POR_PRODUCCION",
];
