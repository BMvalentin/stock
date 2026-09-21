"use client";

import { useActionState } from "react";
import { accionRegistrarProduccion } from "@/acciones/producciones/accionRegistrarProduccion";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";

export function FormularioProduccion({
  empleadoId,
  fechaHoy,
  productos,
}: {
  empleadoId: string;
  fechaHoy: string;
  productos: OpcionCampo[];
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionRegistrarProduccion,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <PanelSeccion
      titulo="Registrar producción"
      descripcion="El precio por unidad se toma de la tarifa configurada; no se edita desde acá."
    >
      {productos.length === 0 ? (
        <Alerta tono="advertencia">
          Configurá al menos una tarifa de producción activa en la sección
          «Remuneración» antes de registrar producción.
        </Alerta>
      ) : (
        <form action={enviar} className="space-y-4">
          {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
          {estado.exito ? <Alerta tono="exito">{estado.mensaje}</Alerta> : null}

          <input type="hidden" name="empleadoId" value={empleadoId} />

          <div className="grid gap-4 sm:grid-cols-3">
            <CampoSelect
              etiqueta="Producto"
              name="productoId"
              opciones={productos}
              marcador="Seleccioná un producto"
              requerido
              error={estado.errores?.productoId?.[0]}
            />
            <CampoTexto
              etiqueta="Fecha"
              name="fecha"
              type="date"
              defaultValue={fechaHoy}
              requerido
              error={estado.errores?.fecha?.[0]}
            />
            <CampoTexto
              etiqueta="Cantidad producida"
              name="cantidad"
              type="number"
              step="1"
              min="1"
              defaultValue="1"
              requerido
              error={estado.errores?.cantidad?.[0]}
            />
          </div>

          <div className="flex justify-end">
            <Boton type="submit" cargando={pendiente}>
              Registrar producción
            </Boton>
          </div>
        </form>
      )}
    </PanelSeccion>
  );
}
