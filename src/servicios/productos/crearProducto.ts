import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { mensajeConflictoUnico } from "@/lib/errores/mensajeConflictoUnico";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { guardarModalidadesProducto } from "@/servicios/productos/guardarModalidadesProducto";
import { derivarUnidadStock } from "@/lib/utilidades/derivarUnidadStock";
import type { ModalidadEntrada } from "@/tipos/producto";

export type DatosProducto = {
  nombre: string;
  descripcion?: string;
  sku: string | null;
  barcode?: string;
  categoriaId: string;
  stockMinimo: number;
  unidadesPorBulto: number;
  // Modalidades de venta con sus reglas de precio. Al menos una.
  modalidades: ModalidadEntrada[];
  proveedorIds: string[];
  proveedorPrincipalId?: string;
  imagen?: { url: string; publicId: string };
};

// Unidad canónica del stock: si el producto tiene alguna modalidad por
// kilogramo, el stock se lleva en kg; si no, en unidades.
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
    return await prisma.$transaction(
      async (tx) => {
      const producto = await tx.producto.create({
        data: {
          nombre: datos.nombre,
          descripcion: datos.descripcion ?? null,
          sku: datos.sku,
          barcode: datos.barcode ?? null,
          categoriaId: datos.categoriaId,
          unidadStock: derivarUnidadStock(datos.modalidades),
          stockActual: datos.stockInicial,
          stockMinimo: datos.stockMinimo,
          unidadesPorBulto: datos.unidadesPorBulto,
          imageUrl: datos.imagen?.url ?? null,
          imagePublicId: datos.imagen?.publicId ?? null,
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

      await guardarModalidadesProducto(
        tx,
        producto.id,
        datos.modalidades,
        usuarioId,
      );

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
            unidadStock: derivarUnidadStock(datos.modalidades),
            modalidades: datos.modalidades.length,
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
    },
    // Las modalidades y sus reglas agregan varias consultas; en bases remotas el
    // timeout por defecto (5 s) puede resultar insuficiente.
    { timeout: 30_000 },
  );
  } catch (error) {
    const mensaje = mensajeConflictoUnico(error, {
      barcode: "Ya existe un producto con ese código de barras.",
      sku: "Ya existe un producto con ese SKU.",
    });

    if (mensaje) throw new ErrorNegocio(mensaje);
    throw error;
  }
}
