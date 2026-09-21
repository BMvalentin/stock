import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EstadoLiquidacion,
  TipoRemuneracion,
} from "@/generated/prisma/enums";

export type LiquidacionListado = {
  id: string;
  desde: Date;
  hasta: Date;
  tipoRemuneracion: TipoRemuneracion;
  total: Prisma.Decimal;
  estado: EstadoLiquidacion;
  calculadaEn: Date | null;
  pagadaEn: Date | null;
  createdAt: Date;
};

// Historial de liquidaciones de un empleado, de la más reciente a la más vieja.
export async function listarLiquidaciones(
  empleadoId: string,
): Promise<LiquidacionListado[]> {
  return prisma.empleadoLiquidacion.findMany({
    where: { empleadoId },
    orderBy: [{ desde: "desc" }],
    select: {
      id: true,
      desde: true,
      hasta: true,
      tipoRemuneracion: true,
      total: true,
      estado: true,
      calculadaEn: true,
      pagadaEn: true,
      createdAt: true,
    },
  });
}
