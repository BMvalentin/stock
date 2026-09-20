import type { EstadoPedido } from "@/generated/prisma/enums";
import { TRANSICIONES_PEDIDO } from "@/constantes/transicionesPedido";

export function estadosSiguientesPedido(actual: EstadoPedido): EstadoPedido[] {
  return TRANSICIONES_PEDIDO[actual];
}
