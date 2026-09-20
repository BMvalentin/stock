import { prisma } from "@/lib/prisma/cliente";

export type ProveedorListado = {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  cantidadProductos: number;
};

export type FiltrosProveedores = {
  busqueda?: string;
  estado?: "ACTIVOS" | "INACTIVOS" | "TODOS";
};

export async function listarProveedores(
  filtros: FiltrosProveedores,
): Promise<ProveedorListado[]> {
  const proveedores = await prisma.proveedor.findMany({
    where: {
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
    },
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
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
      _count: { select: { productos: true } },
    },
  });

  return proveedores.map((proveedor) => ({
    id: proveedor.id,
    nombre: proveedor.nombre,
    empresa: proveedor.empresa,
    telefono: proveedor.telefono,
    whatsapp: proveedor.whatsapp,
    email: proveedor.email,
    direccion: proveedor.direccion,
    notas: proveedor.notas,
    activo: proveedor.activo,
    cantidadProductos: proveedor._count.productos,
  }));
}
