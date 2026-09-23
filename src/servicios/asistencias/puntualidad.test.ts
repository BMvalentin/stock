import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularPuntualidadEntrada } from "@/servicios/asistencias/calcularPuntualidadEntrada";

test("puntualidad: fichaje posterior a lo esperado es tarde", () => {
  const resultado = calcularPuntualidadEntrada({
    horaEsperada: "08:30",
    horaFichaje: "08:42",
  });

  assert.equal(resultado.estado, "TARDE");
  assert.equal(resultado.diferenciaMinutos, 12);
});

test("puntualidad: fichaje anterior a lo esperado es anticipado", () => {
  const resultado = calcularPuntualidadEntrada({
    horaEsperada: "08:30",
    horaFichaje: "08:21",
  });

  assert.equal(resultado.estado, "ANTICIPADO");
  assert.equal(resultado.diferenciaMinutos, -9);
});

test("puntualidad: fichaje exacto es a horario", () => {
  const resultado = calcularPuntualidadEntrada({
    horaEsperada: "08:30",
    horaFichaje: "08:30",
  });

  assert.equal(resultado.estado, "A_HORARIO");
  assert.equal(resultado.diferenciaMinutos, 0);
});

test("puntualidad: un minuto tarde", () => {
  const resultado = calcularPuntualidadEntrada({
    horaEsperada: "08:30",
    horaFichaje: "08:31",
  });

  assert.equal(resultado.estado, "TARDE");
  assert.equal(resultado.diferenciaMinutos, 1);
});

test("puntualidad: sin fichaje", () => {
  const resultado = calcularPuntualidadEntrada({
    horaEsperada: "08:30",
    horaFichaje: null,
  });

  assert.equal(resultado.estado, "SIN_FICHAJE");
  assert.equal(resultado.diferenciaMinutos, 0);
});
