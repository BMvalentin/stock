import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export async function cambiarEstadoProveedor(
  id: string,
  activo: boolean,
  usuarioId: string,
): Promise<void> {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!proveedor) {
    throw new ErrorNegocio("El proveedor no existe.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.proveedor.update({ where: { id }, data: { activo } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: activo
          ? ACCIONES_AUDITORIA.PROVEEDOR_EDITADO
          : ACCIONES_AUDITORIA.PROVEEDOR_DESACTIVADO,
        entidad: "Proveedor",
        entidadId: id,
        datos: { nombre: proveedor.nombre, activo },
      },
      tx,
    );
  });
}
