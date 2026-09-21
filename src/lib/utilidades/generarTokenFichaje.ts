import { randomBytes } from "node:crypto";

// Genera un token opaco para el fichaje por QR. Solo se muestra en la pantalla
// del comercio; en la base se guarda su hash, nunca el valor en claro.
export function generarTokenFichaje(): string {
  return randomBytes(24).toString("base64url");
}
