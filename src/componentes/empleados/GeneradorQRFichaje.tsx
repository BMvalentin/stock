"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { accionGenerarTokenFichajeQR } from "@/acciones/asistencias/accionGenerarTokenFichajeQR";
import type { EstadoGeneracionQR } from "@/tipos/fichaje";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

const INTERVALO_RENOVACION_MS = 30_000;

function horaEnZona(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: ZONA_HORARIA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

// Pantalla del comercio: genera y renueva el QR de fichaje. El QR contiene solo
// un token temporal; nunca datos de empleados.
export function GeneradorQRFichaje({ locale }: { locale: string }) {
  const [estado, setEstado] = useState<EstadoGeneracionQR | null>(null);
  const [cargando, setCargando] = useState(false);

  const generar = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await accionGenerarTokenFichajeQR();
      setEstado(resultado);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    void (async () => {
      const resultado = await accionGenerarTokenFichajeQR();
      if (activo) setEstado(resultado);
    })();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(generar, INTERVALO_RENOVACION_MS);
    return () => clearInterval(id);
  }, [generar]);

  if (!estado) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500">
        Generando código…
      </p>
    );
  }

  if (!estado.exito) {
    return (
      <div className="space-y-4">
        <Alerta tono="error">{estado.error}</Alerta>
        <div className="flex justify-center">
          <Boton onClick={generar} cargando={cargando}>
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Reintentar
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white p-4 [&>svg]:h-auto [&>svg]:w-full"
        // El SVG lo genera el servidor a partir de nuestro token; no incluye
        // datos de empleados.
        dangerouslySetInnerHTML={{ __html: estado.datos.qrSvg }}
      />

      <p className="text-sm text-zinc-500">
        Escaneá este código desde tu teléfono.
      </p>

      <p className="text-sm text-zinc-500">
        QR válido hasta:{" "}
        <span className="font-medium text-zinc-900">
          {horaEnZona(estado.datos.expiraEn, locale)}
        </span>
      </p>

      <Boton variante="secundario" tamano="sm" onClick={generar} cargando={cargando}>
        <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
        Renovar ahora
      </Boton>
    </div>
  );
}
