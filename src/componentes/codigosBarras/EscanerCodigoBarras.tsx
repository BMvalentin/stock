"use client";

import { normalizarCodigoBarras } from "@/lib/utilidades/normalizarCodigoBarras";
import { EscanerCamara } from "@/componentes/codigosBarras/EscanerCamara";

// Escáner de códigos de barras. Reutiliza el escáner de cámara genérico y
// normaliza el resultado a un código válido antes de entregarlo.
export function EscanerCodigoBarras({
  abierto,
  alCerrar,
  alDetectar,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alDetectar: (codigo: string) => void;
}) {
  return (
    <EscanerCamara
      abierto={abierto}
      alCerrar={alCerrar}
      alDetectar={alDetectar}
      tipo="barras"
      titulo="Escanear código de barras"
      descripcion="Apuntá la cámara al código del producto."
      normalizar={normalizarCodigoBarras}
      permitirManual
    />
  );
}
