import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

export async function listarCategoriasActivas(): Promise<OpcionCampo[]> {
  const categorias = await prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return categorias.map((categoria) => ({
    valor: categoria.id,
    etiqueta: categoria.nombre,
  }));
}
