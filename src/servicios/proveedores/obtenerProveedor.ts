import { prisma } from "@/lib/prisma/cliente";
import type {
  MetodoPagoProveedor,
  TipoCuentaProveedor,
} from "@/generated/prisma/enums";

export type ProductoDeProveedor = {
  id: string;
  nombre: string;
  sku: string;
  stockActual: number;
  esPrincipal: boolean;
  codigoProveedor: string | null;
  costo: number | null;
};

export type CuentaPagoProveedorDetalle = {
  id: string;
  metodoPago: MetodoPagoProveedor;
  tipoCuenta: TipoCuentaProveedor | null;
  alias: string | null;
  cbu: string | null;
  cvu: string | null;
  titular: string | null;
  titularCuit: string | null;
  banco: string | null;
  esPrincipal: boolean;
  activo: boolean;
};

export type ProveedorDetalle = {
  id: string;
  nombre: string;
  empresa: string | null;
  cuit: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  productos: ProductoDeProveedor[];
  cuentasPago: CuentaPagoProveedorDetalle[];
};

export async function obtenerProveedor(
  id: string,
  incluirCuentasPago: boolean,
): Promise<ProveedorDetalle | null> {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      empresa: true,
      cuit: true,
      telefono: true,
      whatsapp: true,
      email: true,
      direccion: true,
      notas: true,
      activo: true,
      productos: {
        select: {
          esPrincipal: true,
          codigoProveedor: true,
          costo: true,
          producto: {
            select: { id: true, nombre: true, sku: true, stockActual: true },
          },
        },
      },
      // Los datos de pago solo se consultan para ADMIN: un EMPLEADO no debe
      // recibirlos ni siquiera en el payload del servidor.
      ...(incluirCuentasPago
        ? {
            cuentasPago: {
              orderBy: [
                { esPrincipal: "desc" as const },
                { activo: "desc" as const },
                { createdAt: "asc" as const },
              ],
              select: {
                id: true,
                metodoPago: true,
                tipoCuenta: true,
                alias: true,
                cbu: true,
                cvu: true,
                titular: true,
                titularCuit: true,
                banco: true,
                esPrincipal: true,
                activo: true,
              },
            },
          }
        : {}),
    },
  });

  if (!proveedor) return null;

  const cuentasPago = "cuentasPago" in proveedor ? proveedor.cuentasPago : [];

  return {
    id: proveedor.id,
    nombre: proveedor.nombre,
    empresa: proveedor.empresa,
    cuit: proveedor.cuit,
    telefono: proveedor.telefono,
    whatsapp: proveedor.whatsapp,
    email: proveedor.email,
    direccion: proveedor.direccion,
    notas: proveedor.notas,
    activo: proveedor.activo,
    productos: proveedor.productos.map((vinculo) => ({
      id: vinculo.producto.id,
      nombre: vinculo.producto.nombre,
      sku: vinculo.producto.sku,
      stockActual: Number(vinculo.producto.stockActual),
      esPrincipal: vinculo.esPrincipal,
      codigoProveedor: vinculo.codigoProveedor,
      costo: vinculo.costo === null ? null : Number(vinculo.costo),
    })),
    cuentasPago: cuentasPago.map((cuenta) => ({
      id: cuenta.id,
      metodoPago: cuenta.metodoPago,
      tipoCuenta: cuenta.tipoCuenta,
      alias: cuenta.alias,
      cbu: cuenta.cbu,
      cvu: cuenta.cvu,
      titular: cuenta.titular,
      titularCuit: cuenta.titularCuit,
      banco: cuenta.banco,
      esPrincipal: cuenta.esPrincipal,
      activo: cuenta.activo,
    })),
  };
}
