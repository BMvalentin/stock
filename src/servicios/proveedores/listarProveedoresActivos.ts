import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

// Proveedores activos para selects. Dato de cambio infrecuente: se cachea por
// peticiones. Las acciones de proveedor invalidan la etiqueta `proveedores`.
async function leerProveedoresActivos(): Promise<OpcionCampo[]> {
  const proveedores = await prisma.proveedor.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    take: 500,
    select: { id: true, nombre: true },
  });

  return proveedores.map((proveedor) => ({
    valor: proveedor.id,
    etiqueta: proveedor.nombre,
  }));
}

const listarProveedoresActivosEnCache = unstable_cache(
  leerProveedoresActivos,
  ["proveedores-activos"],
  { tags: ["proveedores"] },
);

export async function listarProveedoresActivos(): Promise<OpcionCampo[]> {
  return listarProveedoresActivosEnCache();
}
