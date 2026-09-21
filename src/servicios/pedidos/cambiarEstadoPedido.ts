import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { puedeCambiarEstadoPedido } from "@/servicios/pedidos/puedeCambiarEstadoPedido";
import { calcularCantidadStockLinea } from "@/servicios/pedidos/calcularCantidadStockLinea";
import type { EstadoPedido } from "@/generated/prisma/enums";

// Cambia el estado del pedido respetando la máquina de estados. Al confirmar
// descuenta stock (una sola vez) y al cancelar un pedido ya descontado genera
// la devolución (una sola vez). Usa las banderas de idempotencia del pedido.
//
// El descuento es atómico: la condición `stockActual >= cantidad` evita stock
// negativo cuando dos pedidos compiten por el mismo producto.
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
            unidadVenta: true,
            pesoPresentacionKg: true,
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
        const cantidadStock = calcularCantidadStockLinea(
          detalle.unidadVenta,
          detalle.cantidad,
          detalle.pesoPresentacionKg,
        );

        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        if (!producto) {
          throw new ErrorNegocio(
            `Producto no encontrado: ${detalle.nombreProducto}.`,
          );
        }

        const aplicado = await tx.producto.updateMany({
          where: {
            id: detalle.productoId,
            stockActual: { gte: cantidadStock },
          },
          data: { stockActual: { decrement: cantidadStock } },
        });

        if (aplicado.count === 0) {
          throw new ErrorNegocio(
            `No hay stock suficiente de ${detalle.nombreProducto}. Disponible: ${producto.stockActual.toString()}.`,
          );
        }

        const actualizado = await tx.producto.findUniqueOrThrow({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        const stockPosterior = actualizado.stockActual;
        const stockAnterior = stockPosterior.add(cantidadStock);

        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: "VENTA",
            cantidad: cantidadStock,
            stockAnterior,
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
        const cantidadStock = calcularCantidadStockLinea(
          detalle.unidadVenta,
          detalle.cantidad,
          detalle.pesoPresentacionKg,
        );

        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        if (!producto) continue;

        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: { increment: cantidadStock } },
        });

        const actualizado = await tx.producto.findUniqueOrThrow({
          where: { id: detalle.productoId },
          select: { stockActual: true },
        });

        const stockPosterior = actualizado.stockActual;
        const stockAnterior = stockPosterior.sub(cantidadStock);

        await tx.movimientoStock.create({
          data: {
            productoId: detalle.productoId,
            tipo: "DEVOLUCION",
            cantidad: cantidadStock,
            stockAnterior,
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
    },
    // El descuento recorre cada detalle con varias consultas; en bases remotas
    // el timeout por defecto (5 s) resulta insuficiente para pedidos con varias
    // líneas. Se amplía sin cambiar la atomicidad.
    { timeout: 30_000 },
  );
}
