import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";

export type DatosProduccionEdicion = {
  fecha: string;
  cantidad: number;
};

// Corrige una producción. El precio unitario histórico no cambia: se recalcula
// el total con el precio congelado. Si la producción ya pertenece a una
// liquidación cerrada, no puede editarse.
export async function actualizarProduccion(
  produccionId: string,
  datos: DatosProduccionEdicion,
  usuarioId: string,
): Promise<{ userId: string }> {
  const produccion = await prisma.empleadoProduccion.findUnique({
    where: { id: produccionId },
    select: {
      id: true,
      empleadoId: true,
      productoId: true,
      precioUnidad: true,
      cantidad: true,
      liquidacionId: true,
      liquidacion: { select: { estado: true } },
      empleado: { select: { userId: true } },
    },
  });

  if (!produccion) {
    throw new ErrorNegocio("La producción no existe.");
  }

  if (
    produccion.liquidacionId &&
    produccion.liquidacion?.estado !== "ABIERTA"
  ) {
    throw new ErrorNegocio(
      "La producción pertenece a una liquidación cerrada. Anulá la liquidación para corregirla.",
    );
  }

  const fecha = parsearFechaCalendario(datos.fecha);

  if (!fecha) {
    throw new ErrorNegocio("La fecha es inválida.");
  }

  const total = produccion.precioUnidad
    .mul(datos.cantidad)
    .toDecimalPlaces(2);

  await prisma.$transaction(async (tx) => {
    await tx.empleadoProduccion.update({
      where: { id: produccionId },
      data: { fecha, cantidad: datos.cantidad, total },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PRODUCCION_EDITADA,
        entidad: "EmpleadoProduccion",
        entidadId: produccionId,
        datos: {
          empleadoId: produccion.empleadoId,
          productoId: produccion.productoId,
          cantidadAnterior: produccion.cantidad,
          cantidadNueva: datos.cantidad,
          fecha: datos.fecha,
          precioUnidad: produccion.precioUnidad.toString(),
          total: total.toString(),
        },
      },
      tx,
    );
  });

  return { userId: produccion.empleado.userId };
}
