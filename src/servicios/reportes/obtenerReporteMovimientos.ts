import { prisma } from "@/lib/prisma/cliente";
import type { TipoMovimiento } from "@/generated/prisma/enums";

export type ReporteMovimientos = {
  totales: Record<TipoMovimiento, number>;
  totalMovimientos: number;
};

const TIPOS: TipoMovimiento[] = [
  "INGRESO",
  "EGRESO",
  "AJUSTE_POSITIVO",
  "AJUSTE_NEGATIVO",
  "VENTA",
  "DEVOLUCION",
];

// Cantidad de movimientos por tipo en el período indicado.
export async function obtenerReporteMovimientos(
  desde: Date,
  hasta: Date,
): Promise<ReporteMovimientos> {
  const agrupado = await prisma.movimientoStock.groupBy({
    by: ["tipo"],
    _count: { _all: true },
    where: { createdAt: { gte: desde, lte: hasta } },
  });

  const totales = Object.fromEntries(TIPOS.map((tipo) => [tipo, 0])) as Record<
    TipoMovimiento,
    number
  >;
  let totalMovimientos = 0;

  for (const fila of agrupado) {
    totales[fila.tipo] = fila._count._all;
    totalMovimientos += fila._count._all;
  }

  return { totales, totalMovimientos };
}
