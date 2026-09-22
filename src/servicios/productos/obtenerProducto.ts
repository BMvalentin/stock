import { prisma } from "@/lib/prisma/cliente";
import type { TipoPrecio, UnidadVenta } from "@/generated/prisma/enums";

export type ReglaPrecioDetalle = {
  id: string;
  metodoPagoId: string | null;
  metodoPagoNombre: string | null;
  cantidadDesde: number;
  cantidadHasta: number | null;
  tipoPrecio: TipoPrecio;
  precio: number;
  activo: boolean;
};

export type ModalidadDetalle = {
  id: string;
  nombre: string;
  unidadVenta: UnidadVenta;
  contenido: number | null;
  etiquetaPresentacion: string | null;
  esBase: boolean;
  activo: boolean;
  orden: number;
  reglas: ReglaPrecioDetalle[];
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
  sku: string | null;
  barcode: string | null;
  activo: boolean;
  unidadStock: UnidadVenta;
  stockActual: number;
  stockMinimo: number;
  unidadesPorBulto: number;
  categoriaId: string;
  categoria: string;
  imageUrl: string | null;
  modalidades: ModalidadDetalle[];
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
      unidadStock: true,
      stockActual: true,
      stockMinimo: true,
      unidadesPorBulto: true,
      categoriaId: true,
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
          activo: true,
          orden: true,
          reglas: {
            where: { activo: true },
            orderBy: [{ cantidadDesde: "asc" }, { precio: "asc" }],
            select: {
              id: true,
              metodoPagoId: true,
              cantidadDesde: true,
              cantidadHasta: true,
              tipoPrecio: true,
              precio: true,
              activo: true,
              metodoPago: { select: { nombre: true } },
            },
          },
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
    unidadStock: producto.unidadStock,
    stockActual: Number(producto.stockActual),
    stockMinimo: Number(producto.stockMinimo),
    unidadesPorBulto: producto.unidadesPorBulto,
    categoriaId: producto.categoriaId,
    categoria: producto.categoria.nombre,
    imageUrl: producto.imageUrl,
    modalidades: producto.modalidades.map((modalidad) => ({
      id: modalidad.id,
      nombre: modalidad.nombre,
      unidadVenta: modalidad.unidadVenta,
      contenido:
        modalidad.contenido === null ? null : Number(modalidad.contenido),
      etiquetaPresentacion: modalidad.etiquetaPresentacion,
      esBase: modalidad.esBase,
      activo: modalidad.activo,
      orden: modalidad.orden,
      reglas: modalidad.reglas.map((regla) => ({
        id: regla.id,
        metodoPagoId: regla.metodoPagoId,
        metodoPagoNombre: regla.metodoPago?.nombre ?? null,
        cantidadDesde: Number(regla.cantidadDesde),
        cantidadHasta:
          regla.cantidadHasta === null ? null : Number(regla.cantidadHasta),
        tipoPrecio: regla.tipoPrecio,
        precio: Number(regla.precio),
        activo: regla.activo,
      })),
    })),
    proveedores: producto.proveedores.map((vinculo) => ({
      id: vinculo.proveedor.id,
      nombre: vinculo.proveedor.nombre,
      esPrincipal: vinculo.esPrincipal,
    })),
  };
}
