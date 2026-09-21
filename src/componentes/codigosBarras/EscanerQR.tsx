"use client";

import { EscanerCamara } from "@/componentes/codigosBarras/EscanerCamara";

// Escáner de códigos QR. Reutiliza el escáner de cámara genérico y entrega el
// contenido tal cual (el servidor valida el token).
export function EscanerQR({
  abierto,
  alCerrar,
  alDetectar,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alDetectar: (contenido: string) => void;
}) {
  return (
    <EscanerCamara
      abierto={abierto}
      alCerrar={alCerrar}
      alDetectar={alDetectar}
      tipo="qr"
      titulo="Escanear código QR"
      descripcion="Apuntá la cámara al código de fichaje del comercio."
    />
  );
}
