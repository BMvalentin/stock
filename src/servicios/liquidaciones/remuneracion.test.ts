import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularRemuneracionPorHora } from "@/servicios/liquidaciones/calcularRemuneracionPorHora";
import type { AsistenciaCalculo } from "@/servicios/liquidaciones/calcularRemuneracionPorHora";

function asistencia(
  campos: Partial<Omit<AsistenciaCalculo, "fecha">> & {
    id: string;
    fecha: string;
  },
): AsistenciaCalculo {
  return {
    horaEntrada: null,
    horaSalida: null,
    horaEntradaTramo2: null,
    horaSalidaTramo2: null,
    minutosTrabajados: null,
    minutosRetraso: null,
    estado: "PRESENTE",
    ...campos,
    fecha: new Date(`${campos.fecha}T00:00:00.000Z`),
  };
}

test("jornada continua completa paga la jornada completa", () => {
  const resumen = calcularRemuneracionPorHora({
    asistencias: [
      asistencia({
        id: "a1",
        fecha: "2026-09-01",
        horaEntrada: "08:00",
        horaSalida: "16:00",
        minutosTrabajados: 480,
        minutosRetraso: 0,
      }),
    ],
    horasJornada: "8",
    pagoJornada: "60000",
    horaEntradaEsperada: "08:00",
  });

  assert.equal(resumen.total, "60000.00");
  assert.equal(resumen.descuento, "0.00");
  assert.equal(resumen.jornadas, 1);
  assert.equal(resumen.incompletas, 0);
});

test("jornada partida completa paga la jornada completa", () => {
  const resumen = calcularRemuneracionPorHora({
    asistencias: [
      asistencia({
        id: "a1",
        fecha: "2026-09-01",
        horaEntrada: "08:00",
        horaSalida: "12:00",
        horaEntradaTramo2: "16:00",
        horaSalidaTramo2: "20:00",
        minutosTrabajados: 480,
        minutosRetraso: 0,
      }),
    ],
    horasJornada: "8",
    pagoJornada: "60000",
    horaEntradaEsperada: "08:00",
    horaEntradaTramo2Esperada: "16:00",
    horaSalidaTramo2Esperada: "20:00",
  });

  assert.equal(resumen.total, "60000.00");
  assert.equal(resumen.jornadas, 1);
});

test("jornada partida con 25 minutos de retraso descuenta proporcional", () => {
  const resumen = calcularRemuneracionPorHora({
    asistencias: [
      asistencia({
        id: "a1",
        fecha: "2026-09-01",
        horaEntrada: "08:15",
        horaSalida: "12:00",
        horaEntradaTramo2: "16:10",
        horaSalidaTramo2: "20:00",
        minutosTrabajados: 455,
        minutosRetraso: 25,
      }),
    ],
    horasJornada: "8",
    pagoJornada: "60000",
    horaEntradaEsperada: "08:00",
    horaEntradaTramo2Esperada: "16:00",
    horaSalidaTramo2Esperada: "20:00",
  });

  // 60000 / 480 * 455 = 56875
  assert.equal(resumen.total, "56875.00");
  assert.equal(resumen.descuento, "3125.00");
  assert.equal(resumen.minutosTrabajados, 455);
  assert.equal(resumen.minutosRetraso, 25);
});

test("jornada incompleta no se paga ni descuenta", () => {
  const resumen = calcularRemuneracionPorHora({
    asistencias: [
      asistencia({
        id: "a1",
        fecha: "2026-09-01",
        horaEntrada: "08:05",
      }),
    ],
    horasJornada: "8",
    pagoJornada: "60000",
    horaEntradaEsperada: "08:00",
  });

  assert.equal(resumen.total, "0.00");
  assert.equal(resumen.incompletas, 1);
  assert.equal(resumen.jornadas, 0);
  assert.equal(resumen.lineas[0].incompleta, true);
});

test("ausencia no genera pago", () => {
  const resumen = calcularRemuneracionPorHora({
    asistencias: [asistencia({ id: "a1", fecha: "2026-09-01", estado: "AUSENTE" })],
    horasJornada: "8",
    pagoJornada: "60000",
    horaEntradaEsperada: "08:00",
  });

  assert.equal(resumen.total, "0.00");
  assert.equal(resumen.jornadas, 0);
  assert.equal(resumen.incompletas, 0);
});
