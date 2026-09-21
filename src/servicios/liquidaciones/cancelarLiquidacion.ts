import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Anula una liquidación calculada o abierta y libera los registros incluidos
// para que puedan volver a liquidarse. Una liquidación pagada no se anula.
export async function cancelarLiquidacion(
  liquidacionId: string,
  usuarioId: string,
): Promise<{ userId: string }> {
  const liquidacion = await prisma.empleadoLiquidacion.findUnique({
    where: { id: liquidacionId },
    select: {
      id: true,
      estado: true,
      total: true,
      empleado: { select: { userId: true } },
    },
  });

  if (!liquidacion) {
    throw new ErrorNegocio("La liquidación no existe.");
  }

  if (
    liquidacion.estado === "PAGADA" ||
    liquidacion.estado === "CANCELADA"
  ) {
    throw new ErrorNegocio(
      "La liquidación no puede anularse en su estado actual.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.empleadoLiquidacion.update({
      where: { id: liquidacionId },
      data: { estado: "CANCELADA" },
    });

    await tx.empleadoAsistencia.updateMany({
      where: { liquidacionId },
      data: { liquidacionId: null },
    });

    await tx.empleadoProduccion.updateMany({
      where: { liquidacionId },
      data: { liquidacionId: null },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.LIQUIDACION_CANCELADA,
        entidad: "EmpleadoLiquidacion",
        entidadId: liquidacionId,
        datos: { total: liquidacion.total.toString() },
      },
      tx,
    );
  });

  return { userId: liquidacion.empleado.userId };
}
