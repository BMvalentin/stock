import type { EstadoPedido } from "@/generated/prisma/enums";
import { TRANSICIONES_PEDIDO } from "@/constantes/transicionesPedido";

export function puedeCambiarEstadoPedido(
  actual: EstadoPedido,
  siguiente: EstadoPedido,
): boolean {
  return TRANSICIONES_PEDIDO[actual].includes(siguiente);
}
