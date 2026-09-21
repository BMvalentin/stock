import { prisma } from "@/lib/prisma/cliente";

export type ProductoCritico = {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
};

// Productos activos cuyo stock está en el mínimo o por debajo, priorizando los
// de menor stock. Alimenta la lista de "requiere atención" del dashboard.
export async function obtenerProductosCriticos(
  limite = 6,
): Promise<ProductoCritico[]> {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      stockActual: { lte: prisma.producto.fields.stockMinimo },
    },
    orderBy: [{ stockActual: "asc" }, { nombre: "asc" }],
    take: limite,
    select: {
      id: true,
      nombre: true,
      sku: true,
      stockActual: true,
      stockMinimo: true,
      categoria: { select: { nombre: true } },
    },
  });

  return productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    categoria: producto.categoria.nombre,
    stockActual: Number(producto.stockActual),
    stockMinimo: Number(producto.stockMinimo),
  }));
}
