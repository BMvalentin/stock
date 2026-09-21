import { Prisma } from "@/generated/prisma/client";
import { horaAMinutos } from "@/lib/utilidades/horaAMinutos";
import type { EstadoAsistencia } from "@/generated/prisma/enums";

export type AsistenciaCalculo = {
  id: string;
  fecha: Date;
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
  minutosTrabajados: number | null;
  minutosRetraso: number | null;
  estado: EstadoAsistencia;
};

export type LineaHoraCalculada = {
  asistenciaId: string;
  fecha: string;
  horaEntrada: string | null;
  horaSalida: string | null;
  minutosTrabajados: number;
  minutosRetraso: number;
  incompleta: boolean;
  pago: string;
};

export type ResumenRemuneracionHora = {
  lineas: LineaHoraCalculada[];
  jornadas: number;
  incompletas: number;
  minutosEsperados: number;
  minutosTrabajados: number;
  minutosRetraso: number;
  descuento: string;
  total: string;
};

// Calcula el pago por hora de un período. El valor minuto surge de
// `pagoJornada / (horasJornada * 60)`; el pago de cada jornada es proporcional
// a los minutos trabajados, con tope en la jornada completa. Soporta jornada
// partida (tramo 1 + tramo 2) usando los totales del día. Una jornada
// incompleta (falta cerrar un tramo) no se paga ni descuenta retraso.
export function calcularRemuneracionPorHora(datos: {
  asistencias: AsistenciaCalculo[];
  horasJornada: Prisma.Decimal | string;
  pagoJornada: Prisma.Decimal | string;
  horaEntradaEsperada: string;
  horaEntradaTramo2Esperada?: string | null;
  horaSalidaTramo2Esperada?: string | null;
}): ResumenRemuneracionHora {
  const horas = new Prisma.Decimal(datos.horasJornada);
  const pago = new Prisma.Decimal(datos.pagoJornada);
  const minutosJornada = horas.mul(60);
  const valorMinuto = minutosJornada.gt(0)
    ? pago.div(minutosJornada)
    : new Prisma.Decimal(0);

  const entradaEsperada = horaAMinutos(datos.horaEntradaEsperada);
  const entrada2Esperada =
    datos.horaEntradaTramo2Esperada &&
    datos.horaSalidaTramo2Esperada
      ? horaAMinutos(datos.horaEntradaTramo2Esperada)
      : null;

  const lineas: LineaHoraCalculada[] = [];
  let jornadas = 0;
  let incompletas = 0;
  let minutosTrabajados = 0;
  let minutosRetraso = 0;
  let descuento = new Prisma.Decimal(0);
  let total = new Prisma.Decimal(0);

  for (const asistencia of datos.asistencias) {
    const fecha = asistencia.fecha.toISOString().slice(0, 10);

    if (asistencia.estado !== "PRESENTE") {
      lineas.push({
        asistenciaId: asistencia.id,
        fecha,
        horaEntrada: asistencia.horaEntrada,
        horaSalida: asistencia.horaSalida,
        minutosTrabajados: 0,
        minutosRetraso: 0,
        incompleta: false,
        pago: "0.00",
      });
      continue;
    }

    const completa = jornadaCompleta(asistencia, entrada2Esperada !== null);

    if (!completa) {
      incompletas += 1;
      lineas.push({
        asistenciaId: asistencia.id,
        fecha,
        horaEntrada: asistencia.horaEntrada,
        horaSalida: asistencia.horaSalida,
        minutosTrabajados: 0,
        minutosRetraso: 0,
        incompleta: true,
        pago: "0.00",
      });
      continue;
    }

    jornadas += 1;

    const trabajados =
      asistencia.minutosTrabajados ?? minutosTrabajadosDe(asistencia);

    const retraso =
      asistencia.minutosRetraso ??
      minutosRetrasoDe(asistencia, entradaEsperada, entrada2Esperada);

    const pagoProporcional = valorMinuto.mul(trabajados).toDecimalPlaces(2);
    const pagoDia = Prisma.Decimal.min(pagoProporcional, pago);
    const descuentoDia = pago.sub(pagoDia).toDecimalPlaces(2);

    minutosTrabajados += trabajados;
    minutosRetraso += retraso;
    descuento = descuento.add(descuentoDia);
    total = total.add(pagoDia);

    lineas.push({
      asistenciaId: asistencia.id,
      fecha,
      horaEntrada: asistencia.horaEntrada,
      horaSalida: asistencia.horaSalida,
      minutosTrabajados: trabajados,
      minutosRetraso: retraso,
      incompleta: false,
      pago: pagoDia.toFixed(2),
    });
  }

  return {
    lineas,
    jornadas,
    incompletas,
    minutosEsperados: minutosJornada.mul(jornadas).toNumber(),
    minutosTrabajados,
    minutosRetraso,
    descuento: descuento.toFixed(2),
    total: total.toFixed(2),
  };
}

function jornadaCompleta(
  asistencia: AsistenciaCalculo,
  esperaSegundoTramo: boolean,
): boolean {
  const tramo1 = Boolean(asistencia.horaEntrada && asistencia.horaSalida);

  if (!esperaSegundoTramo) return tramo1;

  return Boolean(
    tramo1 && asistencia.horaEntradaTramo2 && asistencia.horaSalidaTramo2,
  );
}

function minutosTrabajadosDe(asistencia: AsistenciaCalculo): number {
  const tramo1 =
    asistencia.horaEntrada && asistencia.horaSalida
      ? Math.max(
          0,
          horaAMinutos(asistencia.horaSalida) -
            horaAMinutos(asistencia.horaEntrada),
        )
      : 0;

  const tramo2 =
    asistencia.horaEntradaTramo2 && asistencia.horaSalidaTramo2
      ? Math.max(
          0,
          horaAMinutos(asistencia.horaSalidaTramo2) -
            horaAMinutos(asistencia.horaEntradaTramo2),
        )
      : 0;

  return tramo1 + tramo2;
}

function minutosRetrasoDe(
  asistencia: AsistenciaCalculo,
  entradaEsperada: number,
  entrada2Esperada: number | null,
): number {
  const tramo1 = asistencia.horaEntrada
    ? Math.max(0, horaAMinutos(asistencia.horaEntrada) - entradaEsperada)
    : 0;

  const tramo2 =
    asistencia.horaEntradaTramo2 && entrada2Esperada !== null
      ? Math.max(
          0,
          horaAMinutos(asistencia.horaEntradaTramo2) - entrada2Esperada,
        )
      : 0;

  return tramo1 + tramo2;
}
