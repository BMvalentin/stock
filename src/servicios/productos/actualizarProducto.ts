import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { DatosProducto } from "@/servicios/productos/crearProducto";

export async function actualizarProducto(
  id: string,
  datos: DatosProducto,
  usuarioId: string,
): Promise<void> {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      precios: { select: { id: true, metodoPagoId: true, precio: true } },
      proveedores: {
        select: { id: true, proveedorId: true, esPrincipal: true },
      },
    },
  });

  if (!producto) {
    throw new ErrorNegocio("El producto no existe.");
  }

  const skuDuplicado = await prisma.producto.findFirst({
    where: { sku: datos.sku, NOT: { id } },
    select: { id: true },
  });

  if (skuDuplicado) {
    throw new ErrorNegocio("Ya existe otro producto con ese SKU.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.producto.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion ?? null,
        sku: datos.sku,
        categoriaId: datos.categoriaId,
        stockMinimo: datos.stockMinimo,
        unidadesPorBulto: datos.unidadesPorBulto,
      },
    });

    for (const precio of datos.precios) {
      const existente = producto.precios.find(
        (actual) => actual.metodoPagoId === precio.metodoPagoId,
      );

      if (!existente) {
        await tx.precioProducto.create({
          data: {
            productoId: id,
            metodoPagoId: precio.metodoPagoId,
            precio: precio.precio,
          },
        });
        continue;
      }

      const anterior = Number(existente.precio);

      if (anterior === precio.precio) continue;

      await tx.precioProducto.update({
        where: { id: existente.id },
        data: { precio: precio.precio },
      });

      await tx.precioProductoHistorial.create({
        data: {
          productoId: id,
          metodoPagoId: precio.metodoPagoId,
          precioAnterior: anterior,
          precioNuevo: precio.precio,
          usuarioId,
        },
      });

      await registrarAuditoria(
        {
          usuarioId,
          accion: ACCIONES_AUDITORIA.PRECIO_MODIFICADO,
          entidad: "Producto",
          entidadId: id,
          datos: {
            metodoPagoId: precio.metodoPagoId,
            precioAnterior: anterior,
            precioNuevo: precio.precio,
          },
        },
        tx,
      );
    }

    // Proveedores: se preservan los datos de costo/código de los vínculos
    // existentes; solo se actualiza el principal y se agregan o quitan.
    const vinculosActuales = new Map(
      producto.proveedores.map((vinculo) => [vinculo.proveedorId, vinculo]),
    );

    for (const proveedorId of datos.proveedorIds) {
      const esPrincipal = proveedorId === datos.proveedorPrincipalId;
      const vinculo = vinculosActuales.get(proveedorId);

      if (vinculo) {
        if (vinculo.esPrincipal !== esPrincipal) {
          await tx.productoProveedor.update({
            where: { id: vinculo.id },
            data: { esPrincipal },
          });
        }
        continue;
      }

      await tx.productoProveedor.create({
        data: { productoId: id, proveedorId, esPrincipal },
      });
    }

    const aEliminar = producto.proveedores
      .filter((vinculo) => !datos.proveedorIds.includes(vinculo.proveedorId))
      .map((vinculo) => vinculo.id);

    if (aEliminar.length > 0) {
      await tx.productoProveedor.deleteMany({
        where: { id: { in: aEliminar } },
      });
    }

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PRODUCTO_EDITADO,
        entidad: "Producto",
        entidadId: id,
        datos: { nombre: datos.nombre, sku: datos.sku },
      },
      tx,
    );
  });
}
