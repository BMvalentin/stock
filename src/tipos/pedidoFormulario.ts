import type { PrecioListado } from "@/servicios/productos/listarProductos";
import type { UnidadVenta } from "@/generated/prisma/enums";

// Línea en edición dentro del formulario de pedido. Los precios por método de
// pago se usan solo para mostrar; el servidor recalcula al guardar.
export type LineaPedidoUI = {
  productoId: string;
  nombre: string;
  sku: string | null;
  unidadVenta: UnidadVenta;
  cantidad: number;
  precios: PrecioListado[];
  stockActual: number;
};

export type LineaResumenPedido = {
  productoId: string;
  nombreProducto: string;
  unidadVenta: UnidadVenta;
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
