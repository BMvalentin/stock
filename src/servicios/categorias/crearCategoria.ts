import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export type DatosCategoria = {
  nombre: string;
  descripcion?: string;
};

export async function crearCategoria(
  datos: DatosCategoria,
  usuarioId: string,
): Promise<{ id: string }> {
  const existente = await prisma.categoria.findUnique({
    where: { nombre: datos.nombre },
    select: { id: true },
  });

  if (existente) {
    throw new ErrorNegocio("Ya existe una categoría con ese nombre.");
  }

  return prisma.$transaction(async (tx) => {
    const categoria = await tx.categoria.create({
      data: { nombre: datos.nombre, descripcion: datos.descripcion ?? null },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.CATEGORIA_CREADA,
        entidad: "Categoria",
        entidadId: categoria.id,
        datos: { nombre: categoria.nombre },
      },
      tx,
    );

    return { id: categoria.id };
  });
}
