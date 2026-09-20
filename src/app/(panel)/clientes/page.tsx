import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { normalizarPagina } from "@/lib/utilidades/normalizarPagina";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { REGISTROS_POR_PAGINA } from "@/constantes/paginacion";
import { listarClientes } from "@/servicios/clientes/listarClientes";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFecha } from "@/lib/utilidades/formatearFecha";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

export const metadata = { title: "Clientes" };

type FiltroEstado = "ACTIVOS" | "INACTIVOS" | "TODOS";

export default async function PaginaClientes({
  searchParams,
}: PageProps<"/clientes">) {
  await requerirAdmin();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const estadoCrudo = leerParametro(params.estado);
  const pagina = normalizarPagina(params.pagina);

  const estado: FiltroEstado =
    estadoCrudo === "ACTIVOS" || estadoCrudo === "INACTIVOS"
      ? estadoCrudo
      : "TODOS";

  const [configuracion, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarClientes({
      busqueda,
      estado,
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
        titulo="Clientes"
        descripcion={`${resultado.total} cliente(s) registrados.`}
      />

      <BarraFiltros baseHref="/clientes" limpiarHref="/clientes">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por nombre, teléfono o correo"
          className="w-full sm:w-72"
        />
        <SelectFiltro
          nombre="estado"
          valorInicial={estado === "TODOS" ? "" : estado}
          marcador="Todos los estados"
          opciones={[
            { valor: "ACTIVOS", etiqueta: "Activos" },
            { valor: "INACTIVOS", etiqueta: "Inactivos" },
          ]}
        />
      </BarraFiltros>

      {resultado.clientes.length === 0 ? (
        <EstadoVacio
          titulo="Sin clientes"
          descripcion="No se encontraron clientes con los filtros aplicados."
        />
      ) : (
        <TablaDatos
          columnas={[
            { encabezado: "Cliente" },
            { encabezado: "Contacto" },
            { encabezado: "Localidad" },
            { encabezado: "Pedidos", alineacion: "centro" },
            { encabezado: "Total comprado", alineacion: "der" },
            { encabezado: "Última compra" },
            { encabezado: "Estado" },
          ]}
          filas={resultado.clientes.map((cliente) => ({
            id: cliente.id,
            celdas: [
              <a
                key="nombre"
                href={`/clientes/${cliente.id}`}
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                {cliente.nombre}
              </a>,
              <div key="contacto" className="min-w-0 text-xs text-zinc-600">
                <p>{cliente.telefono}</p>
                {cliente.email ? (
                  <p className="truncate">{cliente.email}</p>
                ) : null}
              </div>,
              <span key="localidad" className="text-sm text-zinc-600">
                {cliente.localidad ?? "—"}
              </span>,
              <span key="pedidos" className="text-sm text-zinc-600">
                {cliente.cantidadPedidos}
              </span>,
              <span key="total" className="whitespace-nowrap text-sm font-medium text-zinc-900">
                {formatearMoneda(
                  cliente.totalComprado,
                  configuracion.moneda,
                  configuracion.locale,
                )}
              </span>,
              <span key="ultima" className="whitespace-nowrap text-xs text-zinc-500">
                {cliente.ultimaCompra
                  ? formatearFecha(cliente.ultimaCompra, configuracion.locale)
                  : "—"}
              </span>,
              <Etiqueta
                key="estado"
                tono={cliente.activo ? "exito" : "neutral"}
              >
                {cliente.activo ? "Activo" : "Inactivo"}
              </Etiqueta>,
            ],
          }))}
        />
      )}

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        baseHref="/clientes"
        parametros={{
          q: busqueda,
          estado: estado === "TODOS" ? undefined : estado,
        }}
      />
    </div>
  );
}
