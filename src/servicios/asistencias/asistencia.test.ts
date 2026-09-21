import { test } from "node:test";
import assert from "node:assert/strict";
import { determinarProximoFichaje } from "@/servicios/asistencias/determinarProximoFichaje";
import { calcularMinutosJornada } from "@/servicios/asistencias/calcularMinutosJornada";
import { calcularEstadoJornada } from "@/servicios/asistencias/calcularEstadoJornada";
import { extraerTokenFichaje } from "@/lib/utilidades/extraerTokenFichaje";
import { PREFIJO_FICHAJE_QR } from "@/constantes/fichaje";
import type { TramosAsistencia } from "@/tipos/asistencia";

const vacio: TramosAsistencia = {
  horaEntrada: null,
  horaSalida: null,
  horaEntradaTramo2: null,
  horaSalidaTramo2: null,
};

test("secuencia: sin fichajes corresponde entrada 1", () => {
  assert.equal(determinarProximoFichaje(vacio, false), "ENTRADA_TRAMO_1");
});

test("secuencia: tras entrada 1 corresponde salida 1", () => {
  assert.equal(
    determinarProximoFichaje({ ...vacio, horaEntrada: "08:00" }, false),
    "SALIDA_TRAMO_1",
  );
});

test("secuencia: jornada continua completa tras tramo 1", () => {
  assert.equal(
    determinarProximoFichaje(
      { ...vacio, horaEntrada: "08:00", horaSalida: "16:00" },
      false,
    ),
    "COMPLETA",
  );
});

test("secuencia: jornada partida pide entrada 2 tras cerrar tramo 1", () => {
  assert.equal(
    determinarProximoFichaje(
      { ...vacio, horaEntrada: "08:00", horaSalida: "12:00" },
      true,
    ),
    "ENTRADA_TRAMO_2",
  );
});

test("secuencia: jornada partida completa tras los cuatro fichajes", () => {
  assert.equal(
    determinarProximoFichaje(
      {
        horaEntrada: "08:00",
        horaSalida: "12:00",
        horaEntradaTramo2: "16:00",
        horaSalidaTramo2: "20:00",
      },
      true,
    ),
    "COMPLETA",
  );
});

test("minutos: retraso de 15 minutos en jornada continua", () => {
  const resultado = calcularMinutosJornada({
    estado: "PRESENTE",
    tramos: { ...vacio, horaEntrada: "08:15", horaSalida: "12:00" },
    horaEntradaEsperada: "08:00",
    horaSalidaEsperada: "12:00",
    horaEntradaTramo2Esperada: null,
    horaSalidaTramo2Esperada: null,
  });

  assert.equal(resultado.minutosTrabajados, 225);
  assert.equal(resultado.minutosRetraso, 15);
  assert.equal(resultado.completa, true);
});

test("minutos: jornada partida suma tramos y retrasos", () => {
  const resultado = calcularMinutosJornada({
    estado: "PRESENTE",
    tramos: {
      horaEntrada: "08:15",
      horaSalida: "12:00",
      horaEntradaTramo2: "16:10",
      horaSalidaTramo2: "20:00",
    },
    horaEntradaEsperada: "08:00",
    horaSalidaEsperada: "12:00",
    horaEntradaTramo2Esperada: "16:00",
    horaSalidaTramo2Esperada: "20:00",
  });

  assert.equal(resultado.minutosTrabajados, 455);
  assert.equal(resultado.minutosRetrasoTramo1, 15);
  assert.equal(resultado.minutosRetrasoTramo2, 10);
  assert.equal(resultado.minutosRetraso, 25);
  assert.equal(resultado.completa, true);
});

test("minutos: jornada incompleta no suma horas ni retraso", () => {
  const resultado = calcularMinutosJornada({
    estado: "PRESENTE",
    tramos: { ...vacio, horaEntrada: "08:05" },
    horaEntradaEsperada: "08:00",
    horaSalidaEsperada: "16:00",
    horaEntradaTramo2Esperada: null,
    horaSalidaTramo2Esperada: null,
  });

  assert.equal(resultado.minutosTrabajados, 0);
  assert.equal(resultado.minutosRetraso, 0);
  assert.equal(resultado.completa, false);
});

test("estado: entrada sin salida queda tramo 1 en curso", () => {
  assert.equal(
    calcularEstadoJornada({
      estado: "PRESENTE",
      tramos: { ...vacio, horaEntrada: "08:05" },
      esperaSegundoTramo: false,
    }),
    "TRAMO_1_EN_CURSO",
  );
});

test("estado: partida con tramo 1 cerrado queda tramo 2 pendiente", () => {
  assert.equal(
    calcularEstadoJornada({
      estado: "PRESENTE",
      tramos: { ...vacio, horaEntrada: "08:00", horaSalida: "12:00" },
      esperaSegundoTramo: true,
    }),
    "TRAMO_2_PENDIENTE",
  );
});

test("estado: ausencia se refleja como ausente", () => {
  assert.equal(
    calcularEstadoJornada({
      estado: "AUSENTE",
      tramos: vacio,
      esperaSegundoTramo: false,
    }),
    "AUSENTE",
  );
});

test("token QR: extrae el token con prefijo válido", () => {
  assert.equal(
    extraerTokenFichaje(`${PREFIJO_FICHAJE_QR}abc123`),
    "abc123",
  );
});

test("token QR: rechaza un contenido sin prefijo", () => {
  assert.equal(extraerTokenFichaje("https://ejemplo.com"), null);
});
