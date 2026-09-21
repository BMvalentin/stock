import { prisma } from "@/lib/prisma/cliente";
import type {
  EstadoAsistencia,
  OrigenAsistencia,
} from "@/generated/prisma/enums";

export type AsistenciaDia = {
  id: string;
  estado: EstadoAsistencia;
  origen: OrigenAsistencia;
  ultimoFichajeEn: Date | null;
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
  minutosTrabajados: number | null;
  minutosRetraso: number | null;
  minutosRetrasoTramo1: number | null;
  minutosRetrasoTramo2: number | null;
};

// Asistencia de un empleado para una fecha (a medianoche UTC, formato @db.Date).
export async function obtenerAsistenciaDia(
  empleadoId: string,
  fecha: Date,
): Promise<AsistenciaDia | null> {
  return prisma.empleadoAsistencia.findUnique({
    where: { empleadoId_fecha: { empleadoId, fecha } },
    select: {
      id: true,
      estado: true,
      origen: true,
      ultimoFichajeEn: true,
      horaEntrada: true,
      horaSalida: true,
      horaEntradaTramo2: true,
      horaSalidaTramo2: true,
      minutosTrabajados: true,
      minutosRetraso: true,
      minutosRetrasoTramo1: true,
      minutosRetrasoTramo2: true,
    },
  });
}
