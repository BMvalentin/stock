import { prisma } from "@/lib/prisma/cliente";
import type { PrecioListado } from "@/servicios/productos/listarProductos";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type ProductoPorBarcode = {
  id: string;
  nombre: string;
  sku: string;
  barcode: string;
  activo: boolean;
  unidadVenta: UnidadVenta;
  stockActual: number;
  stockMinimo: number;
  categoria: string;
  imageUrl: string | null;
  precios: PrecioListado[];
};

// Búsqueda directa por código de barras (índice único). Devuelve solo los
// campos necesarios para identificar el producto; nunca datos sensibles.
export async function buscarProductoPorBarcode(
  barcode: string,
): Promise<ProductoPorBarcode | null> {
  const producto = await prisma.producto.findUnique({
    where: { barcode },
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
    },
  });

  if (!producto || !producto.barcode) return null;

  return {
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
  };
}
