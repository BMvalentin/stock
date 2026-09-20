import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

export async function listarProductosParaSeleccion(): Promise<OpcionCampo[]> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, sku: true },
  });

  return productos.map((producto) => ({
    valor: producto.id,
    etiqueta: `${producto.nombre} (${producto.sku})`,
  }));
}
