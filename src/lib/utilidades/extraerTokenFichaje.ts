import { PREFIJO_FICHAJE_QR } from "@/constantes/fichaje";

// Extrae el token del contenido leído del QR. Devuelve null si el texto no
// tiene el formato esperado. No valida la vigencia: eso ocurre en el servidor.
export function extraerTokenFichaje(contenido: string): string | null {
  const texto = contenido.trim();

  if (!texto.startsWith(PREFIJO_FICHAJE_QR)) return null;

  const token = texto.slice(PREFIJO_FICHAJE_QR.length).trim();

  return token.length > 0 ? token : null;
}
