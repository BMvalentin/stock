import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { datosAuditoriaCuentaPago } from "@/servicios/proveedores/datosAuditoriaCuentaPago";

// Establece una cuenta como principal. Garantiza que solo haya una principal
// activa por proveedor dentro de una transacción: primero quita la marca de las
// demás y luego marca la elegida.
export async function cambiarCuentaPrincipalProveedor(
  proveedorId: string,
  cuentaId: string,
  usuarioId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const cuenta = await tx.cuentaPagoProveedor.findFirst({
      where: { id: cuentaId, proveedorId },
      select: {
        id: true,
        proveedorId: true,
        esPrincipal: true,
        activo: true,
        metodoPago: true,
        alias: true,
        cbu: true,
        cvu: true,
        banco: true,
      },
    });

    if (!cuenta) {
      throw new ErrorNegocio("La cuenta de pago no existe.");
    }

    if (!cuenta.activo) {
      throw new ErrorNegocio("Una cuenta inactiva no puede ser principal.");
    }

    if (cuenta.esPrincipal) return;

    await tx.cuentaPagoProveedor.updateMany({
      where: { proveedorId, esPrincipal: true },
      data: { esPrincipal: false },
    });

    const actualizada = await tx.cuentaPagoProveedor.update({
      where: { id: cuentaId },
      data: { esPrincipal: true },
      select: {
        id: true,
        proveedorId: true,
        metodoPago: true,
        alias: true,
        cbu: true,
        cvu: true,
        banco: true,
        esPrincipal: true,
        activo: true,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.CUENTA_PAGO_PROVEEDOR_PRINCIPAL_CAMBIADA,
        entidad: "CuentaPagoProveedor",
        entidadId: actualizada.id,
        datos: datosAuditoriaCuentaPago(actualizada),
      },
      tx,
    );
  });
}
