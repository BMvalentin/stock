"use client";

import { useActionState, useEffect } from "react";
import { accionActualizarTarifaProducto } from "@/acciones/tarifasProducto/accionActualizarTarifaProducto";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { TarifaProductoListado } from "@/servicios/tarifasProducto/listarTarifasProducto";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function FormularioEditarTarifa({
  tarifa,
  alCerrar,
  alExito,
}: {
  tarifa: TarifaProductoListado;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarTarifaProducto,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <input type="hidden" name="tarifaId" value={tarifa.id} />

      <p className="text-sm text-zinc-600">
        Producto:{" "}
        <span className="font-medium text-zinc-900">
          {tarifa.productoNombre}
        </span>
      </p>

      <CampoTexto
        etiqueta="Precio por unidad"
        name="precioUnidad"
        type="number"
        step="0.01"
        min="0"
        defaultValue={tarifa.precioUnidad.toString()}
        requerido
        error={estado.errores?.precioUnidad?.[0]}
      />

      <Alerta tono="advertencia">
        Esta modificación afectará a las nuevas producciones. Las producciones
        y liquidaciones históricas conservarán el precio anterior.
      </Alerta>

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          Guardar tarifa
        </Boton>
      </div>
    </form>
  );
}
