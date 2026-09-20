import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { normalizarPagina } from "@/lib/utilidades/normalizarPagina";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import { REGISTROS_POR_PAGINA } from "@/constantes/paginacion";
import { listarAuditoria } from "@/servicios/auditoria/listarAuditoria";
import { listarEntidadesAuditoria } from "@/servicios/auditoria/listarEntidadesAuditoria";
import { listarAccionesAuditoria } from "@/servicios/auditoria/listarAccionesAuditoria";
import { listarUsuariosActivos } from "@/servicios/usuarios/listarUsuariosActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { ETIQUETAS_ACCION_AUDITORIA } from "@/constantes/accionesAuditoria";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

export const metadata = { title: "Auditoría" };

export default async function PaginaAuditoria({
  searchParams,
}: PageProps<"/auditoria">) {
  await requerirAdmin();
  const params = await searchParams;

  const usuarioId = leerParametro(params.usuario);
  const accion = leerParametro(params.accion);
  const entidad = leerParametro(params.entidad);
  const desde = parsearFechaFiltro(leerParametro(params.desde), false);
  const hasta = parsearFechaFiltro(leerParametro(params.hasta), true);
  const pagina = normalizarPagina(params.pagina);

  const [configuracion, usuarios, acciones, entidades, resultado] =
    await Promise.all([
      obtenerConfiguracionGeneral(),
      listarUsuariosActivos(),
      listarAccionesAuditoria(),
      listarEntidadesAuditoria(),
      listarAuditoria({
        usuarioId,
        accion,
        entidad,
        desde,
        hasta,
        pagina,
        porPagina: REGISTROS_POR_PAGINA,
      }),
    ]);

  const totalPaginas = calcularTotalPaginas(
    resultado.total,
    REGISTROS_POR_PAGINA,
  );

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Auditoría"
        descripcion={`${resultado.total} registro(s). Historial de solo lectura, no se puede editar ni eliminar.`}
      />

      <BarraFiltros baseHref="/auditoria" limpiarHref="/auditoria">
        <SelectFiltro
          nombre="usuario"
          valorInicial={usuarioId}
          marcador="Todos los usuarios"
          opciones={usuarios}
        />
        <SelectFiltro
          nombre="accion"
          valorInicial={accion}
          marcador="Todas las acciones"
          opciones={acciones}
        />
        <SelectFiltro
          nombre="entidad"
          valorInicial={entidad}
          marcador="Todas las entidades"
          opciones={entidades}
        />
        <input
          type="date"
          name="desde"
          defaultValue={leerParametro(params.desde) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Desde"
        />
        <input
          type="date"
          name="hasta"
          defaultValue={leerParametro(params.hasta) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Hasta"
        />
      </BarraFiltros>

      {resultado.registros.length === 0 ? (
        <EstadoVacio
          titulo="Sin registros"
          descripcion="No se encontraron acciones de auditoría con los filtros aplicados."
        />
      ) : (
        <TablaDatos
          columnas={[
            { encabezado: "Fecha" },
            { encabezado: "Usuario" },
            { encabezado: "Acción" },
            { encabezado: "Entidad" },
            { encabezado: "Resultado" },
            { encabezado: "Detalle" },
          ]}
          filas={resultado.registros.map((registro) => ({
            id: registro.id,
            celdas: [
              <span key="fecha" className="whitespace-nowrap text-xs text-zinc-500">
                {formatearFechaHora(registro.createdAt, configuracion.locale)}
              </span>,
              <span key="usuario" className="text-sm text-zinc-700">
                {registro.usuario ?? "Sistema"}
              </span>,
              <span key="accion" className="text-sm text-zinc-800">
                {ETIQUETAS_ACCION_AUDITORIA[registro.accion] ?? registro.accion}
              </span>,
              <div key="entidad" className="min-w-0">
                <p className="text-sm text-zinc-700">{registro.entidad}</p>
                {registro.entidadId ? (
                  <p className="truncate text-xs text-zinc-400">
                    {registro.entidadId}
                  </p>
                ) : null}
              </div>,
              <Etiqueta
                key="resultado"
                tono={registro.resultado === "OK" ? "exito" : "neutral"}
              >
                {registro.resultado ?? "OK"}
              </Etiqueta>,
              <details key="detalle" className="text-xs">
                <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
                  Ver datos
                </summary>
                <pre className="mt-2 max-w-xs overflow-x-auto rounded-md bg-zinc-50 p-2 text-[11px] text-zinc-600">
                  {JSON.stringify(registro.datos ?? {}, null, 2)}
                </pre>
              </details>,
            ],
          }))}
        />
      )}

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        baseHref="/auditoria"
        parametros={{
          usuario: usuarioId,
          accion,
          entidad,
          desde: leerParametro(params.desde),
          hasta: leerParametro(params.hasta),
        }}
      />
    </div>
  );
}
