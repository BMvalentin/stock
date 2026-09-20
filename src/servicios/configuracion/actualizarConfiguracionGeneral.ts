import { prisma } from "@/lib/prisma/cliente";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";

export type DatosConfiguracionGeneral = {
  nombreComercio: string;
  moneda: string;
  locale: string;
};

export async function actualizarConfiguracionGeneral(
  datos: DatosConfiguracionGeneral,
  usuarioId: string,
): Promise<void> {
  const configuracion = await obtenerConfiguracionGeneral();

  await prisma.$transaction(async (tx) => {
    await tx.configuracionGeneral.update({
      where: { id: configuracion.id },
      data: {
        nombreComercio: datos.nombreComercio,
        moneda: datos.moneda,
        locale: datos.locale,
      },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.CONFIGURACION_ACTUALIZADA,
        entidad: "ConfiguracionGeneral",
        entidadId: configuracion.id,
        datos,
      },
      tx,
    );
  });
}
