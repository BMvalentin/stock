import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { Rol, TipoRemuneracion } from "@/generated/prisma/enums";

export type EmpleadoDetalle = {
  id: string;
  userId: string;
  nombre: string | null;
  email: string;
  rol: Rol;
  activo: boolean;
  tipoRemuneracion: TipoRemuneracion;
  horasJornada: Prisma.Decimal;
  pagoJornada: Prisma.Decimal;
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  horaEntradaTramo2Esperada: string | null;
  horaSalidaTramo2Esperada: string | null;
};

const seleccionEmpleado = {
  id: true,
  userId: true,
  tipoRemuneracion: true,
  horasJornada: true,
  pagoJornada: true,
  horaEntradaEsperada: true,
  horaSalidaEsperada: true,
  horaEntradaTramo2Esperada: true,
  horaSalidaTramo2Esperada: true,
} as const;

// Obtiene el perfil laboral de un usuario. Si el usuario fue creado por un
// proveedor externo (por ejemplo Google) y no tiene perfil, se crea con los
// valores por defecto para mantener la relación 1:1. Solo lo usan rutas ADMIN.
export async function obtenerEmpleado(
  userId: string,
): Promise<EmpleadoDetalle | null> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      activo: true,
      empleado: { select: seleccionEmpleado },
    },
  });

  if (!usuario) return null;

  const empleado =
    usuario.empleado ??
    (await prisma.empleado.create({
      data: { userId },
      select: seleccionEmpleado,
    }));

  return {
    id: empleado.id,
    userId: usuario.id,
    nombre: usuario.name,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
    tipoRemuneracion: empleado.tipoRemuneracion,
    horasJornada: empleado.horasJornada,
    pagoJornada: empleado.pagoJornada,
    horaEntradaEsperada: empleado.horaEntradaEsperada,
    horaSalidaEsperada: empleado.horaSalidaEsperada,
    horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
    horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
  };
}
