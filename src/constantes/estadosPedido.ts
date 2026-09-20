import type { EstadoPedido } from "@/generated/prisma/enums";
import type { TonoEtiqueta } from "@/componentes/ui/Etiqueta";

export const ETIQUETAS_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Preparando",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const TONOS_ESTADO_PEDIDO: Record<EstadoPedido, TonoEtiqueta> = {
  PENDIENTE: "alerta",
  CONFIRMADO: "info",
  PREPARANDO: "info",
  LISTO: "info",
  ENTREGADO: "exito",
  CANCELADO: "peligro",
};

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "PREPARANDO",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];
