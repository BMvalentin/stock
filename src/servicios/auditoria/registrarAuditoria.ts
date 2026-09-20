import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/cliente";

export type EntradaAuditoria = {
  usuarioId?: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  datos?: Prisma.InputJsonValue;
  resultado?: string;
};

// Registra una acción administrativa. La auditoría es append-only: nunca se
// actualiza ni elimina desde la aplicación. Acepta un cliente transaccional
// para que el registro sea consistente con la operación que lo origina.
export async function registrarAuditoria(
  entrada: EntradaAuditoria,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const cliente = tx ?? prisma;

  await cliente.auditoria.create({
    data: {
      usuarioId: entrada.usuarioId ?? null,
      accion: entrada.accion,
      entidad: entrada.entidad,
      entidadId: entrada.entidadId ?? null,
      datos: entrada.datos,
      resultado: entrada.resultado ?? "OK",
    },
  });
}
