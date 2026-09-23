import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

// Categorías activas para selects. Dato de cambio infrecuente: se cachea por
// peticiones. Las acciones de categoría invalidan la etiqueta `categorias`.
async function leerCategoriasActivas(): Promise<OpcionCampo[]> {
  const categorias = await prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    take: 500,
    select: { id: true, nombre: true },
  });

  return categorias.map((categoria) => ({
    valor: categoria.id,
    etiqueta: categoria.nombre,
  }));
}

const listarCategoriasActivasEnCache = unstable_cache(
  leerCategoriasActivas,
  ["categorias-activas"],
  { tags: ["categorias"] },
);

export async function listarCategoriasActivas(): Promise<OpcionCampo[]> {
  return listarCategoriasActivasEnCache();
}
