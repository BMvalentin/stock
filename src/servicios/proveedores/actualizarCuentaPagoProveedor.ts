import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { datosAuditoriaCuentaPago } from "@/servicios/proveedores/datosAuditoriaCuentaPago";
import { validarBajaCuentaPrincipal } from "@/servicios/proveedores/validarBajaCuentaPrincipal";
import type { DatosCuentaPagoProveedor } from "@/servicios/proveedores/crearCuentaPagoProveedor";

export async function actualizarCuentaPagoProveedor(
  proveedorId: string,
  cuentaId: string,
  datos: DatosCuentaPagoProveedor,
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

    if (!datos.activo && cuenta.esPrincipal) {
      await validarBajaCuentaPrincipal(cuenta, tx);
    }

    const esPrincipal = datos.esPrincipal && datos.activo;

    if (esPrincipal) {
      await tx.cuentaPagoProveedor.updateMany({
        where: { proveedorId, esPrincipal: true, NOT: { id: cuentaId } },
        data: { esPrincipal: false },
      });
    }

    const actualizada = await tx.cuentaPagoProveedor.update({
      where: { id: cuentaId },
      data: {
        metodoPago: datos.metodoPago,
        tipoCuenta: datos.tipoCuenta ?? null,
        alias: datos.alias ?? null,
        cbu: datos.cbu ?? null,
        cvu: datos.cvu ?? null,
        titular: datos.titular ?? null,
        titularCuit: datos.titularCuit ?? null,
        banco: datos.banco ?? null,
        esPrincipal,
        activo: datos.activo,
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
        accion: ACCIONES_AUDITORIA.CUENTA_PAGO_PROVEEDOR_EDITADA,
        entidad: "CuentaPagoProveedor",
        entidadId: actualizada.id,
        datos: datosAuditoriaCuentaPago(actualizada),
      },
      tx,
    );
  });
}
