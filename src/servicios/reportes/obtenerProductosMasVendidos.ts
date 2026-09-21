import { prisma } from "@/lib/prisma/cliente";

export type ProductoMasVendido = {
  productoId: string;
  nombre: string;
  cantidad: number;
  total: number;
};

// Productos más vendidos del período según las líneas de pedido. Usa el precio
// congelado en DetallePedido y excluye pedidos cancelados.
export async function obtenerProductosMasVendidos(
  desde: Date,
  hasta: Date,
  limite = 10,
): Promise<ProductoMasVendido[]> {
  const agrupado = await prisma.detallePedido.groupBy({
    by: ["productoId"],
    _sum: { cantidad: true, subtotal: true },
    where: {
      pedido: {
        createdAt: { gte: desde, lte: hasta },
        estado: { not: "CANCELADO" },
      },
    },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limite,
  });

  if (agrupado.length === 0) return [];

  const productos = await prisma.producto.findMany({
    where: { id: { in: agrupado.map((fila) => fila.productoId) } },
    select: { id: true, nombre: true },
  });
  const nombres = new Map(productos.map((producto) => [producto.id, producto.nombre]));

  return agrupado.map((fila) => ({
    productoId: fila.productoId,
    nombre: nombres.get(fila.productoId) ?? "Producto",
    cantidad: Number(fila._sum.cantidad ?? 0),
    total: Number(fila._sum.subtotal ?? 0),
  }));
}
