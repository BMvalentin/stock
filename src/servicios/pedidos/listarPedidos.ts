import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EstadoPago,
  EstadoPedido,
  TipoEntrega,
} from "@/generated/prisma/enums";

export type FiltrosPedidos = {
  busqueda?: string;
  estado?: EstadoPedido;
  estadoPago?: EstadoPago;
  desde?: Date;
  hasta?: Date;
  pagina: number;
  porPagina: number;
};

export type PedidoListado = {
  id: string;
  numero: number;
  createdAt: Date;
  cliente: string;
  telefono: string;
  localidad: string | null;
  total: number;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  tipoEntrega: TipoEntrega;
  metodoPago: string | null;
};

export type ResultadoPedidos = {
  pedidos: PedidoListado[];
  total: number;
};

export async function listarPedidos(
  filtros: FiltrosPedidos,
): Promise<ResultadoPedidos> {
  const numeroBuscado = Number(filtros.busqueda);
  const where: Prisma.PedidoWhereInput = {
    ...(filtros.estado ? { estado: filtros.estado } : {}),
    ...(filtros.estadoPago ? { estadoPago: filtros.estadoPago } : {}),
    ...(filtros.desde || filtros.hasta
      ? {
          createdAt: {
            ...(filtros.desde ? { gte: filtros.desde } : {}),
            ...(filtros.hasta ? { lte: filtros.hasta } : {}),
          },
        }
      : {}),
    ...(filtros.busqueda
      ? {
          OR: [
            ...(Number.isFinite(numeroBuscado) && filtros.busqueda !== ""
              ? [{ numero: numeroBuscado }]
              : []),
            { clienteNombre: { contains: filtros.busqueda } },
            { clienteTelefono: { contains: filtros.busqueda } },
          ],
        }
      : {}),
  };

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        numero: true,
        createdAt: true,
        total: true,
        estado: true,
        estadoPago: true,
        tipoEntrega: true,
        clienteNombre: true,
        clienteTelefono: true,
        clienteLocalidad: true,
        metodoPago: { select: { nombre: true } },
      },
    }),
  ]);

  return {
    total,
    pedidos: pedidos.map((pedido) => ({
      id: pedido.id,
      numero: pedido.numero,
      createdAt: pedido.createdAt,
      cliente: pedido.clienteNombre,
      telefono: pedido.clienteTelefono,
      localidad: pedido.clienteLocalidad,
      total: Number(pedido.total),
      estado: pedido.estado,
      estadoPago: pedido.estadoPago,
      tipoEntrega: pedido.tipoEntrega,
      metodoPago: pedido.metodoPago?.nombre ?? null,
    })),
  };
}
