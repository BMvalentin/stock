import { prisma } from "@/lib/prisma/cliente";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { obtenerConfiguracionEnvio } from "@/servicios/configuracion/obtenerConfiguracionEnvio";
import type { TipoCalculoEnvio } from "@/generated/prisma/enums";

export type DatosConfiguracionEnvio = {
  tipo: TipoCalculoEnvio;
  precio: number;
};

export async function actualizarConfiguracionEnvio(
  datos: DatosConfiguracionEnvio,
  usuarioId: string,
): Promise<void> {
  const configuracion = await obtenerConfiguracionEnvio();

  await prisma.$transaction(async (tx) => {
    await tx.configuracionEnvio.update({
      where: { id: configuracion.id },
      data: {
        tipo: datos.tipo,
        precio: datos.tipo === "SIN_CARGO" ? 0 : datos.precio,
        activo: true,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.ENVIO_ACTUALIZADO,
        entidad: "ConfiguracionEnvio",
        entidadId: configuracion.id,
        datos: {
          anterior: { tipo: configuracion.tipo, precio: configuracion.precio },
          nuevo: datos,
        },
      },
      tx,
    );
  });
}
