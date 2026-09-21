import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { datosAuditoriaCuentaPago } from "@/servicios/proveedores/datosAuditoriaCuentaPago";
import type {
  MetodoPagoProveedor,
  TipoCuentaProveedor,
} from "@/generated/prisma/enums";

export type DatosCuentaPagoProveedor = {
  metodoPago: MetodoPagoProveedor;
  tipoCuenta?: TipoCuentaProveedor;
  alias?: string;
  cbu?: string;
  cvu?: string;
  titular?: string;
  titularCuit?: string;
  banco?: string;
  esPrincipal: boolean;
  activo: boolean;
};

export async function crearCuentaPagoProveedor(
  proveedorId: string,
  datos: DatosCuentaPagoProveedor,
  usuarioId: string,
): Promise<{ id: string }> {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id: proveedorId },
    select: { id: true },
  });

  if (!proveedor) {
    throw new ErrorNegocio("El proveedor no existe.");
  }

  return prisma.$transaction(async (tx) => {
    const esPrincipal = datos.esPrincipal && datos.activo;

    if (esPrincipal) {
      await tx.cuentaPagoProveedor.updateMany({
        where: { proveedorId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    const cuenta = await tx.cuentaPagoProveedor.create({
      data: {
        proveedorId,
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
        accion: ACCIONES_AUDITORIA.CUENTA_PAGO_PROVEEDOR_CREADA,
        entidad: "CuentaPagoProveedor",
        entidadId: cuenta.id,
        datos: datosAuditoriaCuentaPago(cuenta),
      },
      tx,
    );

    return { id: cuenta.id };
  });
}
