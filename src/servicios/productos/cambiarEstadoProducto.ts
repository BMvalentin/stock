import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export async function cambiarEstadoProducto(
  id: string,
  activo: boolean,
  usuarioId: string,
): Promise<void> {
  const producto = await prisma.producto.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!producto) {
    throw new ErrorNegocio("El producto no existe.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.producto.update({ where: { id }, data: { activo } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: activo
          ? ACCIONES_AUDITORIA.PRODUCTO_REACTIVADO
          : ACCIONES_AUDITORIA.PRODUCTO_DESACTIVADO,
        entidad: "Producto",
        entidadId: id,
        datos: { nombre: producto.nombre, activo },
      },
      tx,
    );
  });
}
