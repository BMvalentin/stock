"use client";

import { useState, useTransition } from "react";
import { accionCambiarEstadoPedido } from "@/acciones/pedidos/accionCambiarEstadoPedido";
import {
  ETIQUETAS_ESTADO_PEDIDO,
} from "@/constantes/estadosPedido";
import type { EstadoPedido } from "@/generated/prisma/enums";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";

export function AccionesEstadoPedido({
  pedidoId,
  siguientes,
}: {
  pedidoId: string;
  siguientes: EstadoPedido[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiar(estado: EstadoPedido) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoPedido(pedidoId, estado);
      setError(resultado.error ?? null);
      setConfirmarCancelar(false);
    });
  }

  if (siguientes.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        El pedido está en un estado final. No admite más cambios.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <div className="flex flex-wrap gap-2">
        {siguientes.map((estado) =>
          estado === "CANCELADO" ? (
            <Boton
              key={estado}
              variante="peligro"
              onClick={() => setConfirmarCancelar(true)}
              disabled={pendiente}
            >
              {ETIQUETAS_ESTADO_PEDIDO[estado]}
            </Boton>
          ) : (
            <Boton
              key={estado}
              onClick={() => cambiar(estado)}
              cargando={pendiente}
            >
              Pasar a {ETIQUETAS_ESTADO_PEDIDO[estado]}
            </Boton>
          ),
        )}
      </div>

      <DialogoConfirmacion
        abierto={confirmarCancelar}
        alCerrar={() => setConfirmarCancelar(false)}
        alConfirmar={() => cambiar("CANCELADO")}
        titulo="Cancelar pedido"
        descripcion="Si el pedido ya descontó stock, se generará una devolución. Esta acción no se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={pendiente}
      />
    </div>
  );
}
