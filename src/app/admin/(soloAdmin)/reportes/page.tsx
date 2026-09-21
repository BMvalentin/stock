import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { leerParametro } from "@/lib/utilidades/parametros";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import { rangoMesActual } from "@/lib/utilidades/rangoMesActual";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { instanteEnZona } from "@/lib/utilidades/instanteEnZona";
import { sumarDiasCalendario } from "@/lib/utilidades/sumarDiasCalendario";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { obtenerReporteVentas } from "@/servicios/reportes/obtenerReporteVentas";
import { obtenerVentasPorRango } from "@/servicios/reportes/obtenerVentasPorRango";
import { obtenerProductosMasVendidos } from "@/servicios/reportes/obtenerProductosMasVendidos";
import { obtenerReporteStock } from "@/servicios/reportes/obtenerReporteStock";
import { obtenerReporteMovimientos } from "@/servicios/reportes/obtenerReporteMovimientos";
import { obtenerProductosCriticos } from "@/servicios/dashboard/obtenerProductosCriticos";
import {
  ETIQUETAS_TIPO_MOVIMIENTO,
  TIPOS_MOVIMIENTO,
} from "@/constantes/tiposMovimiento";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { cn } from "@/lib/utilidades/cn";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { TarjetaMetrica } from "@/componentes/dashboard/TarjetaMetrica";
import { GraficoVentas } from "@/componentes/dashboard/GraficoVentas";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { ListaStockCritico } from "@/componentes/dashboard/ListaStockCritico";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

export const metadata = { title: "Reportes" };

type Preset = "hoy" | "7d" | "30d" | "mes" | "personalizado";

const PRESETS: { valor: Preset; etiqueta: string }[] = [
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "7d", etiqueta: "7 días" },
  { valor: "30d", etiqueta: "30 días" },
  { valor: "mes", etiqueta: "Mes actual" },
];

function calcularPeriodo(
  preset: Preset,
  desdeParam?: string,
  hastaParam?: string,
): { desde: Date; hasta: Date } {
  const hoy = claveFechaEnZona(new Date(), ZONA_HORARIA);
  const finHoy = instanteEnZona(hoy, "23:59:59.999", ZONA_HORARIA);

  if (preset === "personalizado") {
    const mes = rangoMesActual();
    return {
      desde: parsearFechaFiltro(desdeParam, false) ?? mes.inicio,
      hasta: parsearFechaFiltro(hastaParam, true) ?? finHoy,
    };
  }

  if (preset === "hoy") {
    return {
      desde: instanteEnZona(hoy, "00:00:00.000", ZONA_HORARIA),
      hasta: finHoy,
    };
  }

  if (preset === "7d" || preset === "30d") {
    const dias = preset === "7d" ? 7 : 30;
    const primerDia = sumarDiasCalendario(hoy, -(dias - 1));
    return {
      desde: instanteEnZona(primerDia, "00:00:00.000", ZONA_HORARIA),
      hasta: finHoy,
    };
  }

  const mes = rangoMesActual();
  return { desde: mes.inicio, hasta: mes.fin };
}

export default async function PaginaReportes({
  searchParams,
}: PageProps<"/admin/reportes">) {
  await requerirAdmin();
  const params = await searchParams;

  const presetCrudo = leerParametro(params.preset);
  const preset: Preset = PRESETS.some((item) => item.valor === presetCrudo)
    ? (presetCrudo as Preset)
    : presetCrudo === "personalizado"
      ? "personalizado"
      : "mes";
  const { desde, hasta } = calcularPeriodo(
    preset,
    leerParametro(params.desde),
    leerParametro(params.hasta),
  );

  const [
    configuracion,
    ventas,
    serie,
    masVendidos,
    stock,
    movimientos,
    criticos,
  ] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerReporteVentas(desde, hasta),
    obtenerVentasPorRango(desde, hasta),
    obtenerProductosMasVendidos(desde, hasta),
    obtenerReporteStock(),
    obtenerReporteMovimientos(desde, hasta),
    obtenerProductosCriticos(10),
  ]);

  const { moneda, locale } = configuracion;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Reportes"
        descripcion="Ventas, stock, movimientos y productos más vendidos del período."
      />

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((item) => (
          <a
            key={item.valor}
            href={`/admin/reportes?preset=${item.valor}`}
            className={cn(
              "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors",
              preset === item.valor
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
            )}
          >
            {item.etiqueta}
          </a>
        ))}
      </div>

      <form
        action="/admin/reportes"
        method="get"
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="preset" value="personalizado" />
        <label className="space-y-1 text-xs text-zinc-500">
          <span className="block">Desde</span>
          <input
            type="date"
            name="desde"
            defaultValue={leerParametro(params.desde) ?? ""}
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </label>
        <label className="space-y-1 text-xs text-zinc-500">
          <span className="block">Hasta</span>
          <input
            type="date"
            name="hasta"
            defaultValue={leerParametro(params.hasta) ?? ""}
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Aplicar período
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Total vendido"
          valor={formatearMoneda(ventas.totalVendido, moneda, locale)}
          tono="exito"
        />
        <TarjetaMetrica
          etiqueta="Pedidos"
          valor={String(ventas.cantidadPedidos)}
        />
        <TarjetaMetrica
          etiqueta="Ticket promedio"
          valor={formatearMoneda(ventas.ticketPromedio, moneda, locale)}
        />
      </div>

      <PanelSeccion
        titulo="Ventas por día"
        descripcion="Pedidos no cancelados del período seleccionado."
      >
        <GraficoVentas datos={serie} moneda={moneda} locale={locale} />
      </PanelSeccion>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSeccion
          titulo="Productos más vendidos"
          descripcion="Por cantidad vendida en el período."
        >
          {masVendidos.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin ventas en el período.</p>
          ) : (
            <TablaDatos
              columnas={[
                { encabezado: "Producto" },
                { encabezado: "Cantidad", alineacion: "der" },
                { encabezado: "Total", alineacion: "der" },
              ]}
              filas={masVendidos.map((producto) => ({
                id: producto.productoId,
                celdas: [
                  <span key="nombre" className="text-sm text-zinc-800">
                    {producto.nombre}
                  </span>,
                  <span key="cantidad" className="font-medium text-zinc-900">
                    {producto.cantidad}
                  </span>,
                  <span key="total">
                    {formatearMoneda(producto.total, moneda, locale)}
                  </span>,
                ],
              }))}
            />
          )}
        </PanelSeccion>

        <PanelSeccion titulo="Stock" descripcion="Estado actual del inventario.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Resumen etiqueta="Productos activos" valor={stock.productosActivos} />
            <Resumen etiqueta="Unidades en stock" valor={stock.unidadesTotales} />
            <Resumen
              etiqueta="Stock bajo"
              valor={stock.stockBajo}
              tono="alerta"
            />
            <Resumen etiqueta="Sin stock" valor={stock.sinStock} tono="peligro" />
          </div>
        </PanelSeccion>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSeccion
          titulo="Movimientos del período"
          descripcion="Cantidad de movimientos por tipo."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {TIPOS_MOVIMIENTO.map((tipo) => (
              <Resumen
                key={tipo}
                etiqueta={ETIQUETAS_TIPO_MOVIMIENTO[tipo]}
                valor={movimientos.totales[tipo]}
              />
            ))}
          </div>
        </PanelSeccion>

        <PanelSeccion
          titulo="Productos con stock crítico"
          descripcion="Prioridad de reposición."
          enlace="/admin/stock"
        >
          <ListaStockCritico productos={criticos} />
        </PanelSeccion>
      </div>
    </div>
  );
}

function Resumen({
  etiqueta,
  valor,
  tono = "neutral",
}: {
  etiqueta: string;
  valor: number;
  tono?: "neutral" | "alerta" | "peligro";
}) {
  const color =
    tono === "peligro"
      ? "text-red-600"
      : tono === "alerta"
        ? "text-amber-600"
        : "text-zinc-900";

  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50/60 px-3 py-2">
      <p className="text-xs text-zinc-500">{etiqueta}</p>
      <p className={cn("text-lg font-semibold", color)}>{valor}</p>
    </div>
  );
}
