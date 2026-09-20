import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export type DatosProducto = {
  nombre: string;
  descripcion?: string;
  sku: string;
  categoriaId: string;
  stockMinimo: number;
  unidadesPorBulto: number;
  precios: { metodoPagoId: string; precio: number }[];
  proveedorIds: string[];
  proveedorPrincipalId?: string;
};

export async function crearProducto(
  datos: DatosProducto & { stockInicial: number },
  usuarioId: string,
): Promise<{ id: string }> {
  const skuExistente = await prisma.producto.findUnique({
    where: { sku: datos.sku },
    select: { id: true },
  });

  if (skuExistente) {
    throw new ErrorNegocio("Ya existe un producto con ese SKU.");
  }

  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion ?? null,
        sku: datos.sku,
        categoriaId: datos.categoriaId,
        stockActual: datos.stockInicial,
        stockMinimo: datos.stockMinimo,
        unidadesPorBulto: datos.unidadesPorBulto,
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
          stockInicial: datos.stockInicial,
        },
      },
      tx,
    );

    return { id: producto.id };
  });
}
