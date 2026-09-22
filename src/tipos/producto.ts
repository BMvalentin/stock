import type { TipoPrecio, UnidadVenta } from "@/generated/prisma/enums";

// Modalidad de venta tal como la envía el formulario de producto. `id` solo
// está presente al editar una modalidad existente.
export type ModalidadEntrada = {
  id?: string;
  nombre: string;
  unidadVenta: UnidadVenta;
  // Stock que consume 1 unidad de la modalidad (null = 1).
  contenido: number | null;
  etiquetaPresentacion: string | null;
  esBase: boolean;
  activo: boolean;
  orden: number;
  reglas: ReglaPrecioEntrada[];
};

// Regla de precio tal como la envía el formulario. `metodoPagoId = null`
// significa que aplica a cualquier método de pago.
export type ReglaPrecioEntrada = {
  id?: string;
  metodoPagoId: string | null;
  cantidadDesde: number;
  cantidadHasta: number | null;
  tipoPrecio: TipoPrecio;
  precio: number;
  activo: boolean;
};
