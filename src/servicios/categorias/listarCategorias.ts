import { prisma } from "@/lib/prisma/cliente";

export type CategoriaListada = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  cantidadProductos: number;
};

export type FiltrosCategorias = {
  pagina: number;
  porPagina: number;
};

export type ResultadoCategorias = {
  categorias: CategoriaListada[];
  total: number;
};

export async function listarCategorias(
  filtros: FiltrosCategorias,
): Promise<ResultadoCategorias> {
  const [total, categorias] = await Promise.all([
    prisma.categoria.count(),
    prisma.categoria.findMany({
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        _count: { select: { productos: true } },
      },
    }),
  ]);

  return {
    total,
    categorias: categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: categoria.activo,
      cantidadProductos: categoria._count.productos,
    })),
  };
}
