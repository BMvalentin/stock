import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { ETIQUETAS_ACCION_AUDITORIA } from "@/constantes/accionesAuditoria";

// Acciones distintas registradas en auditoría, con etiqueta legible.
export async function listarAccionesAuditoria(): Promise<OpcionCampo[]> {
  const filas = await prisma.auditoria.findMany({
    distinct: ["accion"],
    select: { accion: true },
    orderBy: { accion: "asc" },
  });

  return filas.map((fila) => ({
    valor: fila.accion,
    etiqueta: ETIQUETAS_ACCION_AUDITORIA[fila.accion] ?? fila.accion,
  }));
}
