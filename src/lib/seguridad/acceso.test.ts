import { test } from "node:test";
import assert from "node:assert/strict";
import { nivelRequeridoParaRuta } from "@/lib/seguridad/nivelRequeridoParaRuta";
import { puedeAcceder } from "@/lib/seguridad/puedeAcceder";

test("nivel: /admin y subrutas exigen ADMIN", () => {
  assert.equal(nivelRequeridoParaRuta("/admin"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/productos"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/productos/nuevo"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/stock"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/proveedores"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/empleados"), "ADMIN");
  assert.equal(nivelRequeridoParaRuta("/admin/configuracion"), "ADMIN");
});

test("nivel: /empleado y subrutas exigen EMPLEADO", () => {
  assert.equal(nivelRequeridoParaRuta("/empleado"), "EMPLEADO");
  assert.equal(nivelRequeridoParaRuta("/empleado/productos"), "EMPLEADO");
  assert.equal(nivelRequeridoParaRuta("/empleado/pedidos/123"), "EMPLEADO");
  assert.equal(nivelRequeridoParaRuta("/empleado/fichaje"), "EMPLEADO");
});

test("nivel: login y auth son públicos", () => {
  assert.equal(nivelRequeridoParaRuta("/login"), "PUBLICO");
  assert.equal(nivelRequeridoParaRuta("/api/auth/callback/google"), "PUBLICO");
});

test("nivel: rutas no listadas exigen ADMIN por defecto", () => {
  assert.equal(nivelRequeridoParaRuta("/desconocida"), "ADMIN");
});

test("acceso: ADMIN puede entrar a rutas administrativas", () => {
  assert.equal(puedeAcceder("ADMIN", "/admin"), true);
  assert.equal(puedeAcceder("ADMIN", "/admin/productos"), true);
  assert.equal(puedeAcceder("ADMIN", "/admin/stock"), true);
  assert.equal(puedeAcceder("ADMIN", "/admin/empleados"), true);
});

test("acceso: ADMIN no entra al área del empleado", () => {
  assert.equal(puedeAcceder("ADMIN", "/empleado"), false);
  assert.equal(puedeAcceder("ADMIN", "/empleado/productos"), false);
});

test("acceso: EMPLEADO rechazado en rutas administrativas", () => {
  assert.equal(puedeAcceder("EMPLEADO", "/admin"), false);
  assert.equal(puedeAcceder("EMPLEADO", "/admin/productos"), false);
  assert.equal(puedeAcceder("EMPLEADO", "/admin/stock"), false);
  assert.equal(puedeAcceder("EMPLEADO", "/admin/empleados"), false);
});

test("acceso: EMPLEADO puede entrar a su área", () => {
  assert.equal(puedeAcceder("EMPLEADO", "/empleado"), true);
  assert.equal(puedeAcceder("EMPLEADO", "/empleado/productos"), true);
  assert.equal(puedeAcceder("EMPLEADO", "/empleado/pedidos"), true);
  assert.equal(puedeAcceder("EMPLEADO", "/empleado/fichaje"), true);
});

test("acceso: sin sesión solo rutas públicas", () => {
  assert.equal(puedeAcceder(null, "/login"), true);
  assert.equal(puedeAcceder(null, "/admin"), false);
  assert.equal(puedeAcceder(null, "/empleado"), false);
});
