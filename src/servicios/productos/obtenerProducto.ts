import { prisma } from "@/lib/prisma/cliente";
import type { UnidadVenta } from "@/generated/prisma/enums";

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
  barcode: string | null;
  activo: boolean;
  unidadVenta: UnidadVenta;
  stockActual: number;
  stockMinimo: number;
  unidadesPorBulto: number;
  categoriaId: string;
  categoria: string;
  imageUrl: string | null;
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
      barcode: true,
      activo: true,
      unidadVenta: true,
      stockActual: true,
      stockMinimo: true,
      unidadesPorBulto: true,
      categoriaId: true,
      imageUrl: true,
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
    barcode: producto.barcode,
    activo: producto.activo,
    unidadVenta: producto.unidadVenta,
    stockActual: Number(producto.stockActual),
    stockMinimo: Number(producto.stockMinimo),
    unidadesPorBulto: producto.unidadesPorBulto,
    categoriaId: producto.categoriaId,
    categoria: producto.categoria.nombre,
    imageUrl: producto.imageUrl,
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
