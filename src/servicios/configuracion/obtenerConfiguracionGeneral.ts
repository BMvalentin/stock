import { prisma } from "@/lib/prisma/cliente";

export type ConfiguracionGeneral = {
  id: string;
  nombreComercio: string;
  moneda: string;
  locale: string;
};

const CAMPOS = {
  id: true,
  nombreComercio: true,
  moneda: true,
  locale: true,
} as const;

// Devuelve la configuración general del comercio. Si todavía no existe, crea
// la fila con valores por defecto para que el sistema siempre tenga una.
export async function obtenerConfiguracionGeneral(): Promise<ConfiguracionGeneral> {
  const existente = await prisma.configuracionGeneral.findFirst({
    select: CAMPOS,
    orderBy: { createdAt: "asc" },
  });

  if (existente) return existente;

  return prisma.configuracionGeneral.create({
    data: { nombreComercio: "Mi comercio", moneda: "ARS", locale: "es-AR" },
    select: CAMPOS,
  });
}
