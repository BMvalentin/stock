import { prisma } from "@/lib/prisma/cliente";
import type {
  EstadoPago,
  EstadoPedido,
  TipoEntrega,
} from "@/generated/prisma/enums";

export type PedidoDeCliente = {
  id: string;
  numero: number;
  createdAt: Date;
  total: number;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  tipoEntrega: TipoEntrega;
};

export type ClienteDetalle = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  localidad: string | null;
  codigoPostal: string | null;
  observaciones: string | null;
  activo: boolean;
  createdAt: Date;
  totalComprado: number;
  pedidos: PedidoDeCliente[];
};

export async function obtenerCliente(
  id: string,
): Promise<ClienteDetalle | null> {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      email: true,
      direccion: true,
      localidad: true,
      codigoPostal: true,
      observaciones: true,
      activo: true,
      createdAt: true,
      pedidos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          numero: true,
          createdAt: true,
          total: true,
          estado: true,
          estadoPago: true,
          tipoEntrega: true,
        },
      },
    },
  });

  if (!cliente) return null;

  const totalComprado = cliente.pedidos
    .filter((pedido) => pedido.estado !== "CANCELADO")
    .reduce((acumulado, pedido) => acumulado + Number(pedido.total), 0);

  return {
    id: cliente.id,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    email: cliente.email,
    direccion: cliente.direccion,
    localidad: cliente.localidad,
    codigoPostal: cliente.codigoPostal,
    observaciones: cliente.observaciones,
    activo: cliente.activo,
    createdAt: cliente.createdAt,
    totalComprado,
    pedidos: cliente.pedidos.map((pedido) => ({
      id: pedido.id,
      numero: pedido.numero,
      createdAt: pedido.createdAt,
      total: Number(pedido.total),
      estado: pedido.estado,
      estadoPago: pedido.estadoPago,
      tipoEntrega: pedido.tipoEntrega,
    })),
  };
}
