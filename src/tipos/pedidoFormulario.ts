import type { PrecioListado } from "@/servicios/productos/listarProductos";
import type { UnidadVenta } from "@/generated/prisma/enums";

// Línea en edición dentro del formulario de pedido. Los precios por método de
// pago se usan solo para mostrar; el servidor recalcula al guardar.
export type LineaPedidoUI = {
  // Identificador estable de la línea en el formulario (producto + modalidad).
  id: string;
  productoId: string;
  nombre: string;
  sku: string | null;
  // Modalidad elegida para esta línea: `UNIDAD` (presentación/bulto) o
  // `KILOGRAMO` (venta suelta o producto por peso).
  modalidad: UnidadVenta;
  // Modalidad base del producto (para saber si la línea es venta suelta).
  unidadVenta: UnidadVenta;
  permiteVentaSuelta: boolean;
  pesoPresentacionKg: number | null;
  cantidad: number;
  precios: PrecioListado[];
  preciosSuelto: PrecioListado[];
  stockActual: number;
};

export type LineaResumenPedido = {
  productoId: string;
  nombreProducto: string;
  unidadVenta: UnidadVenta;
  pesoPresentacionKg: number | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
};

// Resumen calculado en el servidor (precios, envío y total reales).
export type ResumenPedidoCalculado = {
  lineas: LineaResumenPedido[];
  subtotal: number;
  costoEnvio: number;
  total: number;
};
