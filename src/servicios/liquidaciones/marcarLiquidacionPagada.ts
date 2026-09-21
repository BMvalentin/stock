import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Marca una liquidación calculada como pagada. No registra el pago bancario:
// representa que el comercio ya le pagó al empleado.
export async function marcarLiquidacionPagada(
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

  if (liquidacion.estado !== "CALCULADA") {
    throw new ErrorNegocio(
      "Solo una liquidación calculada puede marcarse como pagada.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.empleadoLiquidacion.update({
      where: { id: liquidacionId },
      data: { estado: "PAGADA", pagadaEn: new Date() },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.LIQUIDACION_PAGADA,
        entidad: "EmpleadoLiquidacion",
        entidadId: liquidacionId,
        datos: { total: liquidacion.total.toString() },
      },
      tx,
    );
  });

  return { userId: liquidacion.empleado.userId };
}
