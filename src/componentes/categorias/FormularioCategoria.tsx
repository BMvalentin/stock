"use client";

import { useActionState, useEffect } from "react";
import { accionCrearCategoria } from "@/acciones/categorias/accionCrearCategoria";
import { accionActualizarCategoria } from "@/acciones/categorias/accionActualizarCategoria";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function FormularioCategoria({
  categoria,
  alCerrar,
  alExito,
}: {
  categoria?: { id: string; nombre: string; descripcion: string | null };
  alCerrar: () => void;
  alExito: () => void;
}) {
  const accion = categoria
    ? accionActualizarCategoria.bind(null, categoria.id)
    : accionCrearCategoria;
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

      <CampoTexto
        etiqueta="Nombre"
        name="nombre"
        defaultValue={categoria?.nombre ?? ""}
        requerido
        error={estado.errores?.nombre?.[0]}
      />

      <CampoTextarea
        etiqueta="Descripción"
        name="descripcion"
        rows={3}
        defaultValue={categoria?.descripcion ?? ""}
        error={estado.errores?.descripcion?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          {categoria ? "Guardar cambios" : "Crear categoría"}
        </Boton>
      </div>
    </form>
  );
}
