import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { mensajeConflictoUnico } from "@/lib/errores/mensajeConflictoUnico";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { UnidadVenta } from "@/generated/prisma/enums";

export type DatosProducto = {
  nombre: string;
  descripcion?: string;
  sku: string | null;
  barcode?: string;
  categoriaId: string;
  unidadVenta: UnidadVenta;
  stockMinimo: number;
  unidadesPorBulto: number;
  precios: { metodoPagoId: string; precio: number }[];
  proveedorIds: string[];
  proveedorPrincipalId?: string;
  imagen?: { url: string; publicId: string };
};

export async function crearProducto(
  datos: DatosProducto & { stockInicial: number },
  usuarioId: string,
): Promise<{ id: string }> {
  if (datos.sku) {
    const skuExistente = await prisma.producto.findUnique({
      where: { sku: datos.sku },
      select: { id: true },
    });

    if (skuExistente) {
      throw new ErrorNegocio("Ya existe un producto con ese SKU.");
    }
  }

  if (datos.barcode) {
    const barcodeExistente = await prisma.producto.findUnique({
      where: { barcode: datos.barcode },
      select: { id: true },
    });

    if (barcodeExistente) {
      throw new ErrorNegocio("Ya existe un producto con ese código de barras.");
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          nombre: datos.nombre,
          descripcion: datos.descripcion ?? null,
          sku: datos.sku,
          barcode: datos.barcode ?? null,
          categoriaId: datos.categoriaId,
          unidadVenta: datos.unidadVenta,
          stockActual: datos.stockInicial,
          stockMinimo: datos.stockMinimo,
          unidadesPorBulto: datos.unidadesPorBulto,
          imageUrl: datos.imagen?.url ?? null,
          imagePublicId: datos.imagen?.publicId ?? null,
          precios: {
            create: datos.precios.map((precio) => ({
              metodoPagoId: precio.metodoPagoId,
              precio: precio.precio,
            })),
          },
          proveedores:
            datos.proveedorIds.length > 0
              ? {
                  create: datos.proveedorIds.map((proveedorId) => ({
                    proveedorId,
                    esPrincipal: proveedorId === datos.proveedorPrincipalId,
                  })),
                }
              : undefined,
        },
      });

      if (datos.stockInicial > 0) {
        await tx.movimientoStock.create({
          data: {
            productoId: producto.id,
            tipo: "INGRESO",
            cantidad: datos.stockInicial,
            stockAnterior: 0,
            stockPosterior: datos.stockInicial,
            usuarioId,
            motivo: "Stock inicial",
          },
        });
      }

      await registrarAuditoria(
        {
          usuarioId,
          accion: ACCIONES_AUDITORIA.PRODUCTO_CREADO,
          entidad: "Producto",
          entidadId: producto.id,
          datos: {
            nombre: datos.nombre,
            sku: datos.sku,
            barcode: datos.barcode ?? null,
            unidadVenta: datos.unidadVenta,
            stockInicial: datos.stockInicial,
          },
        },
        tx,
      );

      if (datos.imagen) {
        await registrarAuditoria(
          {
            usuarioId,
            accion: ACCIONES_AUDITORIA.IMAGEN_AGREGADA,
            entidad: "Producto",
            entidadId: producto.id,
            datos: { publicId: datos.imagen.publicId },
          },
          tx,
        );
      }

      return { id: producto.id };
    });
  } catch (error) {
    const mensaje = mensajeConflictoUnico(error, {
      barcode: "Ya existe un producto con ese código de barras.",
      sku: "Ya existe un producto con ese SKU.",
    });

    if (mensaje) throw new ErrorNegocio(mensaje);
    throw error;
  }
}
