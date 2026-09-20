import { prisma } from "@/lib/prisma/cliente";

export type ResumenDashboard = {
  productosActivos: number;
  productosSinStock: number;
  productosStockBajo: number;
  pedidosPendientes: number;
  pedidosDelDia: number;
  movimientosDelDia: number;
  totalVendidoHoy: number;
};

function rangoDelDia(): { inicio: Date; fin: Date } {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { inicio, fin };
}

export async function obtenerResumenDashboard(): Promise<ResumenDashboard> {
  const { inicio, fin } = rangoDelDia();

  const [
    productosActivos,
    productosSinStock,
    productosStockBajo,
    pedidosPendientes,
    pedidosDelDia,
    movimientosDelDia,
    ventasDelDia,
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
      where: { estado: { in: ["PENDIENTE", "CONFIRMADO", "PREPARANDO", "LISTO"] } },
    }),
    prisma.pedido.count({ where: { createdAt: { gte: inicio, lt: fin } } }),
    prisma.movimientoStock.count({
      where: { createdAt: { gte: inicio, lt: fin } },
    }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: inicio, lt: fin },
        estado: { not: "CANCELADO" },
      },
    }),
  ]);

  return {
    productosActivos,
    productosSinStock,
    productosStockBajo,
    pedidosPendientes,
    pedidosDelDia,
    movimientosDelDia,
    totalVendidoHoy: Number(ventasDelDia._sum.total ?? 0),
  };
}
