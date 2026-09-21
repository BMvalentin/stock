import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Anula una producción. Se elimina el registro y se conserva la traza completa
// en la auditoría. No se permite si pertenece a una liquidación cerrada.
export async function anularProduccion(
  produccionId: string,
  usuarioId: string,
): Promise<{ userId: string }> {
  const produccion = await prisma.empleadoProduccion.findUnique({
    where: { id: produccionId },
    select: {
      id: true,
      empleadoId: true,
      productoId: true,
      fecha: true,
      cantidad: true,
      precioUnidad: true,
      total: true,
      liquidacionId: true,
      liquidacion: { select: { estado: true } },
      empleado: { select: { userId: true } },
    },
  });

  if (!produccion) {
    throw new ErrorNegocio("La producción no existe.");
  }

  if (
    produccion.liquidacionId &&
    produccion.liquidacion?.estado !== "ABIERTA"
  ) {
    throw new ErrorNegocio(
      "La producción pertenece a una liquidación cerrada. Anulá la liquidación primero.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.empleadoProduccion.delete({ where: { id: produccionId } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PRODUCCION_ANULADA,
        entidad: "EmpleadoProduccion",
        entidadId: produccionId,
        datos: {
          empleadoId: produccion.empleadoId,
          productoId: produccion.productoId,
          fecha: produccion.fecha.toISOString().slice(0, 10),
          cantidad: produccion.cantidad,
          precioUnidad: produccion.precioUnidad.toString(),
          total: produccion.total.toString(),
        },
      },
      tx,
    );
  });

  return { userId: produccion.empleado.userId };
}
