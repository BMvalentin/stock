import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { ETIQUETAS_ACCION_AUDITORIA } from "@/constantes/accionesAuditoria";

// Acciones distintas registradas en auditoría, con etiqueta legible. `groupBy`
// evita el ordenamiento global de `distinct`; el `take` acota las opciones.
export async function listarAccionesAuditoria(): Promise<OpcionCampo[]> {
  const filas = await prisma.auditoria.groupBy({
    by: ["accion"],
    orderBy: { accion: "asc" },
    take: 100,
  });

  return filas.map((fila) => ({
    valor: fila.accion,
    etiqueta: ETIQUETAS_ACCION_AUDITORIA[fila.accion] ?? fila.accion,
  }));
}
