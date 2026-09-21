import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EstadoAsistencia,
  OrigenAsistencia,
} from "@/generated/prisma/enums";

export type AsistenciaListado = {
  id: string;
  fecha: Date;
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
  minutosTrabajados: number | null;
  minutosRetraso: number | null;
  minutosRetrasoTramo1: number | null;
  minutosRetrasoTramo2: number | null;
  estado: EstadoAsistencia;
  origen: OrigenAsistencia;
  observacion: string | null;
  liquidacionId: string | null;
};

export type FiltrosAsistencias = {
  desde?: Date;
  hasta?: Date;
  pagina: number;
  porPagina: number;
};

export type ResultadoAsistencias = {
  asistencias: AsistenciaListado[];
  total: number;
};

// Asistencias de un empleado, paginadas en la base. Se puede acotar a un
// período para la liquidación; sin rango se listan las últimas jornadas.
export async function listarAsistencias(
  empleadoId: string,
  filtros: FiltrosAsistencias,
): Promise<ResultadoAsistencias> {
  const where: Prisma.EmpleadoAsistenciaWhereInput = {
    empleadoId,
    ...(filtros.desde || filtros.hasta
      ? {
          fecha: {
            ...(filtros.desde ? { gte: filtros.desde } : {}),
            ...(filtros.hasta ? { lte: filtros.hasta } : {}),
          },
        }
      : {}),
  };

  const [total, asistencias] = await Promise.all([
    prisma.empleadoAsistencia.count({ where }),
    prisma.empleadoAsistencia.findMany({
      where,
      orderBy: { fecha: "desc" },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        fecha: true,
        horaEntrada: true,
        horaSalida: true,
        horaEntradaTramo2: true,
        horaSalidaTramo2: true,
        minutosTrabajados: true,
        minutosRetraso: true,
        minutosRetrasoTramo1: true,
        minutosRetrasoTramo2: true,
        estado: true,
        origen: true,
        observacion: true,
        liquidacionId: true,
      },
    }),
  ]);

  return { asistencias, total };
}
