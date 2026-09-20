import { prisma } from "@/lib/prisma/cliente";

export type MetodoPagoActivo = {
  id: string;
  codigo: string;
  nombre: string;
};

export async function listarMetodosPagoActivos(): Promise<MetodoPagoActivo[]> {
  const metodos = await prisma.metodoPago.findMany({
    where: { activo: true },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: { id: true, codigo: true, nombre: true },
  });

  return metodos.map((metodo) => ({
    id: metodo.id,
    codigo: metodo.codigo,
    nombre: metodo.nombre,
  }));
}
