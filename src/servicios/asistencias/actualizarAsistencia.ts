import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { calcularMinutosJornada } from "@/servicios/asistencias/calcularMinutosJornada";
import type { EstadoAsistencia } from "@/generated/prisma/enums";

export type DatosAsistenciaEdicion = {
  estado: EstadoAsistencia;
  horaEntrada?: string;
  horaSalida?: string;
  horaEntradaTramo2?: string;
  horaSalidaTramo2?: string;
  observacion?: string;
};

// Corrige una jornada registrada. Si la asistencia ya fue incluida en una
// liquidación cerrada (calculada, pagada o cancelada) no puede editarse sin
// anular antes la liquidación. Toda corrección queda auditada como MANUAL_ADMIN.
export async function actualizarAsistencia(
  asistenciaId: string,
  datos: DatosAsistenciaEdicion,
  usuarioId: string,
): Promise<{ userId: string }> {
  const asistencia = await prisma.empleadoAsistencia.findUnique({
    where: { id: asistenciaId },
    select: {
      id: true,
      empleadoId: true,
      liquidacionId: true,
      liquidacion: { select: { estado: true } },
      empleado: {
        select: {
          userId: true,
          horaEntradaEsperada: true,
          horaSalidaEsperada: true,
          horaEntradaTramo2Esperada: true,
          horaSalidaTramo2Esperada: true,
        },
      },
    },
  });

  if (!asistencia) {
    throw new ErrorNegocio("La asistencia no existe.");
  }

  if (
    asistencia.liquidacionId &&
    asistencia.liquidacion?.estado !== "ABIERTA"
  ) {
    throw new ErrorNegocio(
      "La asistencia pertenece a una liquidación cerrada. Anulá la liquidación para corregirla.",
    );
  }

  const esPresente = datos.estado === "PRESENTE";

  const tramos = {
    horaEntrada: esPresente ? (datos.horaEntrada ?? null) : null,
    horaSalida: esPresente ? (datos.horaSalida ?? null) : null,
    horaEntradaTramo2: esPresente ? (datos.horaEntradaTramo2 ?? null) : null,
    horaSalidaTramo2: esPresente ? (datos.horaSalidaTramo2 ?? null) : null,
  };

  const minutos = calcularMinutosJornada({
    estado: datos.estado,
    tramos,
    horaEntradaEsperada: asistencia.empleado.horaEntradaEsperada,
    horaSalidaEsperada: asistencia.empleado.horaSalidaEsperada,
    horaEntradaTramo2Esperada:
      asistencia.empleado.horaEntradaTramo2Esperada,
    horaSalidaTramo2Esperada: asistencia.empleado.horaSalidaTramo2Esperada,
  });

  await prisma.$transaction(async (tx) => {
    await tx.empleadoAsistencia.update({
      where: { id: asistenciaId },
      data: {
        estado: datos.estado,
        ...tramos,
        minutosTrabajados: minutos.minutosTrabajados,
        minutosRetraso: minutos.minutosRetraso,
        minutosRetrasoTramo1: minutos.minutosRetrasoTramo1,
        minutosRetrasoTramo2: minutos.minutosRetrasoTramo2,
        observacion: datos.observacion ?? null,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.ASISTENCIA_EDITADA,
        entidad: "EmpleadoAsistencia",
        entidadId: asistenciaId,
        datos: {
          empleadoId: asistencia.empleadoId,
          estado: datos.estado,
          origen: "MANUAL_ADMIN",
          ...tramos,
          minutosTrabajados: minutos.minutosTrabajados,
          minutosRetraso: minutos.minutosRetraso,
        },
      },
      tx,
    );
  });

  return { userId: asistencia.empleado.userId };
}
