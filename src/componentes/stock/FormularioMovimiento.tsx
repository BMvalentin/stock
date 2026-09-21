"use client";

import { useActionState, useEffect } from "react";
import { accionRegistrarMovimiento } from "@/acciones/stock/accionRegistrarMovimiento";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

const TIPOS_MANUALES: OpcionCampo[] = [
  { valor: "INGRESO", etiqueta: "Ingreso" },
  { valor: "EGRESO", etiqueta: "Egreso" },
  { valor: "AJUSTE_POSITIVO", etiqueta: "Ajuste positivo" },
  { valor: "AJUSTE_NEGATIVO", etiqueta: "Ajuste negativo" },
];

export function FormularioMovimiento({
  productos,
  productoInicialId,
  alCerrar,
  alExito,
}: {
  productos: OpcionCampo[];
  productoInicialId?: string;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionRegistrarMovimiento,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <CampoSelect
        etiqueta="Producto"
        name="productoId"
        opciones={productos}
        marcador="Seleccioná un producto"
        defaultValue={productoInicialId ?? ""}
        requerido
        error={estado.errores?.productoId?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Tipo de movimiento"
          name="tipo"
          opciones={TIPOS_MANUALES}
          defaultValue="INGRESO"
          requerido
          error={estado.errores?.tipo?.[0]}
        />
        <CampoTexto
          etiqueta="Cantidad"
          name="cantidad"
          type="number"
          min="0.001"
          step="0.001"
          ayuda="En kg para productos con venta suelta; en unidades para el resto."
          requerido
          error={estado.errores?.cantidad?.[0]}
        />
      </div>

      <CampoTextarea
        etiqueta="Motivo"
        name="motivo"
        rows={2}
        ayuda="Opcional. Por ejemplo: compra a proveedor, recuento, rotura."
        error={estado.errores?.motivo?.[0]}
      />

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          Registrar movimiento
        </Boton>
      </div>
    </form>
  );
}
