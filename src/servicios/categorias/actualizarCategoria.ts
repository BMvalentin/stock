import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export async function actualizarCategoria(
  id: string,
  datos: { nombre: string; descripcion?: string },
  usuarioId: string,
): Promise<void> {
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!categoria) {
    throw new ErrorNegocio("La categoría no existe.");
  }

  const duplicada = await prisma.categoria.findFirst({
    where: { nombre: datos.nombre, NOT: { id } },
    select: { id: true },
  });

  if (duplicada) {
    throw new ErrorNegocio("Ya existe otra categoría con ese nombre.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.categoria.update({
      where: { id },
      data: { nombre: datos.nombre, descripcion: datos.descripcion ?? null },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.CATEGORIA_EDITADA,
        entidad: "Categoria",
        entidadId: id,
        datos: { antes: categoria.nombre, despues: datos.nombre },
      },
      tx,
    );
  });
}
