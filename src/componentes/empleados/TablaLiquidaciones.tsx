"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import type { LiquidacionListado } from "@/servicios/liquidaciones/listarLiquidaciones";
import { accionMarcarLiquidacionPagada } from "@/acciones/liquidaciones/accionMarcarLiquidacionPagada";
import { accionCancelarLiquidacion } from "@/acciones/liquidaciones/accionCancelarLiquidacion";
import {
  ETIQUETAS_ESTADO_LIQUIDACION,
  TONOS_ESTADO_LIQUIDACION,
} from "@/constantes/estadosLiquidacion";
import { ETIQUETAS_TIPO_REMUNERACION } from "@/constantes/tiposRemuneracion";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { Alerta } from "@/componentes/ui/Alerta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";

export function TablaLiquidaciones({
  liquidaciones,
  userId,
  moneda,
  locale,
}: {
  liquidaciones: LiquidacionListado[];
  userId: string;
  moneda: string;
  locale: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function marcarPagada(id: string) {
    iniciarTransicion(async () => {
      const resultado = await accionMarcarLiquidacionPagada(id);
      setError(resultado.error ?? null);
    });
  }

  function anular(id: string) {
    iniciarTransicion(async () => {
      const resultado = await accionCancelarLiquidacion(id);
      setError(resultado.error ?? null);
    });
  }

  if (liquidaciones.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin liquidaciones"
        descripcion="Calculá una liquidación para ver el historial del empleado."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <TablaDatos
        columnas={[
          { encabezado: "Período" },
          { encabezado: "Tipo" },
          { encabezado: "Total", alineacion: "der" },
          { encabezado: "Estado" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={liquidaciones.map((liquidacion) => ({
          id: liquidacion.id,
          celdas: [
            <span key="periodo" className="whitespace-nowrap text-sm text-zinc-700">
              {formatearFechaCalendario(liquidacion.desde, locale)} —{" "}
              {formatearFechaCalendario(liquidacion.hasta, locale)}
            </span>,
            <span key="tipo" className="text-sm text-zinc-700">
              {ETIQUETAS_TIPO_REMUNERACION[liquidacion.tipoRemuneracion]}
            </span>,
            <span key="total" className="font-medium text-zinc-900">
              {formatearMoneda(liquidacion.total.toString(), moneda, locale)}
            </span>,
            <Etiqueta
              key="estado"
              tono={TONOS_ESTADO_LIQUIDACION[liquidacion.estado]}
            >
              {ETIQUETAS_ESTADO_LIQUIDACION[liquidacion.estado]}
            </Etiqueta>,
            <div key="acciones" className="flex justify-end">
              <MenuAcciones
                items={[
                  {
                    etiqueta: "Ver detalle",
                    icono: <Eye className="h-4 w-4" strokeWidth={1.75} />,
                    href: `/empleados/${userId}/liquidacion/${liquidacion.id}`,
                  },
                  ...(liquidacion.estado === "CALCULADA"
                    ? [
                        {
                          etiqueta: "Marcar como pagada",
                          icono: (
                            <CheckCircle2
                              className="h-4 w-4"
                              strokeWidth={1.75}
                            />
                          ),
                          accion: () => marcarPagada(liquidacion.id),
                          confirmacion: {
                            titulo: "Marcar como pagada",
                            descripcion:
                              "Se registra que la liquidación ya fue abonada. No modifica los importes.",
                            textoConfirmar: "Marcar pagada",
                          },
                        },
                      ]
                    : []),
                  ...(liquidacion.estado === "CALCULADA" ||
                  liquidacion.estado === "ABIERTA"
                    ? [
                        {
                          etiqueta: "Anular",
                          icono: (
                            <XCircle className="h-4 w-4" strokeWidth={1.75} />
                          ),
                          peligro: true,
                          accion: () => anular(liquidacion.id),
                          confirmacion: {
                            titulo: "Anular liquidación",
                            descripcion:
                              "Se liberan las asistencias o producciones incluidas para poder liquidarlas de nuevo.",
                            textoConfirmar: "Anular",
                          },
                        },
                      ]
                    : []),
                ]}
              />
            </div>,
          ],
        }))}
      />
    </div>
  );
}
