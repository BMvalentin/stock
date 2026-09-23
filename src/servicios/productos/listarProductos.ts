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

// Resumen de una modalidad para el listado: nombre y precio unitario de
// referencia (la regla `UNITARIO` más básica) para mostrar en la tabla.
export type ModalidadListado = {
  modalidadId: string;
  nombre: string;
  unidadVenta: UnidadVenta;
  contenido: number | null;
  etiquetaPresentacion: string | null;
  esBase: boolean;
  precio: number | null;
};

export type ProductoListado = {
  id: string;
  nombre: string;
  sku: string | null;
  barcode: string | null;
  activo: boolean;
  unidadStock: UnidadVenta;
  stockActual: number;
  stockMinimo: number;
  categoria: string;
  imageUrl: string | null;
  modalidades: ModalidadListado[];
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

function precioReferencia(
  reglas: { metodoPagoId: string | null; tipoPrecio: string; precio: Prisma.Decimal }[],
): number | null {
  const unitarias = reglas.filter((regla) => regla.tipoPrecio === "UNITARIO");
  const elegida =
    unitarias.find((regla) => regla.metodoPagoId === null) ?? unitarias[0];

  return elegida ? Number(elegida.precio) : null;
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
        unidadStock: true,
        stockActual: true,
        stockMinimo: true,
        imageUrl: true,
        categoria: { select: { nombre: true } },
        modalidades: {
          where: { activo: true },
          orderBy: [{ orden: "asc" }, { nombre: "asc" }],
          select: {
            id: true,
            nombre: true,
            unidadVenta: true,
            contenido: true,
            etiquetaPresentacion: true,
            esBase: true,
            reglas: {
              where: { activo: true },
              select: {
                metodoPagoId: true,
                tipoPrecio: true,
                precio: true,
              },
            },
          },
        },
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
      unidadStock: producto.unidadStock,
      stockActual: Number(producto.stockActual),
      stockMinimo: Number(producto.stockMinimo),
      categoria: producto.categoria.nombre,
      imageUrl: producto.imageUrl,
      modalidades: producto.modalidades.map((modalidad) => ({
        modalidadId: modalidad.id,
        nombre: modalidad.nombre,
        unidadVenta: modalidad.unidadVenta,
        contenido:
          modalidad.contenido === null ? null : Number(modalidad.contenido),
        etiquetaPresentacion: modalidad.etiquetaPresentacion,
        esBase: modalidad.esBase,
        precio: precioReferencia(modalidad.reglas),
      })),
    })),
  };
}
