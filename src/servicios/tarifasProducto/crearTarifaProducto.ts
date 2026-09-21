import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

// Crea una tarifa por unidad para un producto. Si existe una tarifa inactiva
// para el mismo par empleado+producto, se reactiva con el nuevo precio. No se
// permiten dos tarifas activas para el mismo producto.
export async function crearTarifaProducto(
  empleadoId: string,
  productoId: string,
  precioUnidad: string,
  usuarioId: string,
): Promise<{ userId: string }> {
  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { id: true, userId: true },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  const producto = await prisma.producto.findFirst({
    where: { id: productoId, activo: true },
    select: { id: true },
  });

  if (!producto) {
    throw new ErrorNegocio("El producto no existe o está inactivo.");
  }

  await prisma.$transaction(async (tx) => {
    const existente = await tx.empleadoTarifaProducto.findUnique({
      where: { empleadoId_productoId: { empleadoId, productoId } },
      select: { id: true, activo: true, precioUnidad: true },
    });

    if (existente?.activo) {
      throw new ErrorNegocio(
        "Ya existe una tarifa activa para ese producto. Editala en su lugar.",
      );
    }

    const precio = new Prisma.Decimal(precioUnidad);

    if (existente) {
      await tx.empleadoTarifaProducto.update({
        where: { id: existente.id },
        data: { precioUnidad: precio, activo: true },
      });

      await registrarAuditoria(
        {
          usuarioId,
          accion: ACCIONES_AUDITORIA.TARIFA_PRODUCCION_ACTIVADA,
          entidad: "EmpleadoTarifaProducto",
          entidadId: existente.id,
          datos: {
            empleadoId,
            productoId,
            precioAnterior: existente.precioUnidad.toString(),
            precioNuevo: precioUnidad,
          },
        },
        tx,
      );

      return;
    }

    const tarifa = await tx.empleadoTarifaProducto.create({
      data: { empleadoId, productoId, precioUnidad: precio, activo: true },
      select: { id: true },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.TARIFA_PRODUCCION_CREADA,
        entidad: "EmpleadoTarifaProducto",
        entidadId: tarifa.id,
        datos: { empleadoId, productoId, precioUnidad },
      },
      tx,
    );
  });

  return { userId: empleado.userId };
}
