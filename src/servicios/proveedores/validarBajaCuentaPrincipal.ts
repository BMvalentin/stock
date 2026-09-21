import type { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

// Regla de negocio: no se puede desactivar la cuenta principal de un proveedor
// si todavía existen otras cuentas activas. El usuario debe designar primero
// otra cuenta como principal. Evita dejar al proveedor sin principal de forma
// silenciosa.
export async function validarBajaCuentaPrincipal(
  cuenta: { id: string; proveedorId: string; esPrincipal: boolean },
  cliente: Prisma.TransactionClient,
): Promise<void> {
  if (!cuenta.esPrincipal) return;

  const otrasActivas = await cliente.cuentaPagoProveedor.count({
    where: {
      proveedorId: cuenta.proveedorId,
      activo: true,
      NOT: { id: cuenta.id },
    },
  });

  if (otrasActivas > 0) {
    throw new ErrorNegocio(
      "Asigná otra cuenta como principal antes de desactivar la actual.",
    );
  }
}
