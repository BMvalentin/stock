import { prisma } from "@/lib/prisma/cliente";
import { rangoMesActual } from "@/lib/utilidades/rangoMesActual";

export type ResumenDashboard = {
  productosActivos: number;
  productosSinStock: number;
  productosStockBajo: number;
  pedidosPendientes: number;
  pedidosPeriodo: number;
  totalVendidoPeriodo: number;
};

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const { inicio, fin } = rangoMesActual();

  const [
    productosActivos,
    productosSinStock,
    productosStockBajo,
    pedidosPendientes,
    pedidosPeriodo,
    ventas,
  ] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.producto.count({ where: { activo: true, stockActual: { lte: 0 } } }),
    prisma.producto.count({
      where: {
        activo: true,
        stockActual: { gt: 0, lte: prisma.producto.fields.stockMinimo },
      },
    }),
    prisma.pedido.count({
      where: {
        estado: { in: ["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO"] },
      },
    }),
    prisma.pedido.count({ where: { createdAt: { gte: inicio, lte: fin } } }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: inicio, lte: fin },
        estado: { not: "CANCELADO" },
      },
    }),
  ]);

  return {
    productosActivos,
    productosSinStock,
    productosStockBajo,
    pedidosPendientes,
    pedidosPeriodo,
    totalVendidoPeriodo: Number(ventas._sum.total ?? 0),
  };
}
