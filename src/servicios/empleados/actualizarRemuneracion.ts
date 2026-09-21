import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { TipoRemuneracion } from "@/generated/prisma/enums";

export type DatosRemuneracion = {
  tipoRemuneracion: TipoRemuneracion;
  horasJornada: string;
  pagoJornada: string;
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  horaEntradaTramo2Esperada?: string;
  horaSalidaTramo2Esperada?: string;
};

// Actualiza la modalidad y la configuración de jornada de un empleado. Cambiar
// la modalidad no modifica los registros históricos: cada asistencia,
// producción y liquidación conserva su modalidad y sus importes.
export async function actualizarRemuneracion(
  empleadoId: string,
  datos: DatosRemuneracion,
  usuarioId: string,
): Promise<{ cambioModalidad: boolean; userId: string }> {
  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { id: true, userId: true, tipoRemuneracion: true },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  const cambioModalidad = empleado.tipoRemuneracion !== datos.tipoRemuneracion;

  await prisma.$transaction(async (tx) => {
    await tx.empleado.update({
      where: { id: empleadoId },
      data: {
        tipoRemuneracion: datos.tipoRemuneracion,
        horasJornada: new Prisma.Decimal(datos.horasJornada),
        pagoJornada: new Prisma.Decimal(datos.pagoJornada),
        horaEntradaEsperada: datos.horaEntradaEsperada,
        horaSalidaEsperada: datos.horaSalidaEsperada,
        horaEntradaTramo2Esperada: datos.horaEntradaTramo2Esperada ?? null,
        horaSalidaTramo2Esperada: datos.horaSalidaTramo2Esperada ?? null,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.EMPLEADO_REMUNERACION_ACTUALIZADA,
        entidad: "Empleado",
        entidadId: empleadoId,
        datos: {
          tipoAnterior: empleado.tipoRemuneracion,
          tipoNuevo: datos.tipoRemuneracion,
          horasJornada: datos.horasJornada,
          pagoJornada: datos.pagoJornada,
          horaEntradaEsperada: datos.horaEntradaEsperada,
          horaSalidaEsperada: datos.horaSalidaEsperada,
          horaEntradaTramo2Esperada: datos.horaEntradaTramo2Esperada ?? null,
          horaSalidaTramo2Esperada: datos.horaSalidaTramo2Esperada ?? null,
        },
      },
      tx,
    );
  });

  return { cambioModalidad, userId: empleado.userId };
}
