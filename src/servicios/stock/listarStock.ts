import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";

export type FiltrosStock = {
  busqueda?: string;
  categoriaId?: string;
  stock?: "SIN_STOCK" | "BAJO" | "NORMAL" | "TODOS";
  orden?: "nombre" | "stock_asc" | "stock_desc";
  pagina: number;
  porPagina: number;
};

export type ProductoStock = {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  actualizado: Date;
};

export type ResultadoStock = {
  productos: ProductoStock[];
  total: number;
};

export async function listarStock(
  filtros: FiltrosStock,
): Promise<ResultadoStock> {
  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
    ...(filtros.busqueda
      ? {
          // `startsWith` en sku/barcode usa los índices únicos; el nombre se
          // busca por contenido (no usa índice btree, aceptable a esta escala).
          OR: [
            { nombre: { contains: filtros.busqueda } },
            { sku: { startsWith: filtros.busqueda } },
            { barcode: { startsWith: filtros.busqueda } },
          ],
        }
      : {}),
    ...(filtros.stock === "SIN_STOCK"
      ? { stockActual: { lte: 0 } }
      : filtros.stock === "BAJO"
        ? { stockActual: { gt: 0, lte: prisma.producto.fields.stockMinimo } }
        : filtros.stock === "NORMAL"
          ? { stockActual: { gt: prisma.producto.fields.stockMinimo } }
          : {}),
  };

  const orden: Prisma.ProductoOrderByWithRelationInput[] =
    filtros.orden === "stock_asc"
      ? [{ stockActual: "asc" }]
      : filtros.orden === "stock_desc"
        ? [{ stockActual: "desc" }]
        : [{ nombre: "asc" }];

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      orderBy: orden,
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        nombre: true,
        sku: true,
        stockActual: true,
        stockMinimo: true,
        updatedAt: true,
        categoria: { select: { nombre: true } },
      },
    }),
  ]);

  return {
    total,
    productos: productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      sku: producto.sku,
      categoria: producto.categoria.nombre,
      stockActual: Number(producto.stockActual),
      stockMinimo: Number(producto.stockMinimo),
      actualizado: producto.updatedAt,
    })),
  };
}
