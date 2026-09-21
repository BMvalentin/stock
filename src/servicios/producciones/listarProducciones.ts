import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";

export type ProduccionListado = {
  id: string;
  fecha: Date;
  cantidad: number;
  precioUnidad: Prisma.Decimal;
  total: Prisma.Decimal;
  productoId: string;
  productoNombre: string;
  liquidacionId: string | null;
};

// Producciones de un empleado, opcionalmente acotadas a un período.
export async function listarProducciones(
  empleadoId: string,
  opciones?: { desde?: Date; hasta?: Date; limite?: number },
): Promise<ProduccionListado[]> {
  const producciones = await prisma.empleadoProduccion.findMany({
    where: {
      empleadoId,
      ...(opciones?.desde || opciones?.hasta
        ? {
            fecha: {
              ...(opciones?.desde ? { gte: opciones.desde } : {}),
              ...(opciones?.hasta ? { lte: opciones.hasta } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
    take: opciones?.limite,
    select: {
      id: true,
      fecha: true,
      cantidad: true,
      precioUnidad: true,
      total: true,
      productoId: true,
      liquidacionId: true,
      producto: { select: { nombre: true } },
    },
  });

  return producciones.map((produccion) => ({
    id: produccion.id,
    fecha: produccion.fecha,
    cantidad: produccion.cantidad,
    precioUnidad: produccion.precioUnidad,
    total: produccion.total,
    productoId: produccion.productoId,
    productoNombre: produccion.producto.nombre,
    liquidacionId: produccion.liquidacionId,
  }));
}
