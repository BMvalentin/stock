"use client";

import { useActionState, useEffect } from "react";
import { accionCrearMetodoPago } from "@/acciones/configuracion/accionCrearMetodoPago";
import { accionActualizarMetodoPago } from "@/acciones/configuracion/accionActualizarMetodoPago";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export type MetodoPagoFormulario = {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
};

export function FormularioMetodoPago({
  metodo,
  alCerrar,
  alExito,
}: {
  metodo?: MetodoPagoFormulario;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const accion = metodo
    ? accionActualizarMetodoPago.bind(null, metodo.id)
    : accionCrearMetodoPago;
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Nombre"
          name="nombre"
          defaultValue={metodo?.nombre ?? ""}
          requerido
          error={estado.errores?.nombre?.[0]}
        />
        <CampoTexto
          etiqueta="Código"
          name="codigo"
          defaultValue={metodo?.codigo ?? ""}
          ayuda="Identificador interno, por ejemplo EFECTIVO."
          requerido
          error={estado.errores?.codigo?.[0]}
        />
      </div>

      <CampoTexto
        etiqueta="Orden"
        name="orden"
        type="number"
        min="0"
        step="1"
        defaultValue={metodo?.orden ?? 0}
        ayuda="Menor número aparece primero."
        error={estado.errores?.orden?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          {metodo ? "Guardar cambios" : "Crear método"}
        </Boton>
      </div>
    </form>
  );
}
