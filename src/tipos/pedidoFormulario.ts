import type { UnidadVenta } from "@/generated/prisma/enums";

// Línea en edición dentro del formulario de pedido. El precio lo calcula el
// servidor; la UI solo guarda producto, modalidad y cantidad.
export type LineaPedidoUI = {
  // Identificador estable de la línea en el formulario (producto + modalidad).
  id: string;
  productoId: string;
  nombre: string;
  sku: string | null;
  modalidadId: string;
  modalidadNombre: string;
  // Unidad de la modalidad (unidad o kg).
  unidadVenta: UnidadVenta;
  // Contenido de la modalidad en la unidad de stock (null = 1).
  contenido: number | null;
  etiquetaPresentacion: string | null;
  cantidad: number;
  stockActual: number;
  unidadStock: UnidadVenta;
};

export type LineaResumenPedido = {
  productoId: string;
  nombreProducto: string;
  modalidadId: string;
  modalidadNombre: string;
  unidadVenta: UnidadVenta;
  contenido: number | null;
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
