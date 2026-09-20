import { prisma } from "@/lib/prisma/cliente";

export type CategoriaListada = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  cantidadProductos: number;
};

export async function listarCategorias(): Promise<CategoriaListada[]> {
  const categorias = await prisma.categoria.findMany({
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      activo: true,
      _count: { select: { productos: true } },
    },
  });

  return categorias.map((categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    activo: categoria.activo,
    cantidadProductos: categoria._count.productos,
  }));
}
