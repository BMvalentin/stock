import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import type { DatosProveedor } from "@/servicios/proveedores/crearProveedor";

export async function actualizarProveedor(
  id: string,
  datos: DatosProveedor,
  usuarioId: string,
): Promise<void> {
  const proveedor = await prisma.proveedor.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });

  if (!proveedor) {
    throw new ErrorNegocio("El proveedor no existe.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.proveedor.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        empresa: datos.empresa ?? null,
        telefono: datos.telefono ?? null,
        whatsapp: datos.whatsapp ?? null,
        email: datos.email ?? null,
        direccion: datos.direccion ?? null,
        notas: datos.notas ?? null,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PROVEEDOR_EDITADO,
        entidad: "Proveedor",
        entidadId: id,
        datos: { antes: proveedor.nombre, despues: datos.nombre },
      },
      tx,
    );
  });
}
