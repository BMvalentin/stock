import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { calcularMinutosJornada } from "@/servicios/asistencias/calcularMinutosJornada";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";
import type { EstadoAsistencia } from "@/generated/prisma/enums";

export type DatosAsistencia = {
  empleadoId: string;
  fecha: string;
  estado: EstadoAsistencia;
  horaEntrada?: string;
  horaSalida?: string;
  horaEntradaTramo2?: string;
  horaSalidaTramo2?: string;
  observacion?: string;
};

// Registra la jornada de un empleado (carga manual del ADMIN). Guarda los
// minutos trabajados y de retraso calculados en el momento para conservarlos en
// cierres históricos. El origen siempre es MANUAL_ADMIN.
export async function registrarAsistencia(
  datos: DatosAsistencia,
  usuarioId: string,
): Promise<{ userId: string }> {
  const empleado = await prisma.empleado.findUnique({
    where: { id: datos.empleadoId },
    select: {
      id: true,
      userId: true,
      horaEntradaEsperada: true,
      horaSalidaEsperada: true,
      horaEntradaTramo2Esperada: true,
      horaSalidaTramo2Esperada: true,
    },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  const fecha = parsearFechaCalendario(datos.fecha);

  if (!fecha) {
    throw new ErrorNegocio("La fecha es inválida.");
  }

  const existente = await prisma.empleadoAsistencia.findUnique({
    where: { empleadoId_fecha: { empleadoId: datos.empleadoId, fecha } },
    select: { id: true },
  });

  if (existente) {
    throw new ErrorNegocio(
      "Ya hay una asistencia registrada para esa fecha. Editala en su lugar.",
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
    horaEntradaEsperada: empleado.horaEntradaEsperada,
    horaSalidaEsperada: empleado.horaSalidaEsperada,
    horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
    horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
  });

  await prisma.$transaction(async (tx) => {
    const asistencia = await tx.empleadoAsistencia.create({
      data: {
        empleadoId: datos.empleadoId,
        fecha,
        estado: datos.estado,
        origen: "MANUAL_ADMIN",
        ...tramos,
        minutosTrabajados: minutos.minutosTrabajados,
        minutosRetraso: minutos.minutosRetraso,
        minutosRetrasoTramo1: minutos.minutosRetrasoTramo1,
        minutosRetrasoTramo2: minutos.minutosRetrasoTramo2,
        observacion: datos.observacion ?? null,
      },
      select: { id: true },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.ASISTENCIA_REGISTRADA,
        entidad: "EmpleadoAsistencia",
        entidadId: asistencia.id,
        datos: {
          empleadoId: datos.empleadoId,
          fecha: datos.fecha,
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

  return { userId: empleado.userId };
}
