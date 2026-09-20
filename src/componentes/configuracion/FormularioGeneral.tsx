"use client";

import { useActionState } from "react";
import { accionActualizarConfiguracionGeneral } from "@/acciones/configuracion/accionActualizarConfiguracionGeneral";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function FormularioGeneral({
  configuracion,
}: {
  configuracion: { nombreComercio: string; moneda: string; locale: string };
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarConfiguracionGeneral,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <form action={enviar} className="space-y-4">
      {estado.exito ? (
        <Alerta tono="exito">{estado.mensaje ?? "Cambios guardados."}</Alerta>
      ) : null}
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <CampoTexto
          etiqueta="Nombre del comercio"
          name="nombreComercio"
          defaultValue={configuracion.nombreComercio}
          requerido
          error={estado.errores?.nombreComercio?.[0]}
        />
        <CampoTexto
          etiqueta="Moneda"
          name="moneda"
          defaultValue={configuracion.moneda}
          ayuda="Código ISO, por ejemplo ARS."
          requerido
          error={estado.errores?.moneda?.[0]}
        />
        <CampoTexto
          etiqueta="Locale"
          name="locale"
          defaultValue={configuracion.locale}
          ayuda="Formato regional, por ejemplo es-AR."
          requerido
          error={estado.errores?.locale?.[0]}
        />
      </div>

      <div className="flex justify-end">
        <Boton type="submit" cargando={pendiente}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
