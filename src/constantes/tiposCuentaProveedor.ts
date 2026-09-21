import type { TipoCuentaProveedor } from "@/generated/prisma/enums";

export const ETIQUETAS_TIPO_CUENTA_PROVEEDOR: Record<
  TipoCuentaProveedor,
  string
> = {
  CAJA_AHORRO: "Caja de ahorro",
  CUENTA_CORRIENTE: "Cuenta corriente",
  CUENTA_VIRTUAL: "Cuenta virtual",
  OTRA: "Otra",
};

export const TIPOS_CUENTA_PROVEEDOR: TipoCuentaProveedor[] = [
  "CAJA_AHORRO",
  "CUENTA_CORRIENTE",
  "CUENTA_VIRTUAL",
  "OTRA",
];
