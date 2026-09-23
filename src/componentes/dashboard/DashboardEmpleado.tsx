import Link from "next/link";
import { Package, QrCode, ShoppingCart } from "lucide-react";
import type { ResumenEmpleado } from "@/servicios/dashboard/obtenerResumenEmpleado";
import { calcularPuntualidadEntrada } from "@/servicios/asistencias/calcularPuntualidadEntrada";
import { formatearMinutos } from "@/lib/utilidades/formatearMinutos";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta, type TonoEtiqueta } from "@/componentes/ui/Etiqueta";

function diaMes(fecha: Date): string {
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function describirPuntualidad(datos: {
  estado: "SIN_FICHAJE" | "A_HORARIO" | "TARDE" | "ANTICIPADO";
  diferenciaMinutos: number;
}): { texto: string; tono: TonoEtiqueta } {
  switch (datos.estado) {
    case "TARDE":
      return {
        texto:
          datos.diferenciaMinutos === 1
            ? "Llegada: 1 minuto tarde"
            : `Llegada: ${datos.diferenciaMinutos} minutos tarde`,
        tono: "alerta",
      };
    case "ANTICIPADO":
      return {
        texto: `Entrada anticipada (${Math.abs(
          datos.diferenciaMinutos,
        )} min antes)`,
        tono: "info",
      };
    case "A_HORARIO":
      return { texto: "A horario", tono: "exito" };
    default:
      return { texto: "Sin fichaje", tono: "neutral" };
  }
}

const ACCESOS = [
  { etiqueta: "Productos", ruta: "/empleado/productos", icono: Package },
  { etiqueta: "Pedidos", ruta: "/empleado/pedidos", icono: ShoppingCart },
  { etiqueta: "Fichaje", ruta: "/empleado/fichaje", icono: QrCode },
];

export function DashboardEmpleado({
  resumen,
  fechaHoy,
}: {
  resumen: ResumenEmpleado;
  fechaHoy: string;
}) {
  const puntualidad = calcularPuntualidadEntrada({
    horaEsperada: resumen.horario?.horaEntradaEsperada ?? "00:00",
    horaFichaje: resumen.fichajeHoy?.horaEntrada ?? null,
  });
  const estadoPuntualidad = describirPuntualidad(puntualidad);

  const hayTramo2 =
    Boolean(resumen.horario?.horaEntradaTramo2Esperada) &&
    Boolean(resumen.horario?.horaSalidaTramo2Esperada);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Hola, ${resumen.nombre ?? resumen.email}`}
        descripcion={`Hoy · ${fechaHoy}`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Fichaje de hoy
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Fichaje
                </p>
                <p className="text-2xl font-semibold text-zinc-900">
                  {resumen.fichajeHoy?.horaEntrada ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Horario esperado
                </p>
                <p className="text-lg font-medium text-zinc-700">
                  {resumen.horario?.horaEntradaEsperada ?? "—"}
                </p>
              </div>
            </div>
            <Etiqueta tono={estadoPuntualidad.tono}>
              {estadoPuntualidad.texto}
            </Etiqueta>
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Mi jornada</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Entrada</dt>
              <dd className="font-medium text-zinc-900">
                {resumen.fichajeHoy?.horaEntrada ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Salida</dt>
              <dd className="font-medium text-zinc-900">
                {resumen.fichajeHoy?.horaSalida ?? "Pendiente"}
              </dd>
            </div>
            {hayTramo2 ? (
              <>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Entrada 2</dt>
                  <dd className="font-medium text-zinc-900">
                    {resumen.fichajeHoy?.horaEntradaTramo2 ?? "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Salida 2</dt>
                  <dd className="font-medium text-zinc-900">
                    {resumen.fichajeHoy?.horaSalidaTramo2 ?? "Pendiente"}
                  </dd>
                </div>
              </>
            ) : null}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
              <dt className="text-zinc-500">Horas trabajadas</dt>
              <dd className="font-semibold text-zinc-900">
                {resumen.fichajeHoy?.minutosTrabajados === null ||
                resumen.fichajeHoy?.minutosTrabajados === undefined
                  ? "—"
                  : formatearMinutos(resumen.fichajeHoy.minutosTrabajados)}
              </dd>
            </div>
          </dl>
        </Tarjeta>
      </div>

      <Tarjeta className="p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Mis accesos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ACCESOS.map((acceso) => {
            const Icono = acceso.icono;
            return (
              <Link
                key={acceso.ruta}
                href={acceso.ruta}
                className="flex items-center gap-3 rounded-md border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                <Icono className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                {acceso.etiqueta}
              </Link>
            );
          })}
        </div>
      </Tarjeta>

      <Tarjeta className="p-5">
        <h2 className="text-sm font-semibold text-zinc-900">
          Mis últimos fichajes
        </h2>
        {resumen.ultimosFichajes.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            Todavía no tenés fichajes registrados.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100">
            {resumen.ultimosFichajes.map((fichaje) => (
              <li
                key={fichaje.fecha.toISOString()}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="text-zinc-500">{diaMes(fichaje.fecha)}</span>
                <span className="text-zinc-700">
                  Entrada {fichaje.horaEntrada ?? "—"}
                </span>
                <span className="text-zinc-700">
                  Salida {fichaje.horaSalida ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
