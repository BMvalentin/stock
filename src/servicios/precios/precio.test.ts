import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularPrecioLinea,
  type ReglaPrecioResoluble,
} from "@/servicios/precios/calcularPrecioLinea";

function unitaria(
  cantidadDesde: number,
  precio: number,
  cantidadHasta: number | null = null,
  metodoPagoId: string | null = null,
): ReglaPrecioResoluble {
  return {
    id: `u-${cantidadDesde}-${cantidadHasta ?? "inf"}-${precio}-${metodoPagoId ?? "gen"}`,
    metodoPagoId,
    cantidadDesde,
    cantidadHasta,
    tipoPrecio: "UNITARIO",
    precio,
    prioridad: 0,
  };
}

function total(
  cantidad: number,
  precio: number,
  metodoPagoId: string | null = null,
): ReglaPrecioResoluble {
  return {
    id: `t-${cantidad}-${precio}-${metodoPagoId ?? "gen"}`,
    metodoPagoId,
    cantidadDesde: cantidad,
    cantidadHasta: null,
    tipoPrecio: "TOTAL",
    precio,
    prioridad: 0,
  };
}

const JABON: ReglaPrecioResoluble[] = [
  unitaria(1, 2000, 9),
  unitaria(10, 1800, 19),
  unitaria(20, 1600),
];

const SUELTO: ReglaPrecioResoluble[] = [
  unitaria(1, 3000),
  total(2, 5000),
  total(5, 11000),
];

test("unidad: aplica el tramo según la cantidad", () => {
  assert.equal(calcularPrecioLinea(JABON, "efectivo", 1)?.subtotal, 2000);
  assert.equal(calcularPrecioLinea(JABON, "efectivo", 10)?.subtotal, 18000);
  assert.equal(calcularPrecioLinea(JABON, "efectivo", 20)?.subtotal, 32000);
  assert.equal(calcularPrecioLinea(JABON, "efectivo", 12)?.subtotal, 21600);
});

test("unidad: el precio unitario refleja el tramo", () => {
  const resultado = calcularPrecioLinea(JABON, "efectivo", 12);
  assert.equal(resultado?.desglose.precioUnitario, 1800);
  assert.equal(resultado?.precioUnitario, 1800);
});

test("kg: aplica el precio por cantidad exacta", () => {
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 1)?.subtotal, 3000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 2)?.subtotal, 5000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 5)?.subtotal, 11000);
});

test("kg: promoción en múltiplos + resto unitario", () => {
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 3)?.subtotal, 8000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 4)?.subtotal, 10000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 6)?.subtotal, 14000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 7)?.subtotal, 16000);
  assert.equal(calcularPrecioLinea(SUELTO, "efectivo", 10)?.subtotal, 22000);
});

test("kg: el desglose informa packs y resto", () => {
  const resultado = calcularPrecioLinea(SUELTO, "efectivo", 3);
  assert.equal(resultado?.desglose.tipo, "MIXTO");
  assert.equal(resultado?.desglose.cantidadUnitaria, 1);
  assert.deepEqual(resultado?.desglose.packs, [
    { cantidad: 2, precio: 5000, veces: 1 },
  ]);
});

test("bolsa: precio único de la modalidad", () => {
  const bolsa = [unitaria(1, 25000)];
  assert.equal(calcularPrecioLinea(bolsa, "efectivo", 1)?.subtotal, 25000);
  assert.equal(calcularPrecioLinea(bolsa, "efectivo", 3)?.subtotal, 75000);
});

test("método de pago: la regla específica gana a la genérica", () => {
  const reglas = [unitaria(1, 3000), unitaria(1, 2800, null, "transferencia")];
  assert.equal(calcularPrecioLinea(reglas, "transferencia", 1)?.subtotal, 2800);
  assert.equal(calcularPrecioLinea(reglas, "efectivo", 1)?.subtotal, 3000);
});

test("método de pago: si la específica no cubre, cae a la genérica", () => {
  const reglas = [
    unitaria(1, 3000),
    total(2, 5000, "transferencia"),
  ];
  assert.equal(calcularPrecioLinea(reglas, "transferencia", 1)?.subtotal, 3000);
  assert.equal(calcularPrecioLinea(reglas, "transferencia", 2)?.subtotal, 5000);
});

test("sin reglas aplicables devuelve null", () => {
  assert.equal(calcularPrecioLinea([], "efectivo", 1), null);
  assert.equal(calcularPrecioLinea([unitaria(10, 1000)], "efectivo", 1), null);
});
