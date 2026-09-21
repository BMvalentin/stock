import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { Rol, TipoRemuneracion } from "@/generated/prisma/enums";

export type FiltrosEmpleados = {
  busqueda?: string;
  rol?: Rol;
  estado?: "ACTIVOS" | "INACTIVOS" | "TODOS";
  pagina: number;
  porPagina: number;
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

export type ResultadoEmpleados = {
  empleados: EmpleadoListado[];
  total: number;
};

export async function listarEmpleados(
  filtros: FiltrosEmpleados,
): Promise<ResultadoEmpleados> {
  const where: Prisma.UserWhereInput = {
    ...(filtros.busqueda
      ? {
          OR: [
            { name: { contains: filtros.busqueda } },
            { email: { contains: filtros.busqueda } },
          ],
        }
      : {}),
    ...(filtros.rol ? { rol: filtros.rol } : {}),
    ...(filtros.estado === "ACTIVOS"
      ? { activo: true }
      : filtros.estado === "INACTIVOS"
        ? { activo: false }
        : {}),
  };

  const [total, empleados] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ activo: "desc" }, { rol: "asc" }, { name: "asc" }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        name: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        empleado: { select: { tipoRemuneracion: true } },
      },
    }),
  ]);

  return {
    total,
    empleados: empleados.map((empleado) => ({
      id: empleado.id,
      nombre: empleado.name,
      email: empleado.email,
      rol: empleado.rol,
      activo: empleado.activo,
      tipoRemuneracion: empleado.empleado?.tipoRemuneracion ?? null,
      createdAt: empleado.createdAt,
    })),
  };
}
