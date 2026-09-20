import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Activa o desactiva un empleado. No se elimina físicamente para no romper
// relaciones históricas (pedidos, movimientos, auditoría).
export async function cambiarEstadoEmpleado(
  id: string,
  activo: boolean,
  usuarioId: string,
): Promise<void> {
  const empleado = await prisma.user.findUnique({
    where: { id },
    select: { id: true, rol: true, email: true },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  if (!activo) {
    if (id === usuarioId) {
      throw new ErrorNegocio("No podés desactivar tu propio usuario.");
    }

    if (empleado.rol === "ADMIN") {
      const administradores = await prisma.user.count({
        where: { rol: "ADMIN", activo: true },
      });

      if (administradores <= 1) {
        throw new ErrorNegocio(
          "No se puede desactivar al último administrador activo.",
        );
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { activo } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.EMPLEADO_DESACTIVADO,
        entidad: "User",
        entidadId: id,
        datos: { email: empleado.email, activo },
      },
      tx,
    );
  });
}
