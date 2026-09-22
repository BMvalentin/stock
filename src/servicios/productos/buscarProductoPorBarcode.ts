import { prisma } from "@/lib/prisma/cliente";
import type { ProductoParaPedido } from "@/servicios/productos/buscarProductosParaPedido";

export type { ProductoParaPedido as ProductoPorBarcode };

// Búsqueda directa por código de barras (índice único). Devuelve el producto con
// sus modalidades y reglas de precio; nunca datos sensibles.
export async function buscarProductoPorBarcode(
  barcode: string,
): Promise<ProductoParaPedido | null> {
  const producto = await prisma.producto.findUnique({
    where: { barcode },
    select: {
      id: true,
      nombre: true,
      sku: true,
      barcode: true,
      activo: true,
      imageUrl: true,
      unidadStock: true,
      stockActual: true,
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
            orderBy: [{ cantidadDesde: "asc" }, { precio: "asc" }],
            select: {
              metodoPagoId: true,
              cantidadDesde: true,
              cantidadHasta: true,
              tipoPrecio: true,
              precio: true,
            },
          },
        },
      },
    },
  });

  if (!producto || !producto.barcode || !producto.activo) return null;

  return {
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    barcode: producto.barcode,
    imageUrl: producto.imageUrl,
    unidadStock: producto.unidadStock,
    stockActual: Number(producto.stockActual),
    modalidades: producto.modalidades.map((modalidad) => ({
      id: modalidad.id,
      nombre: modalidad.nombre,
      unidadVenta: modalidad.unidadVenta,
      contenido:
        modalidad.contenido === null ? null : Number(modalidad.contenido),
      etiquetaPresentacion: modalidad.etiquetaPresentacion,
      esBase: modalidad.esBase,
      reglas: modalidad.reglas.map((regla) => ({
        metodoPagoId: regla.metodoPagoId,
        cantidadDesde: Number(regla.cantidadDesde),
        cantidadHasta:
          regla.cantidadHasta === null ? null : Number(regla.cantidadHasta),
        tipoPrecio: regla.tipoPrecio,
        precio: Number(regla.precio),
      })),
    })),
  };
}
