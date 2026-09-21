import { prisma } from "@/lib/prisma/cliente";
import { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";
import { calcularRemuneracionPorHora } from "@/servicios/liquidaciones/calcularRemuneracionPorHora";
import { calcularRemuneracionProduccion } from "@/servicios/liquidaciones/calcularRemuneracionProduccion";
import type { TipoRemuneracion } from "@/generated/prisma/enums";

export type DetalleLiquidacion =
  | ({ tipo: "POR_HORA" } & ReturnType<typeof calcularRemuneracionPorHora>)
  | ({ tipo: "POR_PRODUCCION" } & ReturnType<
      typeof calcularRemuneracionProduccion
    >);

// Calcula y congela la liquidación de un empleado para un período. Según la
// modalidad usa solo horas o solo producción (nunca ambas). Guarda el total y
// el detalle como snapshot y vincula los registros incluidos para no pagarlos
// dos veces. Una liquidación calculada no se recalcula.
export async function calcularLiquidacionEmpleado(
  empleadoId: string,
  desdeTexto: string,
  hastaTexto: string,
  usuarioId: string,
): Promise<{ liquidacionId: string; userId: string; total: string }> {
  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: {
      id: true,
      userId: true,
      tipoRemuneracion: true,
      horasJornada: true,
      pagoJornada: true,
      horaEntradaEsperada: true,
      horaSalidaEsperada: true,
      horaEntradaTramo2Esperada: true,
      horaSalidaTramo2Esperada: true,
    },
  });

  if (!empleado) {
    throw new ErrorNegocio("El empleado no existe.");
  }

  const desde = parsearFechaCalendario(desdeTexto);
  const hasta = parsearFechaCalendario(hastaTexto);

  if (!desde || !hasta) {
    throw new ErrorNegocio("El período es inválido.");
  }

  if (hasta < desde) {
    throw new ErrorNegocio(
      "La fecha de fin no puede ser anterior a la de inicio.",
    );
  }

  const solapada = await prisma.empleadoLiquidacion.findFirst({
    where: {
      empleadoId,
      estado: { not: "CANCELADA" },
      desde: { lte: hasta },
      hasta: { gte: desde },
    },
    select: { id: true },
  });

  if (solapada) {
    throw new ErrorNegocio(
      "Ya existe una liquidación que se superpone con ese período.",
    );
  }

  const { detalle, total } = await construirDetalle(
    empleado.tipoRemuneracion,
    empleadoId,
    desde,
    hasta,
    {
      horasJornada: empleado.horasJornada,
      pagoJornada: empleado.pagoJornada,
      horaEntradaEsperada: empleado.horaEntradaEsperada,
      horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
      horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
    },
  );

  const totalDecimal = new Prisma.Decimal(total);

  const liquidacionId = await prisma.$transaction(async (tx) => {
    const liquidacion = await tx.empleadoLiquidacion.upsert({
      where: {
        empleadoId_desde_hasta: { empleadoId, desde, hasta },
      },
      update: {
        tipoRemuneracion: empleado.tipoRemuneracion,
        total: totalDecimal,
        estado: "CALCULADA",
        detalle,
        calculadaEn: new Date(),
        pagadaEn: null,
      },
      create: {
        empleadoId,
        desde,
        hasta,
        tipoRemuneracion: empleado.tipoRemuneracion,
        total: totalDecimal,
        estado: "CALCULADA",
        detalle,
        calculadaEn: new Date(),
      },
      select: { id: true },
    });

    if (empleado.tipoRemuneracion === "POR_HORA") {
      await tx.empleadoAsistencia.updateMany({
        where: {
          empleadoId,
          fecha: { gte: desde, lte: hasta },
          liquidacionId: null,
        },
        data: { liquidacionId: liquidacion.id },
      });
    } else {
      await tx.empleadoProduccion.updateMany({
        where: {
          empleadoId,
          fecha: { gte: desde, lte: hasta },
          liquidacionId: null,
        },
        data: { liquidacionId: liquidacion.id },
      });
    }

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.LIQUIDACION_CALCULADA,
        entidad: "EmpleadoLiquidacion",
        entidadId: liquidacion.id,
        datos: {
          empleadoId,
          desde: desdeTexto,
          hasta: hastaTexto,
          tipoRemuneracion: empleado.tipoRemuneracion,
          total,
        },
      },
      tx,
    );

    return liquidacion.id;
  });

  return { liquidacionId, userId: empleado.userId, total };
}

async function construirDetalle(
  tipo: TipoRemuneracion,
  empleadoId: string,
  desde: Date,
  hasta: Date,
  configuracion: {
    horasJornada: Prisma.Decimal;
    pagoJornada: Prisma.Decimal;
    horaEntradaEsperada: string;
    horaEntradaTramo2Esperada: string | null;
    horaSalidaTramo2Esperada: string | null;
  },
): Promise<{ detalle: DetalleLiquidacion; total: string }> {
  if (tipo === "POR_HORA") {
    const asistencias = await prisma.empleadoAsistencia.findMany({
      where: {
        empleadoId,
        fecha: { gte: desde, lte: hasta },
        liquidacionId: null,
      },
      orderBy: { fecha: "asc" },
      select: {
        id: true,
        fecha: true,
        horaEntrada: true,
        horaSalida: true,
        horaEntradaTramo2: true,
        horaSalidaTramo2: true,
        minutosTrabajados: true,
        minutosRetraso: true,
        estado: true,
      },
    });

    if (asistencias.length === 0) {
      throw new ErrorNegocio("No hay asistencias para el período indicado.");
    }

    const resumen = calcularRemuneracionPorHora({
      asistencias,
      horasJornada: configuracion.horasJornada,
      pagoJornada: configuracion.pagoJornada,
      horaEntradaEsperada: configuracion.horaEntradaEsperada,
      horaEntradaTramo2Esperada: configuracion.horaEntradaTramo2Esperada,
      horaSalidaTramo2Esperada: configuracion.horaSalidaTramo2Esperada,
    });

    return { detalle: { tipo: "POR_HORA", ...resumen }, total: resumen.total };
  }

  const producciones = await prisma.empleadoProduccion.findMany({
    where: {
      empleadoId,
      fecha: { gte: desde, lte: hasta },
      liquidacionId: null,
    },
    orderBy: { fecha: "asc" },
    select: {
      productoId: true,
      cantidad: true,
      precioUnidad: true,
      total: true,
      producto: { select: { nombre: true } },
    },
  });

  if (producciones.length === 0) {
    throw new ErrorNegocio("No hay producción para el período indicado.");
  }

  const resumen = calcularRemuneracionProduccion(
    producciones.map((produccion) => ({
      productoId: produccion.productoId,
      productoNombre: produccion.producto.nombre,
      cantidad: produccion.cantidad,
      precioUnidad: produccion.precioUnidad,
      total: produccion.total,
    })),
  );

  return {
    detalle: { tipo: "POR_PRODUCCION", ...resumen },
    total: resumen.total,
  };
}
