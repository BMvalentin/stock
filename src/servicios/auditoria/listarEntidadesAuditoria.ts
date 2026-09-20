import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

// Entidades distintas registradas en auditoría, para poblar el filtro.
export async function listarEntidadesAuditoria(): Promise<OpcionCampo[]> {
  const filas = await prisma.auditoria.findMany({
    distinct: ["entidad"],
    select: { entidad: true },
    orderBy: { entidad: "asc" },
  });

  return filas.map((fila) => ({
    valor: fila.entidad,
    etiqueta: fila.entidad,
  }));
}
