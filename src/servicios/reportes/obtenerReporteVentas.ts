import { prisma } from "@/lib/prisma/cliente";

export type ReporteVentas = {
  totalVendido: number;
  cantidadPedidos: number;
  ticketPromedio: number;
};

// Resumen de ventas del período. Excluye pedidos cancelados.
export async function obtenerReporteVentas(
  desde: Date,
  hasta: Date,
): Promise<ReporteVentas> {
  const resultado = await prisma.pedido.aggregate({
    _sum: { total: true },
    _count: { _all: true },
    where: {
      createdAt: { gte: desde, lte: hasta },
      estado: { not: "CANCELADO" },
    },
  });

  const totalVendido = Number(resultado._sum.total ?? 0);
  const cantidadPedidos = resultado._count._all;

  return {
    totalVendido,
    cantidadPedidos,
    ticketPromedio: cantidadPedidos > 0 ? totalVendido / cantidadPedidos : 0,
  };
}
