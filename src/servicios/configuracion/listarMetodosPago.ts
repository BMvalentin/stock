import { prisma } from "@/lib/prisma/cliente";

export type MetodoPagoListado = {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  orden: number;
  cantidadPrecios: number;
};

export async function listarMetodosPago(): Promise<MetodoPagoListado[]> {
  const metodos = await prisma.metodoPago.findMany({
    orderBy: [{ activo: "desc" }, { orden: "asc" }, { nombre: "asc" }],
    select: {
      id: true,
      codigo: true,
      nombre: true,
      activo: true,
      orden: true,
      _count: { select: { precios: true } },
    },
  });

  return metodos.map((metodo) => ({
    id: metodo.id,
    codigo: metodo.codigo,
    nombre: metodo.nombre,
    activo: metodo.activo,
    orden: metodo.orden,
    cantidadPrecios: metodo._count.precios,
  }));
}
