import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Activa o desactiva una tarifa. La baja es lógica: una tarifa inactiva no se
// usa para nuevas producciones, se conserva para el historial y puede
// reactivarse.
export async function cambiarEstadoTarifaProducto(
  tarifaId: string,
  activo: boolean,
  usuarioId: string,
): Promise<{ userId: string }> {
  const tarifa = await prisma.empleadoTarifaProducto.findUnique({
    where: { id: tarifaId },
    select: {
      id: true,
      empleadoId: true,
      productoId: true,
      activo: true,
      empleado: { select: { userId: true } },
    },
  });

  if (!tarifa) {
    throw new ErrorNegocio("La tarifa no existe.");
  }

  if (tarifa.activo === activo) {
    throw new ErrorNegocio("La tarifa ya tiene ese estado.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.empleadoTarifaProducto.update({
      where: { id: tarifaId },
      data: { activo },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: activo
          ? ACCIONES_AUDITORIA.TARIFA_PRODUCCION_ACTIVADA
          : ACCIONES_AUDITORIA.TARIFA_PRODUCCION_DESACTIVADA,
        entidad: "EmpleadoTarifaProducto",
        entidadId: tarifaId,
        datos: { empleadoId: tarifa.empleadoId, productoId: tarifa.productoId },
      },
      tx,
    );
  });

  return { userId: tarifa.empleado.userId };
}
