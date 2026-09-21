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

export type FiltrosLiquidaciones = {
  estado?: EstadoLiquidacion;
  pagina: number;
  porPagina: number;
};

export type ResultadoLiquidaciones = {
  liquidaciones: LiquidacionListado[];
  total: number;
};

// Historial de liquidaciones de un empleado, paginado en la base.
export async function listarLiquidaciones(
  empleadoId: string,
  filtros: FiltrosLiquidaciones,
): Promise<ResultadoLiquidaciones> {
  const where: Prisma.EmpleadoLiquidacionWhereInput = {
    empleadoId,
    ...(filtros.estado ? { estado: filtros.estado } : {}),
  };

  const [total, liquidaciones] = await Promise.all([
    prisma.empleadoLiquidacion.count({ where }),
    prisma.empleadoLiquidacion.findMany({
      where,
      orderBy: [{ desde: "desc" }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
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
    }),
  ]);

  return { liquidaciones, total };
}
