import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";

export type TarifaProductoListado = {
  id: string;
  productoId: string;
  productoNombre: string;
  productoSku: string | null;
  precioUnidad: Prisma.Decimal;
  activo: boolean;
};

// Tarifas de producción de un empleado, con el producto asociado.
export async function listarTarifasProducto(
  empleadoId: string,
): Promise<TarifaProductoListado[]> {
  const tarifas = await prisma.empleadoTarifaProducto.findMany({
    where: { empleadoId },
    orderBy: [{ activo: "desc" }, { producto: { nombre: "asc" } }],
    select: {
      id: true,
      productoId: true,
      precioUnidad: true,
      activo: true,
      producto: { select: { nombre: true, sku: true } },
    },
  });

  return tarifas.map((tarifa) => ({
    id: tarifa.id,
    productoId: tarifa.productoId,
    productoNombre: tarifa.producto.nombre,
    productoSku: tarifa.producto.sku,
    precioUnidad: tarifa.precioUnidad,
    activo: tarifa.activo,
  }));
}
