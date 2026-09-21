"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Alerta } from "@/componentes/ui/Alerta";

type EstadoEscaner = "iniciando" | "escaneando" | "error";

// Componente reutilizable de lectura por cámara. No conoce el dominio: abre la
// cámara, detecta un código del formato indicado y lo entrega por `alDetectar`.
// Puede normalizar el texto y, opcionalmente, permitir el ingreso manual.
export function EscanerCamara({
  abierto,
  alCerrar,
  alDetectar,
  tipo,
  titulo,
  descripcion,
  normalizar,
  permitirManual = false,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alDetectar: (texto: string) => void;
  tipo: "barras" | "qr";
  titulo: string;
  descripcion: string;
  normalizar?: (texto: string) => string | null;
  permitirManual?: boolean;
}) {
  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      descripcion={descripcion}
      ancho="sm"
    >
      {/* Se monta solo al abrir el modal: así la cámara y el estado arrancan
          limpios y se liberan al cerrar. */}
      <ContenidoEscaner
        alDetectar={alDetectar}
        tipo={tipo}
        normalizar={normalizar}
        permitirManual={permitirManual}
      />
    </Modal>
  );
}

function ContenidoEscaner({
  alDetectar,
  tipo,
  normalizar,
  permitirManual,
}: {
  alDetectar: (texto: string) => void;
  tipo: "barras" | "qr";
  normalizar?: (texto: string) => string | null;
  permitirManual: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlesRef = useRef<IScannerControls | null>(null);
  const detectadoRef = useRef(false);
  const alDetectarRef = useRef(alDetectar);
  const normalizarRef = useRef(normalizar);
  const [estado, setEstado] = useState<EstadoEscaner>("iniciando");
  const [error, setError] = useState<string | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");

  useEffect(() => {
    alDetectarRef.current = alDetectar;
  }, [alDetectar]);

  useEffect(() => {
    normalizarRef.current = normalizar;
  }, [normalizar]);

  const detenerCamara = useCallback(() => {
    controlesRef.current?.stop();
    controlesRef.current = null;

    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((pista) => pista.stop());
    if (video) video.srcObject = null;
  }, []);

  const entregar = useCallback((texto: string) => {
    const normalizado = normalizarRef.current
      ? normalizarRef.current(texto)
      : texto.trim();

    if (!normalizado || detectadoRef.current) return;

    detectadoRef.current = true;
    detenerCamara();
    alDetectarRef.current(normalizado);
  }, [detenerCamara]);

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
          "Tu dispositivo o navegador no permite usar la cámara. En producción, la cámara requiere HTTPS.",
        );
        return;
      }

      try {
        const { BrowserMultiFormatReader, BarcodeFormat } = await import(
          "@zxing/browser"
        );

        if (cancelado) return;

        const lector = new BrowserMultiFormatReader();
        lector.possibleFormats =
          tipo === "qr"
            ? [BarcodeFormat.QR_CODE]
            : [
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
            if (!resultado) return;
            entregar(resultado.getText());
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
            "No pudimos acceder a la cámara. Revisá los permisos del navegador.",
          );
        } else if (
          nombre === "NotFoundError" ||
          nombre === "OverconstrainedError"
        ) {
          setError("Tu dispositivo no tiene una cámara disponible.");
        } else {
          setError("No pudimos iniciar la cámara.");
        }

        setEstado("error");
      }
    }

    iniciarCamara();

    return () => {
      cancelado = true;
      detenerCamara();
    };
  }, [detenerCamara, entregar, tipo]);

  function confirmarManual() {
    entregar(codigoManual);
  }

  const mostrarManual = permitirManual && (modoManual || estado === "error");

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
            <div className="h-40 w-40 rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
      )}

      <p className="text-center text-sm text-zinc-500" aria-live="polite">
        {estado === "iniciando"
          ? "Iniciando cámara…"
          : estado === "escaneando"
            ? "Apuntá al código…"
            : "No se pudo usar la cámara."}
      </p>

      {permitirManual && mostrarManual ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <CampoTexto
              etiqueta="Código"
              value={codigoManual}
              onChange={(evento) => setCodigoManual(evento.target.value)}
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
      ) : null}

      {permitirManual && !mostrarManual ? (
        <button
          type="button"
          onClick={() => setModoManual(true)}
          className="mx-auto block text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Escribir código manualmente
        </button>
      ) : null}
    </div>
  );
}
