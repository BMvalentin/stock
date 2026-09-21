"use client";

import { useState, useTransition } from "react";
import { Camera, CheckCircle2, RefreshCw } from "lucide-react";
import { accionRegistrarFichajeQR } from "@/acciones/asistencias/accionRegistrarFichajeQR";
import {
  ESTADO_FICHAJE_QR_INICIAL,
  type EstadoFichajeQR,
} from "@/tipos/fichaje";
import { ETIQUETAS_ACCION_FICHAJE } from "@/constantes/fichaje";
import { ETIQUETAS_ESTADO_JORNADA } from "@/constantes/estadosAsistencia";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { formatearMinutos } from "@/lib/utilidades/formatearMinutos";
import { EscanerQR } from "@/componentes/codigosBarras/EscanerQR";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";

export function PanelFichajeQR({ locale }: { locale: string }) {
  const [escanerAbierto, setEscanerAbierto] = useState(false);
  const [estado, setEstado] = useState<EstadoFichajeQR>(
    ESTADO_FICHAJE_QR_INICIAL,
  );
  const [pendiente, iniciar] = useTransition();

  function alDetectar(contenido: string) {
    setEscanerAbierto(false);
    setEstado(ESTADO_FICHAJE_QR_INICIAL);

    const datos = new FormData();
    datos.set("contenido", contenido);

    iniciar(async () => {
      const resultado = await accionRegistrarFichajeQR(
        ESTADO_FICHAJE_QR_INICIAL,
        datos,
      );
      setEstado(resultado);
    });
  }

  const resultado = estado.resultado;
  const jornadaCompleta = resultado?.estadoJornada === "COMPLETA";

  return (
    <PanelSeccion
      titulo="Registrar asistencia"
      descripcion="Escaneá el código QR del comercio con la cámara de tu teléfono."
    >
      <div className="space-y-4">
        {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

        {pendiente ? (
          <Alerta tono="info">Procesando fichaje…</Alerta>
        ) : null}

        {resultado && !estado.error ? (
          <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
              <p className="font-medium">
                {resultado.duplicado
                  ? "Tu fichaje ya estaba registrado."
                  : resultado.accion
                    ? ETIQUETAS_ACCION_FICHAJE[resultado.accion]
                    : "Fichaje registrado"}
              </p>
            </div>

            <p className="text-sm text-emerald-900">
              {formatearFechaCalendario(
                new Date(`${resultado.fecha}T00:00:00.000Z`),
                locale,
              )}
              {resultado.hora ? ` · ${resultado.hora}` : ""}
            </p>

            <dl className="grid grid-cols-2 gap-2 text-sm text-emerald-900">
              <div>
                <dt className="text-emerald-700">Tramo 1</dt>
                <dd>
                  {resultado.resumen.horaEntrada ?? "—"} →{" "}
                  {resultado.resumen.horaSalida ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-emerald-700">Tramo 2</dt>
                <dd>
                  {resultado.resumen.horaEntradaTramo2 ?? "—"} →{" "}
                  {resultado.resumen.horaSalidaTramo2 ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-emerald-700">Horas trabajadas</dt>
                <dd>{formatearMinutos(resultado.resumen.minutosTrabajados)}</dd>
              </div>
              <div>
                <dt className="text-emerald-700">Retraso</dt>
                <dd>
                  {resultado.resumen.minutosRetraso
                    ? formatearMinutos(resultado.resumen.minutosRetraso)
                    : "Sin retraso"}
                </dd>
              </div>
            </dl>

            <p className="text-sm font-medium text-emerald-800">
              Estado del día:{" "}
              {ETIQUETAS_ESTADO_JORNADA[resultado.estadoJornada]}
            </p>
          </div>
        ) : null}

        {jornadaCompleta && !estado.error ? (
          <Alerta tono="info">
            Tu jornada de hoy ya está completa. Si necesitás corregir algo,
            avisá a un administrador.
          </Alerta>
        ) : null}

        <div className="flex justify-center">
          <Boton onClick={() => setEscanerAbierto(true)} cargando={pendiente}>
            {resultado ? (
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Camera className="h-4 w-4" strokeWidth={1.75} />
            )}
            {resultado ? "Escanear otra vez" : "Abrir cámara"}
          </Boton>
        </div>
      </div>

      <EscanerQR
        abierto={escanerAbierto}
        alCerrar={() => setEscanerAbierto(false)}
        alDetectar={alDetectar}
      />
    </PanelSeccion>
  );
}
