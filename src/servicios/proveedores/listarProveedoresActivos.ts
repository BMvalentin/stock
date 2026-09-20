import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

export async function listarProveedoresActivos(): Promise<OpcionCampo[]> {
  const proveedores = await prisma.proveedor.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });

  return proveedores.map((proveedor) => ({
    valor: proveedor.id,
    etiqueta: proveedor.nombre,
  }));
}
