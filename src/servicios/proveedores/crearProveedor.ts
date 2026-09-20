import { prisma } from "@/lib/prisma/cliente";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";

export type DatosProveedor = {
  nombre: string;
  empresa?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  direccion?: string;
  notas?: string;
};

export async function crearProveedor(
  datos: DatosProveedor,
  usuarioId: string,
): Promise<{ id: string }> {
  return prisma.$transaction(async (tx) => {
    const proveedor = await tx.proveedor.create({
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
        accion: ACCIONES_AUDITORIA.PROVEEDOR_CREADO,
        entidad: "Proveedor",
        entidadId: proveedor.id,
        datos: { nombre: proveedor.nombre },
      },
      tx,
    );

    return { id: proveedor.id };
  });
}
