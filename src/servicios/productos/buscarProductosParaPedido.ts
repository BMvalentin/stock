import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { TipoPrecio, UnidadVenta } from "@/generated/prisma/enums";

export type ReglaPrecioParaPedido = {
  metodoPagoId: string | null;
  cantidadDesde: number;
  cantidadHasta: number | null;
  tipoPrecio: TipoPrecio;
  precio: number;
};

export type ModalidadParaPedido = {
  id: string;
  nombre: string;
  unidadVenta: UnidadVenta;
  contenido: number | null;
  etiquetaPresentacion: string | null;
  esBase: boolean;
  reglas: ReglaPrecioParaPedido[];
};

export type ProductoParaPedido = {
  id: string;
  nombre: string;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unidadStock: UnidadVenta;
  stockActual: number;
  modalidades: ModalidadParaPedido[];
};

const LIMITE = 10;

function mapearModalidades(
  modalidades: {
    id: string;
    nombre: string;
    unidadVenta: UnidadVenta;
    contenido: Prisma.Decimal | null;
    etiquetaPresentacion: string | null;
    esBase: boolean;
    reglas: {
      metodoPagoId: string | null;
      cantidadDesde: Prisma.Decimal;
      cantidadHasta: Prisma.Decimal | null;
      tipoPrecio: TipoPrecio;
      precio: Prisma.Decimal;
    }[];
  }[],
): ModalidadParaPedido[] {
  return modalidades.map((modalidad) => ({
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
  }));
}

// Busca productos activos por nombre, SKU o código de barras para agregarlos a
// un pedido. Devuelve modalidades y reglas; el precio definitivo lo resuelve el
// servidor al crear el pedido.
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

  return productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    barcode: producto.barcode,
    imageUrl: producto.imageUrl,
    unidadStock: producto.unidadStock,
    stockActual: Number(producto.stockActual),
    modalidades: mapearModalidades(producto.modalidades),
  }));
}
