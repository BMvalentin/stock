import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type FiltrosProductos = {
  busqueda?: string;
  categoriaId?: string;
  proveedorId?: string;
  estado?: "ACTIVOS" | "INACTIVOS" | "TODOS";
  stock?: "SIN_STOCK" | "BAJO" | "NORMAL" | "TODOS";
  orden?: "nombre" | "stock_asc" | "stock_desc" | "recientes";
  pagina: number;
  porPagina: number;
};

export type PrecioListado = {
  metodoPagoId: string;
  metodo: string;
  codigo: string;
  precio: number;
};

export type ProductoListado = {
  id: string;
  nombre: string;
  sku: string;
  barcode: string | null;
  activo: boolean;
  unidadVenta: UnidadVenta;
  stockActual: number;
  stockMinimo: number;
  categoria: string;
  imageUrl: string | null;
  precios: PrecioListado[];
  cantidadProveedores: number;
};

export type ResultadoProductos = {
  productos: ProductoListado[];
  total: number;
};

function construirWhere(filtros: FiltrosProductos): Prisma.ProductoWhereInput {
  return {
    ...(filtros.estado === "ACTIVOS"
      ? { activo: true }
      : filtros.estado === "INACTIVOS"
        ? { activo: false }
        : {}),
    ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
    ...(filtros.proveedorId
      ? { proveedores: { some: { proveedorId: filtros.proveedorId } } }
      : {}),
    ...(filtros.busqueda
      ? {
          OR: [
            { nombre: { contains: filtros.busqueda } },
            { sku: { contains: filtros.busqueda } },
            { barcode: { contains: filtros.busqueda } },
          ],
        }
      : {}),
    ...(filtros.stock === "SIN_STOCK"
      ? { stockActual: { lte: 0 } }
      : filtros.stock === "BAJO"
        ? {
            stockActual: {
              gt: 0,
              lte: prisma.producto.fields.stockMinimo,
            },
          }
        : filtros.stock === "NORMAL"
          ? { stockActual: { gt: prisma.producto.fields.stockMinimo } }
          : {}),
  };
}

function construirOrden(
  orden: FiltrosProductos["orden"],
): Prisma.ProductoOrderByWithRelationInput[] {
  switch (orden) {
    case "stock_asc":
      return [{ stockActual: "asc" }];
    case "stock_desc":
      return [{ stockActual: "desc" }];
    case "recientes":
      return [{ createdAt: "desc" }];
    default:
      return [{ nombre: "asc" }];
  }
}

export async function listarProductos(
  filtros: FiltrosProductos,
): Promise<ResultadoProductos> {
  const where = construirWhere(filtros);

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      orderBy: construirOrden(filtros.orden),
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        nombre: true,
        sku: true,
        barcode: true,
        activo: true,
        unidadVenta: true,
        stockActual: true,
        stockMinimo: true,
        imageUrl: true,
        categoria: { select: { nombre: true } },
        precios: {
          select: {
            metodoPagoId: true,
            precio: true,
            metodoPago: { select: { nombre: true, codigo: true } },
          },
        },
        _count: { select: { proveedores: true } },
      },
    }),
  ]);

  return {
    total,
    productos: productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      sku: producto.sku,
      barcode: producto.barcode,
      activo: producto.activo,
      unidadVenta: producto.unidadVenta,
      stockActual: Number(producto.stockActual),
      stockMinimo: Number(producto.stockMinimo),
      categoria: producto.categoria.nombre,
      imageUrl: producto.imageUrl,
      precios: producto.precios.map((precio) => ({
        metodoPagoId: precio.metodoPagoId,
        metodo: precio.metodoPago.nombre,
        codigo: precio.metodoPago.codigo,
        precio: Number(precio.precio),
      })),
      cantidadProveedores: producto._count.proveedores,
    })),
  };
}
