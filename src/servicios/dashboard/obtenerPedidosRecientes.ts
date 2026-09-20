import { prisma } from "@/lib/prisma/cliente";
import type { EstadoPago, EstadoPedido } from "@/generated/prisma/enums";

export type PedidoReciente = {
  id: string;
  numero: number;
  cliente: string;
  total: number;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  createdAt: Date;
};

export async function obtenerPedidosRecientes(
  limite = 5,
): Promise<PedidoReciente[]> {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    take: limite,
    select: {
      id: true,
      numero: true,
      total: true,
      estado: true,
      estadoPago: true,
      createdAt: true,
      cliente: { select: { nombre: true } },
    },
  });

  return pedidos.map((pedido) => ({
    id: pedido.id,
    numero: pedido.numero,
    cliente: pedido.cliente.nombre,
    total: Number(pedido.total),
    estado: pedido.estado,
    estadoPago: pedido.estadoPago,
    createdAt: pedido.createdAt,
  }));
}
