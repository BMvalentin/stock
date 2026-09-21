"use client";

import { useActionState, useEffect } from "react";
import { accionActualizarProduccion } from "@/acciones/producciones/accionActualizarProduccion";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { ProduccionListado } from "@/servicios/producciones/listarProducciones";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function FormularioEditarProduccion({
  produccion,
  moneda,
  locale,
  alCerrar,
  alExito,
}: {
  produccion: ProduccionListado;
  moneda: string;
  locale: string;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionActualizarProduccion,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <input type="hidden" name="produccionId" value={produccion.id} />

      <p className="text-sm text-zinc-600">
        Producto:{" "}
        <span className="font-medium text-zinc-900">
          {produccion.productoNombre}
        </span>{" "}
        · Precio congelado:{" "}
        <span className="font-medium text-zinc-900">
          {formatearMoneda(produccion.precioUnidad.toString(), moneda, locale)}
        </span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Fecha"
          name="fecha"
          type="date"
          defaultValue={produccion.fecha.toISOString().slice(0, 10)}
          requerido
          error={estado.errores?.fecha?.[0]}
        />
        <CampoTexto
          etiqueta="Cantidad producida"
          name="cantidad"
          type="number"
          step="1"
          min="1"
          defaultValue={String(produccion.cantidad)}
          requerido
          error={estado.errores?.cantidad?.[0]}
        />
      </div>

      <Alerta tono="advertencia">
        Se recalcula el total con el precio congelado de esta producción. El
        precio unitario no cambia.
      </Alerta>

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
