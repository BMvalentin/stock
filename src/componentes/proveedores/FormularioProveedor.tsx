"use client";

import { useActionState, useEffect } from "react";
import { accionCrearProveedor } from "@/acciones/proveedores/accionCrearProveedor";
import { accionActualizarProveedor } from "@/acciones/proveedores/accionActualizarProveedor";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export type ProveedorFormulario = {
  id: string;
  nombre: string;
  empresa: string | null;
  cuit: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
};

export function FormularioProveedor({
  proveedor,
  alCerrar,
  alExito,
}: {
  proveedor?: ProveedorFormulario;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const accion = proveedor
    ? accionActualizarProveedor.bind(null, proveedor.id)
    : accionCrearProveedor;
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
          defaultValue={proveedor?.nombre ?? ""}
          requerido
          error={estado.errores?.nombre?.[0]}
        />
        <CampoTexto
          etiqueta="Empresa"
          name="empresa"
          defaultValue={proveedor?.empresa ?? ""}
          error={estado.errores?.empresa?.[0]}
        />
        <CampoTexto
          etiqueta="CUIT/CUIL"
          name="cuit"
          inputMode="numeric"
          defaultValue={proveedor?.cuit ?? ""}
          ayuda="11 dígitos."
          error={estado.errores?.cuit?.[0]}
        />
        <CampoTexto
          etiqueta="Teléfono"
          name="telefono"
          type="tel"
          defaultValue={proveedor?.telefono ?? ""}
          error={estado.errores?.telefono?.[0]}
        />
        <CampoTexto
          etiqueta="WhatsApp"
          name="whatsapp"
          type="tel"
          defaultValue={proveedor?.whatsapp ?? ""}
          ayuda="Con código de país, por ejemplo +54911..."
          error={estado.errores?.whatsapp?.[0]}
        />
        <CampoTexto
          etiqueta="Correo electrónico"
          name="email"
          type="email"
          defaultValue={proveedor?.email ?? ""}
          error={estado.errores?.email?.[0]}
        />
        <CampoTexto
          etiqueta="Dirección"
          name="direccion"
          defaultValue={proveedor?.direccion ?? ""}
          error={estado.errores?.direccion?.[0]}
        />
      </div>

      <CampoTextarea
        etiqueta="Notas"
        name="notas"
        rows={3}
        defaultValue={proveedor?.notas ?? ""}
        error={estado.errores?.notas?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          {proveedor ? "Guardar cambios" : "Crear proveedor"}
        </Boton>
      </div>
    </form>
  );
}
