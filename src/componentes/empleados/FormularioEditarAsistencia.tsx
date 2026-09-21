"use client";

import { useActionState, useEffect } from "react";
import { accionActualizarAsistencia } from "@/acciones/asistencias/accionActualizarAsistencia";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import {
  ESTADOS_ASISTENCIA,
  ETIQUETAS_ESTADO_ASISTENCIA,
} from "@/constantes/estadosAsistencia";
import type { AsistenciaListado } from "@/servicios/asistencias/listarAsistencias";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { CamposTramoAsistencia } from "@/componentes/empleados/CamposTramoAsistencia";

export function FormularioEditarAsistencia({
  asistencia,
  locale,
  alCerrar,
  alExito,
}: {
  asistencia: AsistenciaListado;
  locale: string;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarAsistencia,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <input type="hidden" name="asistenciaId" value={asistencia.id} />

      <p className="text-sm text-zinc-600">
        Fecha:{" "}
        <span className="font-medium text-zinc-900">
          {formatearFechaCalendario(asistencia.fecha, locale)}
        </span>
      </p>

      <CampoSelect
        etiqueta="Estado"
        name="estado"
        opciones={ESTADOS_ASISTENCIA.map((valor) => ({
          valor,
          etiqueta: ETIQUETAS_ESTADO_ASISTENCIA[valor],
        }))}
        defaultValue={asistencia.estado}
        requerido
        error={estado.errores?.estado?.[0]}
      />

      <CamposTramoAsistencia
        titulo="Tramo 1"
        nameEntrada="horaEntrada"
        nameSalida="horaSalida"
        entradaInicial={asistencia.horaEntrada ?? ""}
        salidaInicial={asistencia.horaSalida ?? ""}
        errorEntrada={estado.errores?.horaEntrada?.[0]}
        errorSalida={estado.errores?.horaSalida?.[0]}
      />

      <CamposTramoAsistencia
        titulo="Tramo 2 (opcional)"
        nameEntrada="horaEntradaTramo2"
        nameSalida="horaSalidaTramo2"
        entradaInicial={asistencia.horaEntradaTramo2 ?? ""}
        salidaInicial={asistencia.horaSalidaTramo2 ?? ""}
        errorEntrada={estado.errores?.horaEntradaTramo2?.[0]}
        errorSalida={estado.errores?.horaSalidaTramo2?.[0]}
      />

      <CampoTextarea
        etiqueta="Observación"
        name="observacion"
        rows={2}
        defaultValue={asistencia.observacion ?? ""}
        error={estado.errores?.observacion?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
