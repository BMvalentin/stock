import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { DatosMetodoPago } from "@/servicios/configuracion/crearMetodoPago";

export async function actualizarMetodoPago(
  id: string,
  datos: DatosMetodoPago,
  usuarioId: string,
): Promise<void> {
  const metodo = await prisma.metodoPago.findUnique({
    where: { id },
    select: { id: true, codigo: true, nombre: true },
  });

  if (!metodo) {
    throw new ErrorNegocio("El método de pago no existe.");
  }

  const duplicado = await prisma.metodoPago.findFirst({
    where: { codigo: datos.codigo, NOT: { id } },
    select: { id: true },
  });

  if (duplicado) {
    throw new ErrorNegocio("Ya existe otro método con ese código.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.metodoPago.update({
      where: { id },
      data: {
        codigo: datos.codigo,
        nombre: datos.nombre,
        orden: datos.orden,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.METODO_PAGO_EDITADO,
        entidad: "MetodoPago",
        entidadId: id,
        datos: { antes: metodo.nombre, despues: datos.nombre },
      },
      tx,
    );
  });
}
