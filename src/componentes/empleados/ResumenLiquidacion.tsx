import type { DetalleLiquidacion } from "@/servicios/liquidaciones/calcularLiquidacionEmpleado";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearMinutos } from "@/lib/utilidades/formatearMinutos";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

// Detalle congelado de una liquidación. Renderiza según la modalidad.
export function ResumenLiquidacion({
  detalle,
  moneda,
  locale,
}: {
  detalle: DetalleLiquidacion | null;
  moneda: string;
  locale: string;
}) {
  if (!detalle) {
    return (
      <PanelSeccion titulo="Detalle">
        <p className="text-sm text-zinc-500">Sin detalle disponible.</p>
      </PanelSeccion>
    );
  }

  if (detalle.tipo === "POR_HORA") {
    return (
      <div className="space-y-6">
        <PanelSeccion
          titulo="Asistencia"
          descripcion="Jornadas incluidas en la liquidación."
        >
          <TablaDatos
            columnas={[
              { encabezado: "Fecha" },
              { encabezado: "Entrada" },
              { encabezado: "Salida" },
              { encabezado: "Retraso" },
              { encabezado: "Trabajadas" },
              { encabezado: "Estado" },
              { encabezado: "Pago", alineacion: "der" },
            ]}
            filas={detalle.lineas.map((linea) => ({
              id: linea.asistenciaId,
              celdas: [
                <span key="fecha" className="whitespace-nowrap text-sm text-zinc-700">
                  {formatearFechaCalendario(linea.fecha, locale)}
                </span>,
                <span key="entrada" className="text-sm text-zinc-700">
                  {linea.horaEntrada ?? "—"}
                </span>,
                <span key="salida" className="text-sm text-zinc-700">
                  {linea.horaSalida ?? "—"}
                </span>,
                <span key="retraso" className="text-sm text-zinc-700">
                  {linea.minutosRetraso
                    ? formatearMinutos(linea.minutosRetraso)
                    : "—"}
                </span>,
                <span key="trabajadas" className="text-sm text-zinc-700">
                  {linea.minutosTrabajados
                    ? formatearMinutos(linea.minutosTrabajados)
                    : "—"}
                </span>,
                <span key="estado" className="text-sm">
                  {linea.incompleta ? (
                    <Etiqueta tono="alerta">Incompleta</Etiqueta>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </span>,
                <span key="pago" className="font-medium text-zinc-900">
                  {formatearMoneda(linea.pago, moneda, locale)}
                </span>,
              ],
            }))}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Dato etiqueta="Jornadas" valor={String(detalle.jornadas)} />
            <Dato
              etiqueta="Incompletas"
              valor={String(detalle.incompletas)}
            />
            <Dato
              etiqueta="Horas esperadas"
              valor={formatearMinutos(detalle.minutosEsperados)}
            />
            <Dato
              etiqueta="Horas trabajadas"
              valor={formatearMinutos(detalle.minutosTrabajados)}
            />
            <Dato
              etiqueta="Descuentos"
              valor={formatearMoneda(detalle.descuento, moneda, locale)}
            />
          </div>
        </PanelSeccion>
      </div>
    );
  }

  return (
    <PanelSeccion
      titulo="Producción"
      descripcion="Unidades y tarifas históricas incluidas."
    >
      <TablaDatos
        columnas={[
          { encabezado: "Producto" },
          { encabezado: "Cantidad", alineacion: "der" },
          { encabezado: "Precio/unidad", alineacion: "der" },
          { encabezado: "Total", alineacion: "der" },
        ]}
        filas={detalle.lineas.map((linea) => ({
          id: `${linea.productoId}-${linea.precioUnidad}`,
          celdas: [
            <span key="producto" className="text-sm text-zinc-800">
              {linea.productoNombre}
            </span>,
            <span key="cantidad" className="font-medium text-zinc-900">
              {linea.cantidad}
            </span>,
            <span key="precio" className="text-zinc-700">
              {formatearMoneda(linea.precioUnidad, moneda, locale)}
            </span>,
            <span key="total" className="font-medium text-zinc-900">
              {formatearMoneda(linea.total, moneda, locale)}
            </span>,
          ],
        }))}
      />
    </PanelSeccion>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50/60 px-3 py-2">
      <p className="text-xs text-zinc-500">{etiqueta}</p>
      <p className="text-lg font-semibold text-zinc-900">{valor}</p>
    </div>
  );
}
