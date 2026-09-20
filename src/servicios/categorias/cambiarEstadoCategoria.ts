import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export async function cambiarEstadoCategoria(
  id: string,
  activo: boolean,
  usuarioId: string,
): Promise<void> {
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      _count: { select: { productos: { where: { activo: true } } } },
    },
  });

  if (!categoria) {
    throw new ErrorNegocio("La categoría no existe.");
  }

  if (!activo && categoria._count.productos > 0) {
    throw new ErrorNegocio(
      "No se puede desactivar una categoría con productos activos.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.categoria.update({ where: { id }, data: { activo } });

    await registrarAuditoria(
      {
        usuarioId,
        accion: activo
          ? ACCIONES_AUDITORIA.CATEGORIA_EDITADA
          : ACCIONES_AUDITORIA.CATEGORIA_DESACTIVADA,
        entidad: "Categoria",
        entidadId: id,
        datos: { nombre: categoria.nombre, activo },
      },
      tx,
    );
  });
}
