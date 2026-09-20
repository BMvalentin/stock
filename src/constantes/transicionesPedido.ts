import type { EstadoPedido } from "@/generated/prisma/enums";

// Máquina de estados del pedido. Define qué transiciones son válidas.
export const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["PREPARANDO", "CANCELADO"],
  PREPARANDO: ["LISTO", "CANCELADO"],
  LISTO: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};
