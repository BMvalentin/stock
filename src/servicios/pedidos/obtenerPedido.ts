import { prisma } from "@/lib/prisma/cliente";
import type {
  EstadoPago,
  EstadoPedido,
  TipoEntrega,
  UnidadVenta,
} from "@/generated/prisma/enums";

export type DetallePedidoItem = {
  id: string;
  productoId: string;
  nombreProducto: string;
  unidadVenta: UnidadVenta;
  pesoPresentacionKg: number | null;
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
  referenciaEntrega: string | null;
  mapsUrl: string | null;
  latitud: number | null;
  longitud: number | null;
  subtotal: number;
  costoEnvio: number;
  total: number;
  observaciones: string | null;
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string | null;
  clienteLocalidad: string | null;
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
      referenciaEntrega: true,
      mapsUrl: true,
      latitud: true,
      longitud: true,
      subtotal: true,
      costoEnvio: true,
      total: true,
      observaciones: true,
      clienteNombre: true,
      clienteTelefono: true,
      clienteDireccion: true,
      clienteLocalidad: true,
      metodoPago: { select: { nombre: true } },
      usuario: { select: { name: true } },
      detalles: {
        select: {
          id: true,
          productoId: true,
          nombreProducto: true,
          unidadVenta: true,
          pesoPresentacionKg: true,
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
    referenciaEntrega: pedido.referenciaEntrega,
    mapsUrl: pedido.mapsUrl,
    latitud: pedido.latitud === null ? null : Number(pedido.latitud),
    longitud: pedido.longitud === null ? null : Number(pedido.longitud),
    subtotal: Number(pedido.subtotal),
    costoEnvio: Number(pedido.costoEnvio),
    total: Number(pedido.total),
    observaciones: pedido.observaciones,
    clienteNombre: pedido.clienteNombre,
    clienteTelefono: pedido.clienteTelefono,
    clienteDireccion: pedido.clienteDireccion,
    clienteLocalidad: pedido.clienteLocalidad,
    metodoPago: pedido.metodoPago?.nombre ?? null,
    vendedor: pedido.usuario.name,
    detalles: pedido.detalles.map((detalle) => ({
      id: detalle.id,
      productoId: detalle.productoId,
      nombreProducto: detalle.nombreProducto,
      unidadVenta: detalle.unidadVenta,
      pesoPresentacionKg:
        detalle.pesoPresentacionKg === null
          ? null
          : Number(detalle.pesoPresentacionKg),
      precioUnitario: Number(detalle.precioUnitario),
      cantidad: Number(detalle.cantidad),
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
