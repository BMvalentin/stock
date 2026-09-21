// Genera una URL de búsqueda de Google Maps a partir de la dirección y la
// localidad. No usa una API paga ni inventa coordenadas: es una búsqueda, no
// una ubicación exacta. Se usa solo cuando el pedido no tiene `mapsUrl`.
export function generarUrlBusquedaMaps(
  direccion: string,
  localidad?: string | null,
): string {
  const consulta = [direccion, localidad]
    .map((parte) => parte?.trim())
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    consulta,
  )}`;
}
