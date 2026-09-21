import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { hashearContrasena } from "@/lib/seguridad/hashearContrasena";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { Rol } from "@/generated/prisma/enums";

export type DatosEmpleado = {
  nombre: string;
  email: string;
  contrasena: string;
  rol: Rol;
};

export async function crearEmpleado(
  datos: DatosEmpleado,
  usuarioId: string,
): Promise<{ id: string }> {
  const email = datos.email.trim().toLowerCase();

  const existente = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existente) {
    throw new ErrorNegocio("Ya existe un usuario con ese correo.");
  }

  const passwordHash = await hashearContrasena(datos.contrasena);

  return prisma.$transaction(async (tx) => {
    const empleado = await tx.user.create({
      data: {
        name: datos.nombre,
        email,
        passwordHash,
        rol: datos.rol,
        activo: true,
        empleado: { create: {} },
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.EMPLEADO_CREADO,
        entidad: "User",
        entidadId: empleado.id,
        datos: { email, rol: datos.rol },
      },
      tx,
    );

    return { id: empleado.id };
  });
}
