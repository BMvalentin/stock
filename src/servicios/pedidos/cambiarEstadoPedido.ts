import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { puedeCambiarEstadoPedido } from "@/servicios/pedidos/puedeCambiarEstadoPedido";
import type { EstadoPedido } from "@/generated/prisma/enums";

// Cambia el estado del pedido respetando la máquina de estados. Al confirmar
// descuenta stock (una sola vez) y al cancelar un pedido ya descontado genera
// la devolución (una sola vez). Usa las banderas de idempotencia del pedido.
export async function cambiarEstadoPedido(
  pedidoId: string,
  nuevoEstado: EstadoPedido,
  usuarioId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        numero: true,
        estado: true,
        stockDescontado: true,
        stockDevuelto: true,
        detalles: {
          select: {
            productoId: true,
            cantidad: true,
            nombreProducto: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new ErrorNegocio("El pedido no existe.");
    }

    if (!puedeCambiarEstadoPedido(pedido.estado, nuevoEstado)) {
      throw new ErrorNegocio(
        `No se puede pasar de ${pedido.estado} a ${nuevoEstado}.`,
      );
    }

    let stockDescontado = pedido.stockDescontado;
    let stockDevuelto = pedido.stockDevuelto;

    if (nuevoEstado === "CONFIRMADO" && !pedido.stockDescontado) {
      for (const detalle of pedido.detalles) {
        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        if (!producto) {
          throw new ErrorNegocio(
            `Producto no encontrado: ${detalle.nombreProducto}.`,
          );
        }

        if (producto.stockActual < detalle.cantidad) {
          throw new ErrorNegocio(
            `Stock insuficiente de ${detalle.nombreProducto}. Disponible: ${producto.stockActual}.`,
          );
        }

        const stockPosterior = producto.stockActual - detalle.cantidad;

        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: stockPosterior },
        });

        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: "VENTA",
            cantidad: detalle.cantidad,
            stockAnterior: producto.stockActual,
            stockPosterior,
            usuarioId,
            pedidoId: pedido.id,
            motivo: `Pedido #${pedido.numero}`,
          },
        });
      }

      stockDescontado = true;
    }

    if (
      nuevoEstado === "CANCELADO" &&
      pedido.stockDescontado &&
      !pedido.stockDevuelto
    ) {
      for (const detalle of pedido.detalles) {
        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        if (!producto) continue;

        const stockPosterior = producto.stockActual + detalle.cantidad;

        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: stockPosterior },
        });

        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: "DEVOLUCION",
            cantidad: detalle.cantidad,
            stockAnterior: producto.stockActual,
            stockPosterior,
            usuarioId,
            pedidoId: pedido.id,
            motivo: `Cancelación pedido #${pedido.numero}`,
          },
        });
      }

      stockDevuelto = true;
    }

    await tx.pedido.update({
      where: { id: pedido.id },
      data: { estado: nuevoEstado, stockDescontado, stockDevuelto },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PEDIDO_ESTADO_CAMBIADO,
        entidad: "Pedido",
        entidadId: pedido.id,
        datos: {
          numero: pedido.numero,
          anterior: pedido.estado,
          nuevo: nuevoEstado,
        },
      },
      tx,
    );
  });
}
