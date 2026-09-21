import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { datosAuditoriaCuentaPago } from "@/servicios/proveedores/datosAuditoriaCuentaPago";
import { validarBajaCuentaPrincipal } from "@/servicios/proveedores/validarBajaCuentaPrincipal";

// Baja lógica (activo = false) o reactivación de una cuenta de pago. No se
// elimina físicamente para no romper el historial.
export async function cambiarEstadoCuentaPagoProveedor(
  proveedorId: string,
  cuentaId: string,
  activo: boolean,
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
      },
    });

    if (!cuenta) {
      throw new ErrorNegocio("La cuenta de pago no existe.");
    }

    if (!activo) {
      await validarBajaCuentaPrincipal(cuenta, tx);
    }

    const actualizada = await tx.cuentaPagoProveedor.update({
      where: { id: cuentaId },
      data: {
        activo,
        // Una cuenta inactiva no puede quedar como principal.
        ...(activo ? {} : { esPrincipal: false }),
      },
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
        accion: activo
          ? ACCIONES_AUDITORIA.CUENTA_PAGO_PROVEEDOR_ACTIVADA
          : ACCIONES_AUDITORIA.CUENTA_PAGO_PROVEEDOR_DESACTIVADA,
        entidad: "CuentaPagoProveedor",
        entidadId: actualizada.id,
        datos: datosAuditoriaCuentaPago(actualizada),
      },
      tx,
    );
  });
}
