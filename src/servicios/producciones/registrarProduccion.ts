import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";

export type DatosProduccion = {
  empleadoId: string;
  productoId: string;
  fecha: string;
  cantidad: number;
};

// Registra producción de un empleado por producción. El precio unitario se
// resuelve de la tarifa activa y se congela junto con el total: los cambios
// futuros de tarifa no alteran este registro. No modifica el stock.
export async function registrarProduccion(
  datos: DatosProduccion,
  usuarioId: string,
): Promise<{ userId: string; total: string }> {
  const empleado = await prisma.empleado.findUnique({
    where: { id: datos.empleadoId },
    select: { id: true, userId: true, tipoRemuneracion: true },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  if (empleado.tipoRemuneracion !== "POR_PRODUCCION") {
    throw new ErrorNegocio("El empleado no se remunera por producción.");
  }

  const tarifa = await prisma.empleadoTarifaProducto.findUnique({
    where: {
      empleadoId_productoId: {
        empleadoId: datos.empleadoId,
        productoId: datos.productoId,
      },
    },
    select: {
      precioUnidad: true,
      activo: true,
      producto: { select: { nombre: true, activo: true } },
    },
  });

  if (!tarifa || !tarifa.activo) {
    throw new ErrorNegocio("No hay una tarifa activa para ese producto.");
  }

  if (!tarifa.producto.activo) {
    throw new ErrorNegocio("El producto está inactivo.");
  }

  const fecha = parsearFechaCalendario(datos.fecha);

  if (!fecha) {
    throw new ErrorNegocio("La fecha es inválida.");
  }

  const total = tarifa.precioUnidad
    .mul(datos.cantidad)
    .toDecimalPlaces(2);

  await prisma.$transaction(async (tx) => {
    const produccion = await tx.empleadoProduccion.create({
      data: {
        empleadoId: datos.empleadoId,
        productoId: datos.productoId,
        fecha,
        cantidad: datos.cantidad,
        precioUnidad: tarifa.precioUnidad,
        total,
      },
      select: { id: true },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PRODUCCION_REGISTRADA,
        entidad: "EmpleadoProduccion",
        entidadId: produccion.id,
        datos: {
          empleadoId: datos.empleadoId,
          productoId: datos.productoId,
          fecha: datos.fecha,
          cantidad: datos.cantidad,
          precioUnidad: tarifa.precioUnidad.toString(),
          total: total.toString(),
        },
      },
      tx,
    );
  });

  return { userId: empleado.userId, total: total.toString() };
}
