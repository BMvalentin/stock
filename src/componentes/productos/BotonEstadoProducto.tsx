"use client";

import { useState, useTransition } from "react";
import { Power } from "lucide-react";
import { accionCambiarEstadoProducto } from "@/acciones/productos/accionCambiarEstadoProducto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function BotonEstadoProducto({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function alternar() {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoProducto(id, !activo);
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error ? <Alerta tono="error">{error}</Alerta> : null}
      <Boton
        variante={activo ? "secundario" : "primario"}
        onClick={alternar}
        cargando={pendiente}
      >
        <Power className="h-4 w-4" strokeWidth={1.75} />
        {activo ? "Desactivar" : "Reactivar"}
      </Boton>
    </div>
  );
}
