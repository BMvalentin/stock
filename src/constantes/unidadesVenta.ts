import type { UnidadVenta } from "@/generated/prisma/enums";

// Etiqueta de la modalidad de venta tal como se muestra al operador.
export const ETIQUETAS_UNIDAD_VENTA: Record<UnidadVenta, string> = {
  UNIDAD: "Por unidad",
  KILOGRAMO: "Por kg",
};

// Sufijo corto para precios (ej. "$2.500 / kg").
export const SUFIJOS_PRECIO_UNIDAD_VENTA: Record<UnidadVenta, string> = {
  UNIDAD: "/ unidad",
  KILOGRAMO: "/ kg",
};

export const UNIDADES_VENTA: UnidadVenta[] = ["UNIDAD", "KILOGRAMO"];
