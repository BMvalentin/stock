import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EstadoLiquidacion,
  TipoRemuneracion,
} from "@/generated/prisma/enums";
import type { DetalleLiquidacion } from "@/servicios/liquidaciones/calcularLiquidacionEmpleado";

export type LiquidacionDetalle = {
  id: string;
  empleadoId: string;
  userId: string;
  nombreEmpleado: string | null;
  emailEmpleado: string;
  desde: Date;
  hasta: Date;
  tipoRemuneracion: TipoRemuneracion;
  total: Prisma.Decimal;
  estado: EstadoLiquidacion;
  detalle: DetalleLiquidacion | null;
  calculadaEn: Date | null;
  pagadaEn: Date | null;
};

// Obtiene una liquidación con su detalle congelado.
export async function obtenerLiquidacion(
  liquidacionId: string,
): Promise<LiquidacionDetalle | null> {
  const liquidacion = await prisma.empleadoLiquidacion.findUnique({
    where: { id: liquidacionId },
    select: {
      id: true,
      empleadoId: true,
      desde: true,
      hasta: true,
      tipoRemuneracion: true,
      total: true,
      estado: true,
      detalle: true,
      calculadaEn: true,
      pagadaEn: true,
      empleado: {
        select: { userId: true, user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!liquidacion) return null;

  return {
    id: liquidacion.id,
    empleadoId: liquidacion.empleadoId,
    userId: liquidacion.empleado.userId,
    nombreEmpleado: liquidacion.empleado.user.name,
    emailEmpleado: liquidacion.empleado.user.email,
    desde: liquidacion.desde,
    hasta: liquidacion.hasta,
    tipoRemuneracion: liquidacion.tipoRemuneracion,
    total: liquidacion.total,
    estado: liquidacion.estado,
    detalle: (liquidacion.detalle as DetalleLiquidacion | null) ?? null,
    calculadaEn: liquidacion.calculadaEn,
    pagadaEn: liquidacion.pagadaEn,
  };
}
