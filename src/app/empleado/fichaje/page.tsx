import { requerirEmpleado } from "@/lib/seguridad/requerirEmpleado";
import { obtenerResumenEmpleado } from "@/servicios/dashboard/obtenerResumenEmpleado";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Dato } from "@/componentes/ui/Dato";
import { PanelFichajeQR } from "@/componentes/empleados/PanelFichajeQR";

export const metadata = { title: "Fichaje QR" };

function diaMes(fecha: Date): string {
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

export default async function PaginaFichajeEmpleado() {
  const usuario = await requerirEmpleado();
  const [resumen, configuracion] = await Promise.all([
    obtenerResumenEmpleado(usuario.id),
    obtenerConfiguracionGeneral(),
  ]);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <EncabezadoPagina
        titulo="Fichaje QR"
        descripcion="Fichá tu entrada y salida escaneando el código QR del comercio."
      />

      {resumen?.horario ? (
        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Horario de hoy
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <Dato
              etiqueta="Entrada esperada"
              valor={resumen.horario.horaEntradaEsperada}
            />
            <Dato
              etiqueta="Salida esperada"
              valor={resumen.horario.horaSalidaEsperada}
            />
            {resumen.horario.horaEntradaTramo2Esperada &&
            resumen.horario.horaSalidaTramo2Esperada ? (
              <Dato
                etiqueta="Segundo tramo"
                valor={`${resumen.horario.horaEntradaTramo2Esperada} → ${resumen.horario.horaSalidaTramo2Esperada}`}
              />
            ) : null}
          </dl>
        </Tarjeta>
      ) : null}

      <PanelFichajeQR locale={configuracion.locale} />

      {resumen ? (
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
                  <span className="text-zinc-500">
                    {diaMes(fichaje.fecha)}
                  </span>
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
      ) : null}
    </div>
  );
}
