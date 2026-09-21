"use client";

import { MapPin } from "lucide-react";
import { generarUrlBusquedaMaps } from "@/lib/utilidades/generarUrlBusquedaMaps";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";

// Ubicación de entrega. Permite pegar una URL concreta de Google Maps o generar
// una búsqueda con la dirección y localidad. No usa APIs pagas ni inventa
// coordenadas: la búsqueda es una referencia, no una ubicación exacta.
export function CampoUbicacionMaps({
  direccion,
  localidad,
  mapsUrl,
  onCambiarMapsUrl,
  latitud,
  longitud,
  onCambiarLatitud,
  onCambiarLongitud,
  errorMapsUrl,
  errorLatitud,
  errorLongitud,
}: {
  direccion: string;
  localidad: string;
  mapsUrl: string;
  onCambiarMapsUrl: (valor: string) => void;
  latitud: string;
  longitud: string;
  onCambiarLatitud: (valor: string) => void;
  onCambiarLongitud: (valor: string) => void;
  errorMapsUrl?: string;
  errorLatitud?: string;
  errorLongitud?: string;
}) {
  const urlBusqueda = direccion.trim()
    ? generarUrlBusquedaMaps(direccion, localidad)
    : null;

  function abrirBusqueda() {
    if (!urlBusqueda) return;
    window.open(urlBusqueda, "_blank", "noopener,noreferrer");
  }

  function usarBusqueda() {
    if (urlBusqueda) onCambiarMapsUrl(urlBusqueda);
  }

  return (
    <div className="space-y-3">
      <CampoTexto
        etiqueta="Ubicación en Google Maps"
        name="mapsUrl"
        value={mapsUrl}
        onChange={(evento) => onCambiarMapsUrl(evento.target.value)}
        placeholder="https://www.google.com/maps/..."
        ayuda="Opcional. Pegá el enlace de la ubicación exacta si lo tenés."
        error={errorMapsUrl}
      />

      <div className="flex flex-wrap gap-2">
        <Boton
          variante="secundario"
          tamano="sm"
          onClick={abrirBusqueda}
          disabled={!urlBusqueda}
        >
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
          Buscar en Google Maps
        </Boton>
        <Boton
          variante="fantasma"
          tamano="sm"
          onClick={usarBusqueda}
          disabled={!urlBusqueda}
        >
          Usar esta búsqueda como ubicación
        </Boton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Latitud (opcional)"
          name="latitud"
          value={latitud}
          onChange={(evento) => onCambiarLatitud(evento.target.value)}
          inputMode="decimal"
          placeholder="-34.6037"
          error={errorLatitud}
        />
        <CampoTexto
          etiqueta="Longitud (opcional)"
          name="longitud"
          value={longitud}
          onChange={(evento) => onCambiarLongitud(evento.target.value)}
          inputMode="decimal"
          placeholder="-58.3816"
          error={errorLongitud}
        />
      </div>
    </div>
  );
}
