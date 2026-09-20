"use client";

import { useActionState, useEffect } from "react";
import { accionCrearEmpleado } from "@/acciones/empleados/accionCrearEmpleado";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { ROLES, ETIQUETAS_ROL } from "@/constantes/roles";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function FormularioEmpleado({
  alCerrar,
  alExito,
}: {
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionCrearEmpleado,
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
        requerido
        error={estado.errores?.nombre?.[0]}
      />
      <CampoTexto
        etiqueta="Correo electrónico"
        name="email"
        type="email"
        requerido
        error={estado.errores?.email?.[0]}
      />
      <CampoTexto
        etiqueta="Contraseña"
        name="contrasena"
        type="password"
        requerido
        ayuda="Mínimo 8 caracteres."
        error={estado.errores?.contrasena?.[0]}
      />
      <CampoSelect
        etiqueta="Rol"
        name="rol"
        opciones={ROLES.map((rol) => ({
          valor: rol,
          etiqueta: ETIQUETAS_ROL[rol],
        }))}
        defaultValue="EMPLEADO"
        requerido
        error={estado.errores?.rol?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          Crear empleado
        </Boton>
      </div>
    </form>
  );
}
