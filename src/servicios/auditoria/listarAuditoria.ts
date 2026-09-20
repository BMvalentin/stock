import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";

export type FiltrosAuditoria = {
  usuarioId?: string;
  accion?: string;
  entidad?: string;
  desde?: Date;
  hasta?: Date;
  pagina: number;
  porPagina: number;
};

export type RegistroAuditoria = {
  id: string;
  createdAt: Date;
  usuario: string | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  datos: unknown;
  resultado: string | null;
};

export type ResultadoAuditoria = {
  registros: RegistroAuditoria[];
  total: number;
};

export async function listarAuditoria(
  filtros: FiltrosAuditoria,
): Promise<ResultadoAuditoria> {
  const where: Prisma.AuditoriaWhereInput = {
    ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
    ...(filtros.accion ? { accion: filtros.accion } : {}),
    ...(filtros.entidad ? { entidad: filtros.entidad } : {}),
    ...(filtros.desde || filtros.hasta
      ? {
          createdAt: {
            ...(filtros.desde ? { gte: filtros.desde } : {}),
            ...(filtros.hasta ? { lte: filtros.hasta } : {}),
          },
        }
      : {}),
  };

  const [total, registros] = await Promise.all([
    prisma.auditoria.count({ where }),
    prisma.auditoria.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        createdAt: true,
        accion: true,
        entidad: true,
        entidadId: true,
        datos: true,
        resultado: true,
        usuario: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    total,
    registros: registros.map((registro) => ({
      id: registro.id,
      createdAt: registro.createdAt,
      usuario: registro.usuario
        ? (registro.usuario.name ?? registro.usuario.email)
        : null,
      accion: registro.accion,
      entidad: registro.entidad,
      entidadId: registro.entidadId,
      datos: registro.datos,
      resultado: registro.resultado,
    })),
  };
}
