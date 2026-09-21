"use client";

import { useState, useTransition } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { accionBuscarProductoPorBarcode } from "@/acciones/productos/accionBuscarProductoPorBarcode";
import type { ProductoPorBarcode } from "@/servicios/productos/buscarProductoPorBarcode";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EscanerCodigoBarras } from "@/componentes/codigosBarras/EscanerCodigoBarras";
import { ResumenProductoBarcode } from "@/componentes/codigosBarras/ResumenProductoBarcode";

// Campo de código de barras del formulario de producto. Escanea o permite
// escribir a mano y consulta al servidor si el código ya está en uso.
export function CampoBarcode({
  valorInicial,
  error,
  moneda,
  locale,
}: {
  valorInicial?: string | null;
  error?: string;
  moneda: string;
  locale: string;
}) {
  const [barcode, setBarcode] = useState(valorInicial ?? "");
  const [escannerAbierto, setEscannerAbierto] = useState(false);
  const [verificando, iniciarTransicion] = useTransition();
  const [resultado, setResultado] = useState<ProductoPorBarcode | null>(null);
  const [estado, setEstado] = useState<"disponible" | "existe" | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [ultimoVerificado, setUltimoVerificado] = useState<string | null>(null);

  function limpiarResultado() {
    setResultado(null);
    setEstado(null);
    setErrorBusqueda(null);
    setUltimoVerificado(null);
  }

  function verificar(codigo: string) {
    const limpio = codigo.trim();
    if (!limpio) return;

    setErrorBusqueda(null);

    iniciarTransicion(async () => {
      const respuesta = await accionBuscarProductoPorBarcode(limpio);

      if (!respuesta.ok) {
        setResultado(null);
        setEstado(null);
        setErrorBusqueda(respuesta.error);
        return;
      }

      setUltimoVerificado(limpio);

      if (respuesta.producto) {
        setResultado(respuesta.producto);
        setEstado("existe");
      } else {
        setResultado(null);
        setEstado("disponible");
      }
    });
  }

  function alDetectar(codigo: string) {
    setEscannerAbierto(false);
    setBarcode(codigo);
    verificar(codigo);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <CampoTexto
            etiqueta="Código de barras"
            name="barcode"
            value={barcode}
            onChange={(evento) => {
              setBarcode(evento.target.value);
              limpiarResultado();
            }}
            onBlur={() => {
              const limpio = barcode.trim();
              if (limpio && limpio !== ultimoVerificado) verificar(limpio);
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="EAN, UPC o Code 128"
            ayuda="Opcional. Escaneá o escribí el código."
            error={error}
          />
        </div>
        <Boton variante="secundario" onClick={() => setEscannerAbierto(true)}>
          <Camera className="h-4 w-4" strokeWidth={1.75} />
          Escanear
        </Boton>
      </div>

      {verificando ? (
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
          Verificando código…
        </p>
      ) : null}

      {errorBusqueda ? <Alerta tono="error">{errorBusqueda}</Alerta> : null}

      {estado === "disponible" ? (
        <Alerta tono="exito">Código disponible.</Alerta>
      ) : null}

      {estado === "existe" && resultado ? (
        <div className="space-y-2">
          <Alerta tono="advertencia">
            Este código ya está asociado a un producto.
          </Alerta>
          <ResumenProductoBarcode
            producto={resultado}
            moneda={moneda}
            locale={locale}
          />
        </div>
      ) : null}

      <EscanerCodigoBarras
        abierto={escannerAbierto}
        alCerrar={() => setEscannerAbierto(false)}
        alDetectar={alDetectar}
      />
    </div>
  );
}
