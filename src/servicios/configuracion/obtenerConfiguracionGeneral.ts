import { unstable_cache } from "next/cache";
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
// Se cachea por peticiones: es una fila única y de cambio infrecuente. La
// mutación (`accionActualizarConfiguracionGeneral`) invalida la etiqueta.
async function leerConfiguracionGeneral(): Promise<ConfiguracionGeneral> {
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

const obtenerConfiguracionGeneralEnCache = unstable_cache(
  leerConfiguracionGeneral,
  ["configuracion-general"],
  { tags: ["configuracion"] },
);

export async function obtenerConfiguracionGeneral(): Promise<ConfiguracionGeneral> {
  return obtenerConfiguracionGeneralEnCache();
}
