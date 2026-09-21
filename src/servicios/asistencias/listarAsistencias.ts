import { prisma } from "@/lib/prisma/cliente";
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

// Asistencias de un empleado. Se puede acotar a un período para la liquidación;
// sin rango se listan las últimas jornadas registradas.
export async function listarAsistencias(
  empleadoId: string,
  opciones?: { desde?: Date; hasta?: Date; limite?: number },
): Promise<AsistenciaListado[]> {
  return prisma.empleadoAsistencia.findMany({
    where: {
      empleadoId,
      ...(opciones?.desde || opciones?.hasta
        ? {
            fecha: {
              ...(opciones?.desde ? { gte: opciones.desde } : {}),
              ...(opciones?.hasta ? { lte: opciones.hasta } : {}),
            },
          }
        : {}),
    },
    orderBy: { fecha: "desc" },
    take: opciones?.limite,
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
  });
}
