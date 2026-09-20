import { prisma } from "@/lib/prisma/cliente";
import type { TipoCalculoEnvio } from "@/generated/prisma/enums";

export type ConfiguracionEnvioActual = {
  id: string;
  tipo: TipoCalculoEnvio;
  precio: number;
  activo: boolean;
};

// Devuelve la configuración de envío activa. Si no existe ninguna, crea una
// por defecto para que el cálculo de envío siempre tenga datos.
export async function obtenerConfiguracionEnvio(): Promise<ConfiguracionEnvioActual> {
  const existente = await prisma.configuracionEnvio.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, tipo: true, precio: true, activo: true },
  });

  if (existente) {
    return { ...existente, precio: Number(existente.precio) };
  }

  const creada = await prisma.configuracionEnvio.create({
    data: { tipo: "SIN_CARGO", precio: 0, activo: true },
    select: { id: true, tipo: true, precio: true, activo: true },
  });

  return { ...creada, precio: Number(creada.precio) };
}
