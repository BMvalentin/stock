"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { normalizarCodigoBarras } from "@/lib/utilidades/normalizarCodigoBarras";
import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Alerta } from "@/componentes/ui/Alerta";

type EstadoEscaner = "iniciando" | "escaneando" | "error";

// Componente reutilizable de escaneo por cámara. No conoce productos, stock ni
// roles: solo abre la cámara, detecta un código, lo normaliza y lo devuelve por
// `alDetectar`. La lógica de negocio vive en quien lo usa.
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
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Escanear código de barras"
      descripcion="Apuntá la cámara al código del producto."
      ancho="sm"
    >
      {/* Se monta solo al abrir el modal: así la cámara y el estado arrancan
          limpios y se liberan al cerrar. */}
      <ContenidoEscaner alDetectar={alDetectar} />
    </Modal>
  );
}

function ContenidoEscaner({
  alDetectar,
}: {
  alDetectar: (codigo: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlesRef = useRef<IScannerControls | null>(null);
  const detectadoRef = useRef(false);
  const alDetectarRef = useRef(alDetectar);
  const [estado, setEstado] = useState<EstadoEscaner>("iniciando");
  const [error, setError] = useState<string | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");

  useEffect(() => {
    alDetectarRef.current = alDetectar;
  }, [alDetectar]);

  const detenerCamara = useCallback(() => {
    controlesRef.current?.stop();
    controlesRef.current = null;

    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((pista) => pista.stop());
    if (video) video.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function iniciarCamara() {
      // Deja correr un tick para no actualizar estado sincrónicamente en el
      // cuerpo del efecto.
      await Promise.resolve();
      if (cancelado) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setEstado("error");
        setError(
          "Tu dispositivo o navegador no permite usar la cámara. Podés ingresar el código manualmente.",
        );
        return;
      }

      try {
        const { BrowserMultiFormatReader, BarcodeFormat } = await import(
          "@zxing/browser"
        );

        if (cancelado) return;

        const lector = new BrowserMultiFormatReader();
        lector.possibleFormats = [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
        ];

        const controles = await lector.decodeFromVideoDevice(
          undefined,
          videoRef.current ?? undefined,
          (resultado) => {
            if (!resultado || detectadoRef.current) return;

            const codigo = normalizarCodigoBarras(resultado.getText());
            if (!codigo) return;

            detectadoRef.current = true;
            detenerCamara();
            alDetectarRef.current(codigo);
          },
        );

        if (cancelado) {
          controles.stop();
          return;
        }

        controlesRef.current = controles;
        setEstado("escaneando");
      } catch (fallo) {
        if (cancelado) return;

        const nombre = (fallo as { name?: string } | null)?.name;

        if (nombre === "NotAllowedError" || nombre === "SecurityError") {
          setError(
            "No pudimos acceder a la cámara. Revisá los permisos del navegador o ingresá el código manualmente.",
          );
        } else if (
          nombre === "NotFoundError" ||
          nombre === "OverconstrainedError"
        ) {
          setError("Tu dispositivo no tiene una cámara disponible.");
        } else {
          setError(
            "No pudimos iniciar la cámara. Ingresá el código manualmente.",
          );
        }

        setEstado("error");
      }
    }

    iniciarCamara();

    return () => {
      cancelado = true;
      detenerCamara();
    };
  }, [detenerCamara]);

  function confirmarManual() {
    const codigo = normalizarCodigoBarras(codigoManual);
    if (!codigo || detectadoRef.current) return;

    detectadoRef.current = true;
    detenerCamara();
    alDetectarRef.current(codigo);
  }

  const mostrarManual = modoManual || estado === "error";

  return (
    <div className="space-y-4">
      {estado === "error" ? (
        <Alerta tono="error">{error}</Alerta>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-900">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-label="Vista previa de la cámara"
            className="h-64 w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-4/5 rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
      )}

      <p className="text-center text-sm text-zinc-500" aria-live="polite">
        {estado === "iniciando"
          ? "Iniciando cámara…"
          : estado === "escaneando"
            ? "Buscando código…"
            : "Ingresá el código manualmente."}
      </p>

      {mostrarManual ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <CampoTexto
              etiqueta="Código de barras"
              value={codigoManual}
              onChange={(evento) => setCodigoManual(evento.target.value)}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              onKeyDown={(evento) => {
                if (evento.key === "Enter") {
                  evento.preventDefault();
                  confirmarManual();
                }
              }}
            />
          </div>
          <Boton onClick={confirmarManual} disabled={!codigoManual.trim()}>
            Usar
          </Boton>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setModoManual(true)}
          className="mx-auto block text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Escribir código manualmente
        </button>
      )}
    </div>
  );
}
