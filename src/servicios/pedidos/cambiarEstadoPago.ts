import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { EstadoPago } from "@/generated/prisma/enums";

// Cambia el estado de pago del pedido y deja un registro en la tabla Pago.
// El estado de pago es independiente del estado del pedido.
export async function cambiarEstadoPago(
  pedidoId: string,
  nuevoEstado: EstadoPago,
  usuarioId: string,
  observacion?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        numero: true,
        total: true,
        estadoPago: true,
        metodoPagoId: true,
      },
    });

    if (!pedido) {
      throw new ErrorNegocio("El pedido no existe.");
    }

    if (pedido.estadoPago === nuevoEstado) {
      throw new ErrorNegocio("El pedido ya tiene ese estado de pago.");
    }

    await tx.pago.create({
      data: {
        pedidoId: pedido.id,
        metodoPagoId: pedido.metodoPagoId,
        monto: pedido.total,
        estado: nuevoEstado,
        usuarioId,
        observacion: observacion ?? null,
      },
    });

    await tx.pedido.update({
      where: { id: pedido.id },
      data: { estadoPago: nuevoEstado },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PAGO_ESTADO_CAMBIADO,
        entidad: "Pedido",
        entidadId: pedido.id,
        datos: {
          numero: pedido.numero,
          anterior: pedido.estadoPago,
          nuevo: nuevoEstado,
        },
      },
      tx,
    );
  });
}
