"use client";

import { useState } from "react";
import { Lock, Pencil } from "lucide-react";
import type { AsistenciaListado } from "@/servicios/asistencias/listarAsistencias";
import {
  ETIQUETAS_ESTADO_JORNADA,
  ETIQUETAS_ORIGEN_ASISTENCIA,
  TONOS_ESTADO_JORNADA,
} from "@/constantes/estadosAsistencia";
import { calcularEstadoJornada } from "@/servicios/asistencias/calcularEstadoJornada";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { formatearMinutos } from "@/lib/utilidades/formatearMinutos";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Modal } from "@/componentes/ui/Modal";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { FormularioEditarAsistencia } from "@/componentes/empleados/FormularioEditarAsistencia";

function tramo(entrada: string | null, salida: string | null): string {
  if (!entrada && !salida) return "—";
  return `${entrada ?? "—"} → ${salida ?? "—"}`;
}

export function TablaAsistencias({
  asistencias,
  locale,
  esperaSegundoTramo,
}: {
  asistencias: AsistenciaListado[];
  locale: string;
  esperaSegundoTramo: boolean;
}) {
  const [editar, setEditar] = useState<AsistenciaListado | null>(null);

  if (asistencias.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin jornadas registradas"
        descripcion="Registrá la primera asistencia para poder liquidar el período."
      />
    );
  }

  return (
    <div className="space-y-4">
      <TablaDatos
        columnas={[
          { encabezado: "Fecha" },
          { encabezado: "Tramo 1" },
          { encabezado: "Tramo 2" },
          { encabezado: "Retraso" },
          { encabezado: "Trabajadas" },
          { encabezado: "Estado" },
          { encabezado: "Origen" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={asistencias.map((asistencia) => {
          const estadoJornada = calcularEstadoJornada({
            estado: asistencia.estado,
            tramos: {
              horaEntrada: asistencia.horaEntrada,
              horaSalida: asistencia.horaSalida,
              horaEntradaTramo2: asistencia.horaEntradaTramo2,
              horaSalidaTramo2: asistencia.horaSalidaTramo2,
            },
            esperaSegundoTramo,
          });

          return {
            id: asistencia.id,
            celdas: [
              <span
                key="fecha"
                className="whitespace-nowrap text-sm text-zinc-700"
              >
                {formatearFechaCalendario(asistencia.fecha, locale)}
              </span>,
              <span key="tramo1" className="whitespace-nowrap text-sm text-zinc-700">
                {tramo(asistencia.horaEntrada, asistencia.horaSalida)}
              </span>,
              <span key="tramo2" className="whitespace-nowrap text-sm text-zinc-700">
                {tramo(asistencia.horaEntradaTramo2, asistencia.horaSalidaTramo2)}
              </span>,
              <span key="retraso" className="text-sm text-zinc-700">
                {asistencia.minutosRetraso
                  ? formatearMinutos(asistencia.minutosRetraso)
                  : "—"}
              </span>,
              <span key="trabajadas" className="text-sm text-zinc-700">
                {asistencia.minutosTrabajados
                  ? formatearMinutos(asistencia.minutosTrabajados)
                  : "—"}
              </span>,
              <div key="estado" className="flex items-center gap-2">
                <Etiqueta tono={TONOS_ESTADO_JORNADA[estadoJornada]}>
                  {ETIQUETAS_ESTADO_JORNADA[estadoJornada]}
                </Etiqueta>
                {asistencia.liquidacionId ? (
                  <Lock
                    className="h-3.5 w-3.5 text-zinc-400"
                    strokeWidth={2}
                    aria-label="Incluida en una liquidación"
                  />
                ) : null}
              </div>,
              <span key="origen" className="text-sm text-zinc-500">
                {ETIQUETAS_ORIGEN_ASISTENCIA[asistencia.origen]}
              </span>,
              <div key="acciones" className="flex justify-end">
                <MenuAcciones
                  items={[
                    {
                      etiqueta: "Corregir",
                      icono: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
                      accion: () => setEditar(asistencia),
                    },
                  ]}
                />
              </div>,
            ],
          };
        })}
      />

      <Modal
        abierto={editar !== null}
        alCerrar={() => setEditar(null)}
        titulo="Corregir asistencia"
      >
        {editar ? (
          <FormularioEditarAsistencia
            asistencia={editar}
            locale={locale}
            alCerrar={() => setEditar(null)}
            alExito={() => setEditar(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
