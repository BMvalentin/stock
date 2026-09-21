import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { TipoMovimiento } from "@/generated/prisma/enums";

export type FiltrosMovimientos = {
  productoId?: string;
  tipo?: TipoMovimiento;
  usuarioId?: string;
  desde?: Date;
  hasta?: Date;
  pagina: number;
  porPagina: number;
};

export type MovimientoListado = {
  id: string;
  createdAt: Date;
  productoId: string;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  usuario: string | null;
  motivo: string | null;
};

export type ResultadoMovimientos = {
  movimientos: MovimientoListado[];
  total: number;
};

export async function listarMovimientos(
  filtros: FiltrosMovimientos,
): Promise<ResultadoMovimientos> {
  const where: Prisma.MovimientoStockWhereInput = {
    ...(filtros.productoId ? { productoId: filtros.productoId } : {}),
    ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
    ...(filtros.desde || filtros.hasta
      ? {
          createdAt: {
            ...(filtros.desde ? { gte: filtros.desde } : {}),
            ...(filtros.hasta ? { lte: filtros.hasta } : {}),
          },
        }
      : {}),
  };

  const [total, movimientos] = await Promise.all([
    prisma.movimientoStock.count({ where }),
    prisma.movimientoStock.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        createdAt: true,
        tipo: true,
        cantidad: true,
        stockAnterior: true,
        stockPosterior: true,
        motivo: true,
        producto: { select: { id: true, nombre: true } },
        usuario: { select: { name: true } },
      },
    }),
  ]);

  return {
    total,
    movimientos: movimientos.map((movimiento) => ({
      id: movimiento.id,
      createdAt: movimiento.createdAt,
      productoId: movimiento.producto.id,
      producto: movimiento.producto.nombre,
      tipo: movimiento.tipo,
      cantidad: Number(movimiento.cantidad),
      stockAnterior: Number(movimiento.stockAnterior),
      stockPosterior: Number(movimiento.stockPosterior),
      usuario: movimiento.usuario.name,
      motivo: movimiento.motivo,
    })),
  };
}
