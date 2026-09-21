import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Actualiza el precio por unidad de una tarifa. El cambio solo afecta a las
// nuevas producciones: las producciones y liquidaciones históricas conservan
// el precio con el que se registraron.
export async function actualizarTarifaProducto(
  tarifaId: string,
  precioUnidad: string,
  usuarioId: string,
): Promise<{ userId: string }> {
  const tarifa = await prisma.empleadoTarifaProducto.findUnique({
    where: { id: tarifaId },
    select: {
      id: true,
      empleadoId: true,
      productoId: true,
      precioUnidad: true,
      activo: true,
      empleado: { select: { userId: true } },
    },
  });

  if (!tarifa) {
    throw new ErrorNegocio("La tarifa no existe.");
  }

  if (!tarifa.activo) {
    throw new ErrorNegocio("No se puede editar una tarifa inactiva.");
  }

  const precio = new Prisma.Decimal(precioUnidad);

  if (precio.equals(tarifa.precioUnidad)) {
    throw new ErrorNegocio("El precio es el mismo que el actual.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.empleadoTarifaProducto.update({
      where: { id: tarifaId },
      data: { precioUnidad: precio },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.TARIFA_PRODUCCION_EDITADA,
        entidad: "EmpleadoTarifaProducto",
        entidadId: tarifaId,
        datos: {
          empleadoId: tarifa.empleadoId,
          productoId: tarifa.productoId,
          precioAnterior: tarifa.precioUnidad.toString(),
          precioNuevo: precioUnidad,
        },
      },
      tx,
    );
  });

  return { userId: tarifa.empleado.userId };
}
