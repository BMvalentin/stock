import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

// Entidades distintas registradas en auditoría, para poblar el filtro.
// `groupBy` evita ordenar toda la tabla como haría `distinct` y el `take`
// acota la cantidad de opciones devueltas.
export async function listarEntidadesAuditoria(): Promise<OpcionCampo[]> {
  const filas = await prisma.auditoria.groupBy({
    by: ["entidad"],
    orderBy: { entidad: "asc" },
    take: 100,
  });

  return filas.map((fila) => ({
    valor: fila.entidad,
    etiqueta: fila.entidad,
  }));
}
