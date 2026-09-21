import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import { enmascararCuentaBancaria } from "@/lib/utilidades/enmascararCuentaBancaria";

export type CuentaPagoResumen = {
  banco: string | null;
  alias: string | null;
  cbuEnmascarado: string | null;
  cvuEnmascarado: string | null;
};

export type ProveedorListado = {
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
  cantidadProductos: number;
  cuentaPrincipal: CuentaPagoResumen | null;
};

export type FiltrosProveedores = {
  busqueda?: string;
  estado?: "ACTIVOS" | "INACTIVOS" | "TODOS";
  // Solo el ADMIN debe recibir el resumen de la cuenta principal.
  incluirCuentaPago?: boolean;
  pagina: number;
  porPagina: number;
};

export type ResultadoProveedores = {
  proveedores: ProveedorListado[];
  total: number;
};

export async function listarProveedores(
  filtros: FiltrosProveedores,
): Promise<ResultadoProveedores> {
  const where: Prisma.ProveedorWhereInput = {
    ...(filtros.estado === "ACTIVOS"
      ? { activo: true }
      : filtros.estado === "INACTIVOS"
        ? { activo: false }
        : {}),
    ...(filtros.busqueda
      ? {
          OR: [
            { nombre: { contains: filtros.busqueda } },
            { empresa: { contains: filtros.busqueda } },
            { telefono: { contains: filtros.busqueda } },
          ],
        }
      : {}),
  };

  const [total, proveedores] = await Promise.all([
    prisma.proveedor.count({ where }),
    prisma.proveedor.findMany({
    where,
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    skip: (filtros.pagina - 1) * filtros.porPagina,
    take: filtros.porPagina,
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
      _count: { select: { productos: true } },
      // Se trae solo la principal activa (una como máximo) para evitar N+1.
      ...(filtros.incluirCuentaPago
        ? {
            cuentasPago: {
              where: { esPrincipal: true, activo: true },
              take: 1,
              select: {
                banco: true,
                alias: true,
                cbu: true,
                cvu: true,
              },
            },
          }
        : {}),
      },
    }),
  ]);

  return {
    total,
    proveedores: proveedores.map((proveedor) => {
      const cuenta =
        "cuentasPago" in proveedor ? proveedor.cuentasPago[0] : undefined;

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
        cantidadProductos: proveedor._count.productos,
        cuentaPrincipal: cuenta
          ? {
              banco: cuenta.banco,
              alias: cuenta.alias,
              cbuEnmascarado: cuenta.cbu
                ? enmascararCuentaBancaria(cuenta.cbu)
                : null,
              cvuEnmascarado: cuenta.cvu
                ? enmascararCuentaBancaria(cuenta.cvu)
                : null,
            }
          : null,
      };
    }),
  };
}
