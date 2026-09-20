"use client";

import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";

export function DialogoConfirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  cargando,
  peligro = true,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alConfirmar: () => void;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  cargando?: boolean;
  peligro?: boolean;
}) {
  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={titulo} ancho="sm">
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">{descripcion}</p>
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={alCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton
            variante={peligro ? "peligro" : "primario"}
            onClick={alConfirmar}
            cargando={cargando}
          >
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </Modal>
  );
}
