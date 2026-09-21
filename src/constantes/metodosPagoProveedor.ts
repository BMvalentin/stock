import type { MetodoPagoProveedor } from "@/generated/prisma/enums";

export const ETIQUETAS_METODO_PAGO_PROVEEDOR: Record<
  MetodoPagoProveedor,
  string
> = {
  TRANSFERENCIA_BANCARIA: "Transferencia bancaria",
  TRANSFERENCIA_CVU: "Transferencia por CVU",
  MERCADO_PAGO: "Mercado Pago",
  EFECTIVO: "Efectivo",
  OTRO: "Otro",
};

export const METODOS_PAGO_PROVEEDOR: MetodoPagoProveedor[] = [
  "TRANSFERENCIA_BANCARIA",
  "TRANSFERENCIA_CVU",
  "MERCADO_PAGO",
  "EFECTIVO",
  "OTRO",
];
