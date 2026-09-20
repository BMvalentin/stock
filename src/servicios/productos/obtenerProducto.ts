import { prisma } from "@/lib/prisma/cliente";

export type PrecioDetalle = {
  metodoPagoId: string;
  metodo: string;
  codigo: string;
  precio: number;
};

export type ProveedorDeProducto = {
  id: string;
  nombre: string;
  esPrincipal: boolean;
};

export type ProductoDetalle = {
  id: string;
  nombre: string;
  descripcion: string | null;
  sku: string;
  activo: boolean;
  stockActual: number;
  stockMinimo: number;
  unidadesPorBulto: number;
  categoriaId: string;
  categoria: string;
  precios: PrecioDetalle[];
  proveedores: ProveedorDeProducto[];
};

export async function obtenerProducto(
  id: string,
): Promise<ProductoDetalle | null> {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      sku: true,
      activo: true,
      stockActual: true,
      stockMinimo: true,
      unidadesPorBulto: true,
      categoriaId: true,
      categoria: { select: { nombre: true } },
      precios: {
        select: {
          metodoPagoId: true,
          precio: true,
          metodoPago: { select: { nombre: true, codigo: true } },
        },
      },
      proveedores: {
        select: {
          esPrincipal: true,
          proveedor: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  if (!producto) return null;

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    sku: producto.sku,
    activo: producto.activo,
    stockActual: producto.stockActual,
    stockMinimo: producto.stockMinimo,
    unidadesPorBulto: producto.unidadesPorBulto,
    categoriaId: producto.categoriaId,
    categoria: producto.categoria.nombre,
    precios: producto.precios.map((precio) => ({
      metodoPagoId: precio.metodoPagoId,
      metodo: precio.metodoPago.nombre,
      codigo: precio.metodoPago.codigo,
      precio: Number(precio.precio),
    })),
    proveedores: producto.proveedores.map((vinculo) => ({
      id: vinculo.proveedor.id,
      nombre: vinculo.proveedor.nombre,
      esPrincipal: vinculo.esPrincipal,
    })),
  };
}
