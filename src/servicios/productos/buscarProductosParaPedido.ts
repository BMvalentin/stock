import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { PrecioListado } from "@/servicios/productos/listarProductos";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type ProductoParaPedido = {
  id: string;
  nombre: string;
  sku: string | null;
  barcode: string | null;
  unidadVenta: UnidadVenta;
  permiteVentaSuelta: boolean;
  pesoPresentacionKg: number | null;
  stockActual: number;
  precios: PrecioListado[];
  preciosSuelto: PrecioListado[];
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
        { sku: { startsWith: termino } },
        { barcode: { startsWith: termino } },
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
      permiteVentaSuelta: true,
      pesoPresentacionKg: true,
      stockActual: true,
      precios: {
        where: { activo: true },
        select: {
          metodoPagoId: true,
          precio: true,
          metodoPago: { select: { nombre: true, codigo: true } },
        },
      },
      preciosSuelto: {
        where: { activo: true },
        select: {
          metodoPagoId: true,
          precio: true,
          metodoPago: { select: { nombre: true, codigo: true } },
        },
      },
    },
  });

  const mapearPrecios = (
    precios: {
      metodoPagoId: string;
      precio: Prisma.Decimal;
      metodoPago: { nombre: string; codigo: string };
    }[],
  ): PrecioListado[] =>
    precios.map((precio) => ({
      metodoPagoId: precio.metodoPagoId,
      metodo: precio.metodoPago.nombre,
      codigo: precio.metodoPago.codigo,
      precio: Number(precio.precio),
    }));

  return productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    barcode: producto.barcode,
    unidadVenta: producto.unidadVenta,
    permiteVentaSuelta: producto.permiteVentaSuelta,
    pesoPresentacionKg:
      producto.pesoPresentacionKg === null
        ? null
        : Number(producto.pesoPresentacionKg),
    stockActual: Number(producto.stockActual),
    precios: mapearPrecios(producto.precios),
    preciosSuelto: mapearPrecios(producto.preciosSuelto),
  }));
}
