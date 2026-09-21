import { z } from "zod";

// Proveedores de mapas admitidos. La validación es extensible: para sumar otro
// proveedor alcanza con agregar su dominio base. `google.com` cubre
// `www.google.com` y `maps.google.com`; `goo.gl` cubre `maps.app.goo.gl`.
const HOSTS_MAPAS = ["google.com", "goo.gl"];

// Valida que sea una URL HTTPS de un proveedor de mapas admitido. Rechaza
// esquemas peligrosos como `javascript:` y URLs de otros orígenes.
export function esUrlMapasValida(valor: string): boolean {
  let url: URL;

  try {
    url = new URL(valor);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();

  return HOSTS_MAPAS.some(
    (permitido) => host === permitido || host.endsWith(`.${permitido}`),
  );
}

const MENSAJE_MAPS = "Ingresá una URL válida de Google Maps (https)";

export const esquemaMapsUrl = z
  .string()
  .trim()
  .min(1, MENSAJE_MAPS)
  .max(2048, "La URL es demasiado larga")
  .refine(esUrlMapasValida, MENSAJE_MAPS);

// Campo opcional del formulario: vacío se guarda como `undefined`.
export const mapsUrlOpcional = z
  .string()
  .trim()
  .max(2048, "La URL es demasiado larga")
  .optional()
  .transform((valor) => (valor ? valor : undefined))
  .refine((valor) => valor === undefined || esUrlMapasValida(valor), MENSAJE_MAPS);

const coordenadaOpcional = (min: number, max: number, mensaje: string) =>
  z.preprocess(
    (valor) =>
      valor === "" || valor === null || valor === undefined ? undefined : valor,
    z.coerce.number().min(min, mensaje).max(max, mensaje).optional(),
  );

export const latitudOpcional = coordenadaOpcional(-90, 90, "Latitud inválida");
export const longitudOpcional = coordenadaOpcional(
  -180,
  180,
  "Longitud inválida",
);
