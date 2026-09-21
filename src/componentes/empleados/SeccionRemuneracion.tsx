"use client";

import { useActionState, useRef, useState } from "react";
import { accionActualizarRemuneracion } from "@/acciones/empleados/accionActualizarRemuneracion";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import {
  ETIQUETAS_TIPO_REMUNERACION,
  TIPOS_REMUNERACION,
} from "@/constantes/tiposRemuneracion";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import type { TipoRemuneracion } from "@/generated/prisma/enums";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";

export function SeccionRemuneracion({
  empleadoId,
  tipoInicial,
  horasInicial,
  pagoInicial,
  entradaInicial,
  salidaInicial,
  entradaTramo2Inicial,
  salidaTramo2Inicial,
  moneda,
  locale,
}: {
  empleadoId: string;
  tipoInicial: TipoRemuneracion;
  horasInicial: string;
  pagoInicial: string;
  entradaInicial: string;
  salidaInicial: string;
  entradaTramo2Inicial?: string;
  salidaTramo2Inicial?: string;
  moneda: string;
  locale: string;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarRemuneracion,
    ESTADO_FORMULARIO_INICIAL,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const omitirConfirmacion = useRef(false);
  const [confirmar, setConfirmar] = useState(false);
  const [tipo, setTipo] = useState<TipoRemuneracion>(tipoInicial);
  const [horas, setHoras] = useState(horasInicial);
  const [pago, setPago] = useState(pagoInicial);

  const cambioModalidad = tipo !== tipoInicial;
  const horasNumero = Number(horas);
  const pagoNumero = Number(pago);
  const valorHora =
    horasNumero > 0 && pagoNumero > 0 ? pagoNumero / horasNumero : 0;

  function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    if (!omitirConfirmacion.current && cambioModalidad) {
      evento.preventDefault();
      setConfirmar(true);
      return;
    }

    omitirConfirmacion.current = false;
  }

  function confirmarCambio() {
    omitirConfirmacion.current = true;
    setConfirmar(false);
    formRef.current?.requestSubmit();
  }

  return (
    <PanelSeccion
      titulo="Remuneración"
      descripcion="Definí cómo se le paga a este empleado."
    >
      <form
        ref={formRef}
        action={enviar}
        onSubmit={manejarEnvio}
        className="space-y-4"
      >
        {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
        {estado.exito ? <Alerta tono="exito">{estado.mensaje}</Alerta> : null}

        <input type="hidden" name="empleadoId" value={empleadoId} />

        <CampoSelect
          etiqueta="Tipo de remuneración"
          name="tipoRemuneracion"
          value={tipo}
          onChange={(evento) =>
            setTipo(evento.target.value as TipoRemuneracion)
          }
          opciones={TIPOS_REMUNERACION.map((valor) => ({
            valor,
            etiqueta: ETIQUETAS_TIPO_REMUNERACION[valor],
          }))}
          requerido
          error={estado.errores?.tipoRemuneracion?.[0]}
        />

        {tipo === "POR_HORA" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                etiqueta="Hora de entrada esperada"
                name="horaEntradaEsperada"
                type="time"
                defaultValue={entradaInicial}
                requerido
                error={estado.errores?.horaEntradaEsperada?.[0]}
              />
              <CampoTexto
                etiqueta="Hora de salida esperada"
                name="horaSalidaEsperada"
                type="time"
                defaultValue={salidaInicial}
                requerido
                error={estado.errores?.horaSalidaEsperada?.[0]}
              />
              <CampoTexto
                etiqueta="Horas de jornada completa"
                name="horasJornada"
                type="number"
                step="0.25"
                min="0.25"
                value={horas}
                onChange={(evento) => setHoras(evento.target.value)}
                requerido
                error={estado.errores?.horasJornada?.[0]}
              />
              <CampoTexto
                etiqueta="Pago por jornada completa"
                name="pagoJornada"
                type="number"
                step="0.01"
                min="0"
                value={pago}
                onChange={(evento) => setPago(evento.target.value)}
                requerido
                error={estado.errores?.pagoJornada?.[0]}
              />
            </div>

            <fieldset className="rounded-md border border-zinc-200 p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tramo 2 (opcional)
              </legend>
              <p className="mb-3 text-sm text-zinc-500">
                Dejá vacío para jornada continua. Completá entrada y salida para
                jornada partida.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                  etiqueta="Entrada tramo 2"
                  name="horaEntradaTramo2Esperada"
                  type="time"
                  defaultValue={entradaTramo2Inicial}
                  error={estado.errores?.horaEntradaTramo2Esperada?.[0]}
                />
                <CampoTexto
                  etiqueta="Salida tramo 2"
                  name="horaSalidaTramo2Esperada"
                  type="time"
                  defaultValue={salidaTramo2Inicial}
                  error={estado.errores?.horaSalidaTramo2Esperada?.[0]}
                />
              </div>
            </fieldset>

            <p className="text-sm text-zinc-600">
              Valor hora calculado:{" "}
              <span className="font-medium text-zinc-900">
                {formatearMoneda(valorHora, moneda, locale)}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="hidden" name="horasJornada" value={horasInicial} />
            <input type="hidden" name="pagoJornada" value={pagoInicial} />
            <input
              type="hidden"
              name="horaEntradaEsperada"
              value={entradaInicial}
            />
            <input
              type="hidden"
              name="horaSalidaEsperada"
              value={salidaInicial}
            />
            <input
              type="hidden"
              name="horaEntradaTramo2Esperada"
              value={entradaTramo2Inicial ?? ""}
            />
            <input
              type="hidden"
              name="horaSalidaTramo2Esperada"
              value={salidaTramo2Inicial ?? ""}
            />
            <Alerta tono="info">
              Este empleado se paga por producción. Configurá las tarifas por
              producto en la sección «Tarifas de producción».
            </Alerta>
          </div>
        )}

        <div className="flex justify-end">
          <Boton type="submit" cargando={pendiente}>
            Guardar remuneración
          </Boton>
        </div>
      </form>

      <DialogoConfirmacion
        abierto={confirmar}
        alCerrar={() => setConfirmar(false)}
        alConfirmar={confirmarCambio}
        titulo="¿Cambiar modalidad de remuneración?"
        descripcion="Los registros históricos no serán modificados. Las asistencias, producciones y liquidaciones anteriores conservan su modalidad y sus importes."
        textoConfirmar="Cambiar modalidad"
        peligro={false}
      />
    </PanelSeccion>
  );
}
