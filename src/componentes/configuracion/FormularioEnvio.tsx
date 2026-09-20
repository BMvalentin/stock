"use client";

import { useActionState, useState } from "react";
import { accionActualizarConfiguracionEnvio } from "@/acciones/configuracion/accionActualizarConfiguracionEnvio";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { TipoCalculoEnvio } from "@/generated/prisma/enums";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

const TIPOS: { valor: TipoCalculoEnvio; etiqueta: string }[] = [
  { valor: "SIN_CARGO", etiqueta: "Sin cargo" },
  { valor: "TARIFA_FIJA", etiqueta: "Tarifa fija" },
  { valor: "POR_PRODUCTO", etiqueta: "Por producto (unidades)" },
  { valor: "POR_BULTO", etiqueta: "Por bulto" },
];

export function FormularioEnvio({
  configuracion,
}: {
  configuracion: { tipo: TipoCalculoEnvio; precio: number };
}) {
  const [tipo, setTipo] = useState<TipoCalculoEnvio>(configuracion.tipo);
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarConfiguracionEnvio,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <form action={enviar} className="space-y-4">
      {estado.exito ? (
        <Alerta tono="exito">{estado.mensaje ?? "Cambios guardados."}</Alerta>
      ) : null}
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Estrategia de cálculo"
          name="tipo"
          opciones={TIPOS}
          defaultValue={configuracion.tipo}
          onChange={(evento) =>
            setTipo(evento.target.value as TipoCalculoEnvio)
          }
          requerido
          error={estado.errores?.tipo?.[0]}
        />

        {tipo === "SIN_CARGO" ? (
          <input type="hidden" name="precio" value="0" />
        ) : (
          <CampoTexto
            etiqueta="Precio del envío"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            defaultValue={configuracion.precio}
            error={estado.errores?.precio?.[0]}
          />
        )}
      </div>

      <div className="flex justify-end">
        <Boton type="submit" cargando={pendiente}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
