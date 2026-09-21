import type { Prisma } from "@/generated/prisma/client";
import { enmascararCuentaBancaria } from "@/lib/utilidades/enmascararCuentaBancaria";

// Construye la metadata de auditoría de una cuenta de pago sin almacenar CBU ni
// CVU completos: se guardan enmascarados. La auditoría no debe convertirse en un
// repositorio de información bancaria sensible.
export function datosAuditoriaCuentaPago(cuenta: {
  proveedorId: string;
  metodoPago: string;
  alias: string | null;
  cbu: string | null;
  cvu: string | null;
  banco: string | null;
  esPrincipal: boolean;
  activo: boolean;
}): Prisma.InputJsonValue {
  return {
    proveedorId: cuenta.proveedorId,
    metodoPago: cuenta.metodoPago,
    alias: cuenta.alias,
    banco: cuenta.banco,
    cbu: cuenta.cbu ? enmascararCuentaBancaria(cuenta.cbu) : null,
    cvu: cuenta.cvu ? enmascararCuentaBancaria(cuenta.cvu) : null,
    esPrincipal: cuenta.esPrincipal,
    activo: cuenta.activo,
  };
}
