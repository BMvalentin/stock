import { prisma } from "@/lib/prisma/cliente";

export type FichajeResumen = {
  fecha: Date;
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
  minutosTrabajados: number | null;
  minutosRetraso: number | null;
};

// Últimos fichajes de un empleado, ordenados por fecha descendente. Devuelve
// solo lo necesario para el resumen personal (sin observaciones ni liquidación).
export async function listarUltimosFichajes(
  empleadoId: string,
  limite = 5,
): Promise<FichajeResumen[]> {
  return prisma.empleadoAsistencia.findMany({
    where: { empleadoId },
    orderBy: { fecha: "desc" },
    take: limite,
    select: {
      fecha: true,
      horaEntrada: true,
      horaSalida: true,
      horaEntradaTramo2: true,
      horaSalidaTramo2: true,
      minutosTrabajados: true,
      minutosRetraso: true,
    },
  });
}
