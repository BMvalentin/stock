import { createHash } from "node:crypto";

// Hash determinista de un token. Se usa para comparar el token recibido con el
// guardado sin almacenar el valor en claro.
export function hashearToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
