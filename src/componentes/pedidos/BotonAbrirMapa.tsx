import { MapPin } from "lucide-react";
import { generarUrlBusquedaMaps } from "@/lib/utilidades/generarUrlBusquedaMaps";
import { estilosBoton } from "@/componentes/ui/estilosBoton";

// Botón para abrir la ubicación del pedido en Google Maps. Usa `mapsUrl` si el
// operador la cargó; si no, genera una búsqueda con la dirección y localidad.
// Nunca inventa coordenadas. Abre en una pestaña nueva; en mobile el sistema
// operativo puede derivar a la app de mapas.
export function BotonAbrirMapa({
  mapsUrl,
  direccion,
  localidad,
}: {
  mapsUrl: string | null;
  direccion: string | null;
  localidad: string | null;
}) {
  const url =
    mapsUrl ?? (direccion ? generarUrlBusquedaMaps(direccion, localidad) : null);

  if (!url) {
    return (
      <p className="text-xs text-zinc-500">
        No hay ubicación ni dirección cargada para este pedido.
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={estilosBoton("primario")}
    >
      <MapPin className="h-4 w-4" strokeWidth={1.75} />
      Abrir ubicación en Google Maps
    </a>
  );
}
