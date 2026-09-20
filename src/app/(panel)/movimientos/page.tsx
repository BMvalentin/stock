import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { normalizarPagina } from "@/lib/utilidades/normalizarPagina";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { REGISTROS_POR_PAGINA } from "@/constantes/paginacion";
import { listarMovimientos } from "@/servicios/movimientos/listarMovimientos";
import { listarProductosParaSeleccion } from "@/servicios/productos/listarProductosParaSeleccion";
import { listarUsuariosActivos } from "@/servicios/usuarios/listarUsuariosActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import {
  ETIQUETAS_TIPO_MOVIMIENTO,
  TIPOS_MOVIMIENTO,
  TONOS_TIPO_MOVIMIENTO,
} from "@/constantes/tiposMovimiento";
import { formatearFechaHora } from "@/lib/utilidades/formatearFechaHora";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import type { TipoMovimiento } from "@/generated/prisma/enums";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

export const metadata = { title: "Movimientos" };

export default async function PaginaMovimientos({
  searchParams,
}: PageProps<"/movimientos">) {
  await requerirAdmin();
  const params = await searchParams;

  const productoId = leerParametro(params.producto);
  const tipoCrudo = leerParametro(params.tipo);
  const usuarioId = leerParametro(params.usuario);
  const desde = parsearFechaFiltro(leerParametro(params.desde), false);
  const hasta = parsearFechaFiltro(leerParametro(params.hasta), true);
  const pagina = normalizarPagina(params.pagina);

  const tipo = TIPOS_MOVIMIENTO.includes(tipoCrudo as TipoMovimiento)
    ? (tipoCrudo as TipoMovimiento)
    : undefined;

  const [configuracion, productos, usuarios, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarProductosParaSeleccion(),
    listarUsuariosActivos(),
    listarMovimientos({
      productoId,
      tipo,
      usuarioId,
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
        titulo="Movimientos"
        descripcion={`${resultado.total} movimiento(s) registrados. Historial inmutable.`}
      />

      <BarraFiltros baseHref="/movimientos" limpiarHref="/movimientos">
        <SelectFiltro
          nombre="producto"
          valorInicial={productoId}
          marcador="Todos los productos"
          opciones={productos}
        />
        <SelectFiltro
          nombre="tipo"
          valorInicial={tipo}
          marcador="Todos los tipos"
          opciones={TIPOS_MOVIMIENTO.map((valor) => ({
            valor,
            etiqueta: ETIQUETAS_TIPO_MOVIMIENTO[valor],
          }))}
        />
        <SelectFiltro
          nombre="usuario"
          valorInicial={usuarioId}
          marcador="Todos los usuarios"
          opciones={usuarios}
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

      {resultado.movimientos.length === 0 ? (
        <EstadoVacio
          titulo="Sin movimientos"
          descripcion="No se encontraron movimientos con los filtros aplicados."
        />
      ) : (
        <TablaDatos
          columnas={[
            { encabezado: "Fecha" },
            { encabezado: "Producto" },
            { encabezado: "Tipo" },
            { encabezado: "Cantidad", alineacion: "der" },
            { encabezado: "Stock", alineacion: "der" },
            { encabezado: "Usuario" },
            { encabezado: "Motivo" },
          ]}
          filas={resultado.movimientos.map((movimiento) => ({
            id: movimiento.id,
            celdas: [
              <span key="fecha" className="whitespace-nowrap text-xs text-zinc-500">
                {formatearFechaHora(movimiento.createdAt, configuracion.locale)}
              </span>,
              <span key="producto" className="text-sm text-zinc-800">
                {movimiento.producto}
              </span>,
              <Etiqueta
                key="tipo"
                tono={TONOS_TIPO_MOVIMIENTO[movimiento.tipo]}
              >
                {ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]}
              </Etiqueta>,
              <span key="cantidad" className="font-medium text-zinc-900">
                {movimiento.cantidad}
              </span>,
              <span key="stock" className="text-xs text-zinc-500">
                {movimiento.stockAnterior} → {movimiento.stockPosterior}
              </span>,
              <span key="usuario" className="text-zinc-600">
                {movimiento.usuario ?? "—"}
              </span>,
              <span key="motivo" className="text-zinc-500">
                {movimiento.motivo ?? "—"}
              </span>,
            ],
          }))}
        />
      )}

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        baseHref="/movimientos"
        parametros={{
          producto: productoId,
          tipo,
          usuario: usuarioId,
          desde: leerParametro(params.desde),
          hasta: leerParametro(params.hasta),
        }}
      />
    </div>
  );
}
