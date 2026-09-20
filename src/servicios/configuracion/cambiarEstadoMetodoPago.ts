import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export async function cambiarEstadoMetodoPago(
  id: string,
  activo: boolean,
  usuarioId: string,
): Promise<void> {
  const metodo = await prisma.metodoPago.findUnique({
    where: { id },
    select: { id: true, nombre: true, codigo: true },
  });

  if (!metodo) {
    throw new ErrorNegocio("El método de pago no existe.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.metodoPago.update({ where: { id }, data: { activo } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.METODO_PAGO_EDITADO,
        entidad: "MetodoPago",
        entidadId: id,
        datos: { codigo: metodo.codigo, activo },
      },
      tx,
    );
  });
}
