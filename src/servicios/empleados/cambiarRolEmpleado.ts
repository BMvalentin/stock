import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { Rol } from "@/generated/prisma/enums";

// Cambia el rol de un empleado. Impide quitar el rol al último administrador
// activo. El cambio se ejecuta y se autoriza siempre en el servidor.
export async function cambiarRolEmpleado(
  id: string,
  nuevoRol: Rol,
  usuarioId: string,
): Promise<void> {
  const empleado = await prisma.user.findUnique({
    where: { id },
    select: { id: true, rol: true, email: true },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  if (empleado.rol === nuevoRol) {
    throw new ErrorNegocio("El empleado ya tiene ese rol.");
  }

  if (empleado.rol === "ADMIN" && nuevoRol === "EMPLEADO") {
    const administradores = await prisma.user.count({
      where: { rol: "ADMIN", activo: true },
    });

    if (administradores <= 1) {
      throw new ErrorNegocio(
        "No se puede quitar el rol al último administrador activo.",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { rol: nuevoRol } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.EMPLEADO_ROL_CAMBIADO,
        entidad: "User",
        entidadId: id,
        datos: {
          email: empleado.email,
          rolAnterior: empleado.rol,
          rolNuevo: nuevoRol,
        },
      },
      tx,
    );
  });
}
