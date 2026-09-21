import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { leerParametro } from "@/lib/utilidades/parametros";
import { normalizarPagina } from "@/lib/utilidades/normalizarPagina";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import { REGISTROS_POR_PAGINA } from "@/constantes/paginacion";
import { listarPedidos } from "@/servicios/pedidos/listarPedidos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  ESTADOS_PEDIDO,
} from "@/constantes/estadosPedido";
import {
  ETIQUETAS_ESTADO_PAGO,
  ESTADOS_PAGO,
} from "@/constantes/estadosPago";
import type {
  EstadoPago,
  EstadoPedido,
} from "@/generated/prisma/enums";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaPedidos } from "@/componentes/pedidos/TablaPedidos";

export const metadata = { title: "Pedidos" };

export default async function PaginaPedidos({
  searchParams,
}: PageProps<"/pedidos">) {
  const usuario = await requerirSesion();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const estadoCrudo = leerParametro(params.estado);
  const pagoCrudo = leerParametro(params.pago);
  const desde = parsearFechaFiltro(leerParametro(params.desde), false);
  const hasta = parsearFechaFiltro(leerParametro(params.hasta), true);
  const pagina = normalizarPagina(params.pagina);

  const estado = ESTADOS_PEDIDO.includes(estadoCrudo as EstadoPedido)
    ? (estadoCrudo as EstadoPedido)
    : undefined;
  const estadoPago = ESTADOS_PAGO.includes(pagoCrudo as EstadoPago)
    ? (pagoCrudo as EstadoPago)
    : undefined;

  const [configuracion, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarPedidos({
      busqueda,
      estado,
      estadoPago,
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
        titulo="Pedidos"
        descripcion={`${resultado.total} pedido(s). El estado del pedido y el del pago son independientes.`}
        acciones={
          usuario.rol === "ADMIN" ? (
            <EnlaceBoton href="/pedidos/nuevo" variante="primario">
              Nuevo pedido
            </EnlaceBoton>
          ) : undefined
        }
      />

      <BarraFiltros baseHref="/pedidos" limpiarHref="/pedidos">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por número, cliente o teléfono"
          className="w-full sm:w-72"
        />
        <SelectFiltro
          nombre="estado"
          valorInicial={estado}
          marcador="Todos los estados"
          opciones={ESTADOS_PEDIDO.map((valor) => ({
            valor,
            etiqueta: ETIQUETAS_ESTADO_PEDIDO[valor],
          }))}
        />
        <SelectFiltro
          nombre="pago"
          valorInicial={estadoPago}
          marcador="Todos los pagos"
          opciones={ESTADOS_PAGO.map((valor) => ({
            valor,
            etiqueta: ETIQUETAS_ESTADO_PAGO[valor],
          }))}
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

      {resultado.pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Sin pedidos"
          descripcion="No se encontraron pedidos con los filtros aplicados."
        />
      ) : (
        <TablaPedidos
          pedidos={resultado.pedidos}
          moneda={configuracion.moneda}
          locale={configuracion.locale}
        />
      )}

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        baseHref="/pedidos"
        parametros={{
          q: busqueda,
          estado,
          pago: estadoPago,
          desde: leerParametro(params.desde),
          hasta: leerParametro(params.hasta),
        }}
      />
    </div>
  );
}
