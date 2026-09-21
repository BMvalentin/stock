import { prisma } from "@/lib/prisma/cliente";

export type ReporteStock = {
  productosActivos: number;
  sinStock: number;
  stockBajo: number;
  unidadesTotales: number;
};

// Estado actual del inventario para el reporte de stock.
export async function obtenerReporteStock(): Promise<ReporteStock> {
  const [productosActivos, sinStock, stockBajo, unidades] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.producto.count({ where: { activo: true, stockActual: { lte: 0 } } }),
    prisma.producto.count({
      where: {
        activo: true,
        stockActual: { gt: 0, lte: prisma.producto.fields.stockMinimo },
      },
    }),
    prisma.producto.aggregate({
      _sum: { stockActual: true },
      where: { activo: true },
    }),
  ]);

  return {
    productosActivos,
    sinStock,
    stockBajo,
    unidadesTotales: Number(unidades._sum.stockActual ?? 0),
  };
}
