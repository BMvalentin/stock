import { prisma } from "@/lib/prisma/cliente";
import type { PrecioListado } from "@/servicios/productos/listarProductos";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type ProductoParaPedido = {
  id: string;
  nombre: string;
  sku: string;
  barcode: string | null;
  unidadVenta: UnidadVenta;
  stockActual: number;
  precios: PrecioListado[];
};

const LIMITE = 10;

// Busca productos activos por nombre, SKU o código de barras para agregarlos a
// un pedido. Devuelve los datos necesarios para mostrarlos y cotizarlos; el
// precio definitivo lo resuelve el servidor al crear el pedido.
export async function buscarProductosParaPedido(
  busqueda: string,
): Promise<ProductoParaPedido[]> {
  const termino = busqueda.trim();

  if (termino.length < 2) return [];

  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: termino } },
        { sku: { contains: termino } },
        { barcode: { contains: termino } },
      ],
    },
    orderBy: { nombre: "asc" },
    take: LIMITE,
    select: {
      id: true,
      nombre: true,
      sku: true,
      barcode: true,
      unidadVenta: true,
      stockActual: true,
      precios: {
        where: { activo: true },
        select: {
          metodoPagoId: true,
          precio: true,
          metodoPago: { select: { nombre: true, codigo: true } },
        },
      },
    },
  });

  return productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    barcode: producto.barcode,
    unidadVenta: producto.unidadVenta,
    stockActual: Number(producto.stockActual),
    precios: producto.precios.map((precio) => ({
      metodoPagoId: precio.metodoPagoId,
      metodo: precio.metodoPago.nombre,
      codigo: precio.metodoPago.codigo,
      precio: Number(precio.precio),
    })),
  }));
}
