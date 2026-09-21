"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { accionMarcarLiquidacionPagada } from "@/acciones/liquidaciones/accionMarcarLiquidacionPagada";
import { accionCancelarLiquidacion } from "@/acciones/liquidaciones/accionCancelarLiquidacion";
import type { EstadoLiquidacion } from "@/generated/prisma/enums";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";

export function AccionesLiquidacion({
  liquidacionId,
  estado,
}: {
  liquidacionId: string;
  estado: EstadoLiquidacion;
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<"pagar" | "anular" | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function ejecutar() {
    const accion = confirmar;

    iniciarTransicion(async () => {
      const resultado =
        accion === "pagar"
          ? await accionMarcarLiquidacionPagada(liquidacionId)
          : await accionCancelarLiquidacion(liquidacionId);

      setError(resultado.error ?? null);
      setConfirmar(null);
    });
  }

  const puedePagar = estado === "CALCULADA";
  const puedeAnular = estado === "CALCULADA" || estado === "ABIERTA";

  if (!puedePagar && !puedeAnular) {
    return error ? <Alerta tono="error">{error}</Alerta> : null;
  }

  return (
    <div className="space-y-3">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <div className="flex flex-wrap gap-2">
        {puedePagar ? (
          <Boton onClick={() => setConfirmar("pagar")}>
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Marcar como pagada
          </Boton>
        ) : null}
        {puedeAnular ? (
          <Boton variante="secundario" onClick={() => setConfirmar("anular")}>
            <XCircle className="h-4 w-4" strokeWidth={2} />
            Anular liquidación
          </Boton>
        ) : null}
      </div>

      <DialogoConfirmacion
        abierto={confirmar !== null}
        alCerrar={() => setConfirmar(null)}
        alConfirmar={ejecutar}
        titulo={confirmar === "pagar" ? "Marcar como pagada" : "Anular liquidación"}
        descripcion={
          confirmar === "pagar"
            ? "Se registra que la liquidación ya fue abonada. No modifica los importes."
            : "Se liberan las asistencias o producciones incluidas para poder liquidarlas de nuevo."
        }
        textoConfirmar={confirmar === "pagar" ? "Marcar pagada" : "Anular"}
        cargando={pendiente}
        peligro={confirmar === "anular"}
      />
    </div>
  );
}
