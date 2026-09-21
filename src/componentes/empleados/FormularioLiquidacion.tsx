"use client";

import { useActionState } from "react";
import { accionCalcularLiquidacion } from "@/acciones/liquidaciones/accionCalcularLiquidacion";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";

export function FormularioLiquidacion({
  empleadoId,
  desdeDefault,
  hastaDefault,
}: {
  empleadoId: string;
  desdeDefault: string;
  hastaDefault: string;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionCalcularLiquidacion,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <PanelSeccion
      titulo="Calcular liquidación"
      descripcion="Elegí el período. Se congelan los valores al calcular."
    >
      <form action={enviar} className="space-y-4">
        {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
        {estado.exito ? <Alerta tono="exito">{estado.mensaje}</Alerta> : null}

        <input type="hidden" name="empleadoId" value={empleadoId} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CampoTexto
            etiqueta="Desde"
            name="desde"
            type="date"
            defaultValue={desdeDefault}
            requerido
            error={estado.errores?.desde?.[0]}
          />
          <CampoTexto
            etiqueta="Hasta"
            name="hasta"
            type="date"
            defaultValue={hastaDefault}
            requerido
            error={estado.errores?.hasta?.[0]}
          />
          <div className="flex items-end">
            <Boton type="submit" cargando={pendiente}>
              Calcular liquidación
            </Boton>
          </div>
        </div>
      </form>
    </PanelSeccion>
  );
}
