import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { mensajeConflictoUnico } from "@/lib/errores/mensajeConflictoUnico";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { guardarModalidadesProducto } from "@/servicios/productos/guardarModalidadesProducto";
import { derivarUnidadStock } from "@/lib/utilidades/derivarUnidadStock";
import { filtrarSkuDuplicado } from "@/servicios/productos/filtrarSkuDuplicado";
import type { DatosProducto } from "@/servicios/productos/crearProducto";

// Operación de imagen solicitada al editar un producto. `mantener` no toca la
// imagen; `establecer` la agrega o reemplaza; `eliminar` la quita. El recurso
// nuevo se sube antes de la transacción y el anterior se elimina después.
export type OperacionImagenProducto =
  | { tipo: "mantener" }
  | { tipo: "establecer"; url: string; publicId: string }
  | { tipo: "eliminar" };

export async function actualizarProducto(
  id: string,
  datos: DatosProducto,
  usuarioId: string,
  imagen: OperacionImagenProducto = { tipo: "mantener" },
): Promise<{ publicIdAnterior: string | null }> {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      imagePublicId: true,
      proveedores: {
        select: { id: true, proveedorId: true, esPrincipal: true },
      },
    },
  });

  if (!producto) {
    throw new ErrorNegocio("El producto no existe.");
  }

  const filtroSku = filtrarSkuDuplicado(datos.sku, id);

  if (filtroSku) {
    const skuDuplicado = await prisma.producto.findFirst({
      where: filtroSku,
      select: { id: true },
    });

    if (skuDuplicado) {
      throw new ErrorNegocio("Ya existe otro producto con ese SKU.");
    }
  }

  if (datos.barcode) {
    const barcodeDuplicado = await prisma.producto.findFirst({
      where: { barcode: datos.barcode, NOT: { id } },
      select: { id: true },
    });

    if (barcodeDuplicado) {
      throw new ErrorNegocio(
        "Ya existe otro producto con ese código de barras.",
      );
    }
  }

  const publicIdAnterior = await prisma
    .$transaction(async (tx) => {
      await tx.producto.update({
        where: { id },
        data: {
          nombre: datos.nombre,
          descripcion: datos.descripcion ?? null,
          sku: datos.sku,
          barcode: datos.barcode ?? null,
          categoriaId: datos.categoriaId,
          unidadStock: derivarUnidadStock(datos.modalidades),
          stockMinimo: datos.stockMinimo,
          unidadesPorBulto: datos.unidadesPorBulto,
        },
      });

      await guardarModalidadesProducto(tx, id, datos.modalidades, usuarioId);

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

      // Imagen: la subida a Cloudinary ya ocurrió fuera de la transacción para
      // no bloquear la conexión a la base de datos. Aquí solo se persiste la
      // referencia; el recurso anterior se elimina después del commit.
      if (imagen.tipo === "establecer") {
        await tx.producto.update({
          where: { id },
          data: { imageUrl: imagen.url, imagePublicId: imagen.publicId },
        });

        await registrarAuditoria(
          {
            usuarioId,
            accion: producto.imagePublicId
              ? ACCIONES_AUDITORIA.IMAGEN_REEMPLAZADA
              : ACCIONES_AUDITORIA.IMAGEN_AGREGADA,
            entidad: "Producto",
            entidadId: id,
            datos: {
              publicId: imagen.publicId,
              publicIdAnterior: producto.imagePublicId ?? null,
            },
          },
          tx,
        );
      } else if (imagen.tipo === "eliminar") {
        await tx.producto.update({
          where: { id },
          data: { imageUrl: null, imagePublicId: null },
        });

        await registrarAuditoria(
          {
            usuarioId,
            accion: ACCIONES_AUDITORIA.IMAGEN_ELIMINADA,
            entidad: "Producto",
            entidadId: id,
            datos: { publicIdAnterior: producto.imagePublicId ?? null },
          },
          tx,
        );
      }

      await registrarAuditoria(
        {
          usuarioId,
          accion: ACCIONES_AUDITORIA.PRODUCTO_EDITADO,
          entidad: "Producto",
          entidadId: id,
          datos: {
            nombre: datos.nombre,
            sku: datos.sku,
            barcode: datos.barcode ?? null,
            modalidades: datos.modalidades.length,
          },
        },
        tx,
      );

      return imagen.tipo === "mantener"
        ? null
        : (producto.imagePublicId ?? null);
    },
    // Las modalidades y sus reglas agregan varias consultas; en bases remotas el
    // timeout por defecto (5 s) puede resultar insuficiente.
    { timeout: 30_000 },
  )
    .catch((error) => {
      const mensaje = mensajeConflictoUnico(error, {
        barcode: "Ya existe otro producto con ese código de barras.",
        sku: "Ya existe otro producto con ese SKU.",
      });

      if (mensaje) throw new ErrorNegocio(mensaje);
      throw error;
    });

  return { publicIdAnterior };
}
