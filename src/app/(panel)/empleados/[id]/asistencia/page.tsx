import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarAsistencias } from "@/servicios/asistencias/listarAsistencias";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioAsistencia } from "@/componentes/empleados/FormularioAsistencia";
import { TablaAsistencias } from "@/componentes/empleados/TablaAsistencias";

export const metadata = { title: "Asistencia" };

export default async function PaginaAsistenciaEmpleado({
  params,
}: PageProps<"/empleados/[id]/asistencia">) {
  await requerirAdmin();
  const { id } = await params;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const asistencias = await listarAsistencias(empleado.id, { limite: 60 });
  const fechaHoy = fechaHoyCalendario().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Asistencia · ${empleado.nombre ?? empleado.email}`}
        descripcion="Jornadas registradas y cálculo de retrasos."
        acciones={
          <EnlaceBoton href="/empleados" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <EnlacesEmpleado userId={empleado.userId} actual="asistencia" />

      {empleado.tipoRemuneracion !== "POR_HORA" ? (
        <Alerta tono="info">
          Este empleado se remunera por producción. La asistencia se registra
          igual, pero no se usa para liquidar.
        </Alerta>
      ) : null}

      <FormularioAsistencia
        empleadoId={empleado.id}
        fechaHoy={fechaHoy}
        entradaEsperada={empleado.horaEntradaEsperada}
        salidaEsperada={empleado.horaSalidaEsperada}
        entradaTramo2Esperada={empleado.horaEntradaTramo2Esperada ?? undefined}
        salidaTramo2Esperada={empleado.horaSalidaTramo2Esperada ?? undefined}
      />

      <TablaAsistencias
        asistencias={asistencias}
        locale={configuracion.locale}
        esperaSegundoTramo={Boolean(
          empleado.horaEntradaTramo2Esperada &&
            empleado.horaSalidaTramo2Esperada,
        )}
      />
    </div>
  );
}
