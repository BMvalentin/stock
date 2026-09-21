import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarAsistencias } from "@/servicios/asistencias/listarAsistencias";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioAsistencia } from "@/componentes/empleados/FormularioAsistencia";
import { TablaAsistencias } from "@/componentes/empleados/TablaAsistencias";

export const metadata = { title: "Asistencia" };

export default async function PaginaAsistenciaEmpleado({
  params,
  searchParams,
}: PageProps<"/admin/empleados/[id]/asistencia">) {
  await requerirAdmin();
  const { id } = await params;
  const query = await searchParams;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const desde = parsearFechaFiltro(leerParametro(query.desde), false);
  const hasta = parsearFechaFiltro(leerParametro(query.hasta), true);
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: query.pagina,
    porPagina: query.porPagina,
  });

  const resultado = await listarAsistencias(empleado.id, {
    desde,
    hasta,
    pagina,
    porPagina,
  });
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);
  const fechaHoy = fechaHoyCalendario().toISOString().slice(0, 10);
  const baseHref = `/admin/empleados/${id}/asistencia`;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Asistencia · ${empleado.nombre ?? empleado.email}`}
        descripcion="Jornadas registradas y cálculo de retrasos."
        acciones={
          <EnlaceBoton href="/admin/empleados" variante="secundario">
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

      <BarraFiltros baseHref={baseHref} limpiarHref={baseHref}>
        <input
          type="date"
          name="desde"
          defaultValue={leerParametro(query.desde) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Desde"
        />
        <input
          type="date"
          name="hasta"
          defaultValue={leerParametro(query.hasta) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Hasta"
        />
      </BarraFiltros>

      <TablaAsistencias
        asistencias={resultado.asistencias}
        locale={configuracion.locale}
        esperaSegundoTramo={Boolean(
          empleado.horaEntradaTramo2Esperada &&
            empleado.horaSalidaTramo2Esperada,
        )}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref={baseHref}
        parametros={{
          desde: leerParametro(query.desde),
          hasta: leerParametro(query.hasta),
        }}
      />
    </div>
  );
}
