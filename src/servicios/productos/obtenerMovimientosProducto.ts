import { prisma } from "@/lib/prisma/cliente";
import type { TipoMovimiento } from "@/generated/prisma/enums";

export type MovimientoProducto = {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  motivo: string | null;
  usuario: string | null;
  createdAt: Date;
};

export async function obtenerMovimientosProducto(
  productoId: string,
  limite = 8,
): Promise<MovimientoProducto[]> {
  const movimientos = await prisma.movimientoStock.findMany({
    where: { productoId },
    orderBy: { createdAt: "desc" },
    take: limite,
    select: {
      id: true,
      tipo: true,
      cantidad: true,
      stockAnterior: true,
      stockPosterior: true,
      motivo: true,
      createdAt: true,
      usuario: { select: { name: true } },
    },
  });

  return movimientos.map((movimiento) => ({
    id: movimiento.id,
    tipo: movimiento.tipo,
    cantidad: Number(movimiento.cantidad),
    stockAnterior: Number(movimiento.stockAnterior),
    stockPosterior: Number(movimiento.stockPosterior),
    motivo: movimiento.motivo,
    usuario: movimiento.usuario.name,
    createdAt: movimiento.createdAt,
  }));
}
