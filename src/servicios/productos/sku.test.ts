import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrarSkuDuplicado } from "@/servicios/productos/filtrarSkuDuplicado";
import { esquemaProducto } from "@/lib/validaciones/productos";

type Producto = { id: string; sku: string | null };

// Productos de prueba: dos con SKU y varios sin SKU (NULL), que deben poder
// convivir entre sí.
const PRODUCTOS: Producto[] = [
  { id: "123", sku: "ABC123" },
  { id: "456", sku: "XYZ999" },
  { id: "789", sku: null },
  { id: "790", sku: null },
];

function buscar(
  filtro: { sku: string; NOT?: { id: string } } | null,
): Producto | null {
  if (!filtro) return null;

  return (
    PRODUCTOS.find(
      (producto) =>
        producto.sku === filtro.sku &&
        (!filtro.NOT || producto.id !== filtro.NOT.id),
    ) ?? null
  );
}

function hayDuplicado(sku: string | null, idExcluir?: string): boolean {
  return buscar(filtrarSkuDuplicado(sku, idExcluir)) !== null;
}

test("crear sin SKU: permitido", () => {
  assert.equal(hayDuplicado(null), false);
  assert.equal(hayDuplicado(""), false);
});

test("crear con SKU nuevo: permitido", () => {
  assert.equal(hayDuplicado("NUEVO-1"), false);
});

test("crear con SKU existente: rechazado", () => {
  assert.equal(hayDuplicado("ABC123"), true);
});

test("editar manteniendo su propio SKU: permitido", () => {
  assert.equal(hayDuplicado("ABC123", "123"), false);
});

test("editar cambiando a un SKU nuevo: permitido", () => {
  assert.equal(hayDuplicado("NUEVO-2", "123"), false);
});

test("editar usando el SKU de otro producto: rechazado", () => {
  assert.equal(hayDuplicado("XYZ999", "123"), true);
});

test("editar eliminando el SKU: permitido", () => {
  assert.equal(hayDuplicado(null, "123"), false);
});

test("varios productos sin SKU: conviven sin bloquearse", () => {
  const sinSku = PRODUCTOS.filter((producto) => producto.sku === null);
  assert.equal(sinSku.length, 2);
  assert.equal(hayDuplicado(null, "789"), false);
  assert.equal(hayDuplicado(null, "790"), false);
});

test("filtro de alta no excluye ningún producto", () => {
  assert.deepEqual(filtrarSkuDuplicado("ABC123"), { sku: "ABC123" });
});

test("filtro de edición excluye el propio producto", () => {
  assert.deepEqual(filtrarSkuDuplicado("ABC123", "123"), {
    sku: "ABC123",
    NOT: { id: "123" },
  });
});

test("SKU vacío o nulo no genera consulta de unicidad", () => {
  assert.equal(filtrarSkuDuplicado(null), null);
  assert.equal(filtrarSkuDuplicado(""), null);
  assert.equal(filtrarSkuDuplicado("   "), null);
});

test("el formulario normaliza el SKU vacío para persistirlo como NULL", () => {
  const base = {
    barcode: "",
    nombre: "Producto",
    descripcion: "",
    categoriaId: "cat-1",
    stockMinimo: "0",
    unidadesPorBulto: "1",
  };

  assert.equal(esquemaProducto.parse({ ...base, sku: "" }).sku, undefined);
  assert.equal(esquemaProducto.parse({ ...base, sku: "   " }).sku, undefined);
  assert.equal(
    esquemaProducto.parse({ ...base, sku: "ABC123" }).sku,
    "ABC123",
  );
});
