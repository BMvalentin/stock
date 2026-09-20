import { prisma } from "@/lib/prisma/cliente";
import type {
  EstadoPago,
  EstadoPedido,
  TipoEntrega,
} from "@/generated/prisma/enums";

export type DetallePedidoItem = {
  id: string;
  productoId: string;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
};

export type PagoPedido = {
  id: string;
  monto: number;
  estado: EstadoPago;
  observacion: string | null;
  createdAt: Date;
  usuario: string | null;
  metodoPago: string | null;
};

export type PedidoDetalle = {
  id: string;
  numero: number;
  createdAt: Date;
  updatedAt: Date;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  tipoEntrega: TipoEntrega;
  direccionEntrega: string | null;
  subtotal: number;
  costoEnvio: number;
  total: number;
  observaciones: string | null;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email: string | null;
    direccion: string | null;
    localidad: string | null;
    codigoPostal: string | null;
  };
  metodoPago: string | null;
  vendedor: string | null;
  detalles: DetallePedidoItem[];
  pagos: PagoPedido[];
};

export async function obtenerPedido(
  id: string,
): Promise<PedidoDetalle | null> {
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: {
      id: true,
      numero: true,
      createdAt: true,
      updatedAt: true,
      estado: true,
      estadoPago: true,
      tipoEntrega: true,
      direccionEntrega: true,
      subtotal: true,
      costoEnvio: true,
      total: true,
      observaciones: true,
      cliente: {
        select: {
          id: true,
          nombre: true,
          telefono: true,
          email: true,
          direccion: true,
          localidad: true,
          codigoPostal: true,
        },
      },
      metodoPago: { select: { nombre: true } },
      usuario: { select: { name: true } },
      detalles: {
        select: {
          id: true,
          productoId: true,
          nombreProducto: true,
          precioUnitario: true,
          cantidad: true,
          subtotal: true,
        },
      },
      pagos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          monto: true,
          estado: true,
          observacion: true,
          createdAt: true,
          usuario: { select: { name: true } },
          metodoPago: { select: { nombre: true } },
        },
      },
    },
  });

  if (!pedido) return null;

  return {
    id: pedido.id,
    numero: pedido.numero,
    createdAt: pedido.createdAt,
    updatedAt: pedido.updatedAt,
    estado: pedido.estado,
    estadoPago: pedido.estadoPago,
    tipoEntrega: pedido.tipoEntrega,
    direccionEntrega: pedido.direccionEntrega,
    subtotal: Number(pedido.subtotal),
    costoEnvio: Number(pedido.costoEnvio),
    total: Number(pedido.total),
    observaciones: pedido.observaciones,
    cliente: pedido.cliente,
    metodoPago: pedido.metodoPago?.nombre ?? null,
    vendedor: pedido.usuario.name,
    detalles: pedido.detalles.map((detalle) => ({
      id: detalle.id,
      productoId: detalle.productoId,
      nombreProducto: detalle.nombreProducto,
      precioUnitario: Number(detalle.precioUnitario),
      cantidad: detalle.cantidad,
      subtotal: Number(detalle.subtotal),
    })),
    pagos: pedido.pagos.map((pago) => ({
      id: pago.id,
      monto: Number(pago.monto),
      estado: pago.estado,
      observacion: pago.observacion,
      createdAt: pago.createdAt,
      usuario: pago.usuario.name,
      metodoPago: pago.metodoPago?.nombre ?? null,
    })),
  };
}
