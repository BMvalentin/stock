import { prisma } from "@/lib/prisma/cliente";

export type ProductoDeProveedor = {
  id: string;
  nombre: string;
  sku: string;
  stockActual: number;
  esPrincipal: boolean;
  codigoProveedor: string | null;
  costo: number | null;
};

export type ProveedorDetalle = {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  productos: ProductoDeProveedor[];
};

export async function obtenerProveedor(
  id: string,
): Promise<ProveedorDetalle | null> {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      empresa: true,
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
    },
  });

  if (!proveedor) return null;

  return {
    id: proveedor.id,
    nombre: proveedor.nombre,
    empresa: proveedor.empresa,
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
      stockActual: vinculo.producto.stockActual,
      esPrincipal: vinculo.esPrincipal,
      codigoProveedor: vinculo.codigoProveedor,
      costo: vinculo.costo === null ? null : Number(vinculo.costo),
    })),
  };
}
