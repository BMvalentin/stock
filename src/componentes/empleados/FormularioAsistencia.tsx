"use client";

import { useActionState } from "react";
import { accionRegistrarAsistencia } from "@/acciones/asistencias/accionRegistrarAsistencia";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { ESTADOS_ASISTENCIA } from "@/constantes/estadosAsistencia";
import { ETIQUETAS_ESTADO_ASISTENCIA } from "@/constantes/estadosAsistencia";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { CamposTramoAsistencia } from "@/componentes/empleados/CamposTramoAsistencia";

export function FormularioAsistencia({
  empleadoId,
  fechaHoy,
  entradaEsperada,
  salidaEsperada,
  entradaTramo2Esperada,
  salidaTramo2Esperada,
}: {
  empleadoId: string;
  fechaHoy: string;
  entradaEsperada: string;
  salidaEsperada: string;
  entradaTramo2Esperada?: string;
  salidaTramo2Esperada?: string;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionRegistrarAsistencia,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <PanelSeccion
      titulo="Registrar jornada"
      descripcion="Cargá los tramos reales. El retraso y las horas trabajadas se calculan automáticamente. El tramo 2 es opcional."
    >
      <form action={enviar} className="space-y-4">
        {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
        {estado.exito ? <Alerta tono="exito">{estado.mensaje}</Alerta> : null}

        <input type="hidden" name="empleadoId" value={empleadoId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta="Fecha"
            name="fecha"
            type="date"
            defaultValue={fechaHoy}
            requerido
            error={estado.errores?.fecha?.[0]}
          />
          <CampoSelect
            etiqueta="Estado"
            name="estado"
            opciones={ESTADOS_ASISTENCIA.map((valor) => ({
              valor,
              etiqueta: ETIQUETAS_ESTADO_ASISTENCIA[valor],
            }))}
            defaultValue="PRESENTE"
            requerido
            error={estado.errores?.estado?.[0]}
          />
        </div>

        <CamposTramoAsistencia
          titulo="Tramo 1"
          nameEntrada="horaEntrada"
          nameSalida="horaSalida"
          entradaInicial={entradaEsperada}
          salidaInicial={salidaEsperada}
          errorEntrada={estado.errores?.horaEntrada?.[0]}
          errorSalida={estado.errores?.horaSalida?.[0]}
        />

        <CamposTramoAsistencia
          titulo="Tramo 2 (opcional)"
          nameEntrada="horaEntradaTramo2"
          nameSalida="horaSalidaTramo2"
          entradaInicial={entradaTramo2Esperada}
          salidaInicial={salidaTramo2Esperada}
          errorEntrada={estado.errores?.horaEntradaTramo2?.[0]}
          errorSalida={estado.errores?.horaSalidaTramo2?.[0]}
        />

        <CampoTextarea
          etiqueta="Observación"
          name="observacion"
          rows={2}
          error={estado.errores?.observacion?.[0]}
        />

        <div className="flex justify-end">
          <Boton type="submit" cargando={pendiente}>
            Registrar asistencia
          </Boton>
        </div>
      </form>
    </PanelSeccion>
  );
}
