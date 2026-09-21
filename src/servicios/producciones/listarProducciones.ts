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

export type FiltrosProducciones = {
  desde?: Date;
  hasta?: Date;
  productoId?: string;
  pagina: number;
  porPagina: number;
};

export type ResultadoProducciones = {
  producciones: ProduccionListado[];
  total: number;
};

// Producciones de un empleado, paginadas en la base y opcionalmente acotadas a
// un período o a un producto.
export async function listarProducciones(
  empleadoId: string,
  filtros: FiltrosProducciones,
): Promise<ResultadoProducciones> {
  const where: Prisma.EmpleadoProduccionWhereInput = {
    empleadoId,
    ...(filtros.productoId ? { productoId: filtros.productoId } : {}),
    ...(filtros.desde || filtros.hasta
      ? {
          fecha: {
            ...(filtros.desde ? { gte: filtros.desde } : {}),
            ...(filtros.hasta ? { lte: filtros.hasta } : {}),
          },
        }
      : {}),
  };

  const [total, producciones] = await Promise.all([
    prisma.empleadoProduccion.count({ where }),
    prisma.empleadoProduccion.findMany({
      where,
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
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
    }),
  ]);

  return {
    total,
    producciones: producciones.map((produccion) => ({
      id: produccion.id,
      fecha: produccion.fecha,
      cantidad: produccion.cantidad,
      precioUnidad: produccion.precioUnidad,
      total: produccion.total,
      productoId: produccion.productoId,
      productoNombre: produccion.producto.nombre,
      liquidacionId: produccion.liquidacionId,
    })),
  };
}
