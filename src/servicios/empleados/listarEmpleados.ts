import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { Rol, TipoRemuneracion } from "@/generated/prisma/enums";

export type FiltrosEmpleados = {
  busqueda?: string;
};

export type EmpleadoListado = {
  id: string;
  nombre: string | null;
  email: string;
  rol: Rol;
  activo: boolean;
  tipoRemuneracion: TipoRemuneracion | null;
  createdAt: Date;
};

export async function listarEmpleados(
  filtros: FiltrosEmpleados,
): Promise<EmpleadoListado[]> {
  const where: Prisma.UserWhereInput = filtros.busqueda
    ? {
        OR: [
          { name: { contains: filtros.busqueda } },
          { email: { contains: filtros.busqueda } },
        ],
      }
    : {};

  const empleados = await prisma.user.findMany({
    where,
    orderBy: [{ activo: "desc" }, { rol: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      empleado: { select: { tipoRemuneracion: true } },
    },
  });

  return empleados.map((empleado) => ({
    id: empleado.id,
    nombre: empleado.name,
    email: empleado.email,
    rol: empleado.rol,
    activo: empleado.activo,
    tipoRemuneracion: empleado.empleado?.tipoRemuneracion ?? null,
    createdAt: empleado.createdAt,
  }));
}
