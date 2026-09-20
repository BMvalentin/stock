import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export type DatosMetodoPago = {
  codigo: string;
  nombre: string;
  orden: number;
};

export async function crearMetodoPago(
  datos: DatosMetodoPago,
  usuarioId: string,
): Promise<{ id: string }> {
  const existente = await prisma.metodoPago.findUnique({
    where: { codigo: datos.codigo },
    select: { id: true },
  });

  if (existente) {
    throw new ErrorNegocio("Ya existe un método de pago con ese código.");
  }

  return prisma.$transaction(async (tx) => {
    const metodo = await tx.metodoPago.create({
      data: {
        codigo: datos.codigo,
        nombre: datos.nombre,
        orden: datos.orden,
        activo: true,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.METODO_PAGO_CREADO,
        entidad: "MetodoPago",
        entidadId: metodo.id,
        datos: { codigo: metodo.codigo, nombre: metodo.nombre },
      },
      tx,
    );

    return { id: metodo.id };
  });
}
