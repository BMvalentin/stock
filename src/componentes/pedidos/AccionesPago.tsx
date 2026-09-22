"use client";

import { useState, useTransition } from "react";
import { accionCambiarEstadoPago } from "@/acciones/pedidos/accionCambiarEstadoPago";
import {
  ETIQUETAS_ESTADO_PAGO,
  ESTADOS_PAGO,
} from "@/constantes/estadosPago";
import type { EstadoPago } from "@/generated/prisma/enums";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function AccionesPago({
  pedidoId,
  estadoPago,
}: {
  pedidoId: string;
  estadoPago: EstadoPago;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiar(estado: EstadoPago) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoPago(pedidoId, estado);
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="space-y-3">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
        {ESTADOS_PAGO.filter((estado) => estado !== estadoPago).map(
          (estado) => (
            <Boton
              key={estado}
              variante={estado === "RECHAZADO" ? "peligro" : "secundario"}
              onClick={() => cambiar(estado)}
              disabled={pendiente}
            >
              Marcar {ETIQUETAS_ESTADO_PAGO[estado].toLowerCase()}
            </Boton>
          ),
        )}
      </div>
    </div>
  );
}
