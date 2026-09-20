import { prisma } from "@/lib/prisma/cliente";
import type { TipoMovimiento } from "@/generated/prisma/enums";

export type MovimientoReciente = {
  id: string;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  usuario: string | null;
  createdAt: Date;
};

export async function obtenerMovimientosRecientes(
  limite = 6,
): Promise<MovimientoReciente[]> {
  const movimientos = await prisma.movimientoStock.findMany({
    orderBy: { createdAt: "desc" },
    take: limite,
    select: {
      id: true,
      tipo: true,
      cantidad: true,
      createdAt: true,
      producto: { select: { nombre: true } },
      usuario: { select: { name: true } },
    },
  });

  return movimientos.map((movimiento) => ({
    id: movimiento.id,
    producto: movimiento.producto.nombre,
    tipo: movimiento.tipo,
    cantidad: movimiento.cantidad,
    usuario: movimiento.usuario.name,
    createdAt: movimiento.createdAt,
  }));
}
