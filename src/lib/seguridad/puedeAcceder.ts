import type { Rol } from "@/generated/prisma/enums";
import { nivelRequeridoParaRuta } from "@/lib/seguridad/nivelRequeridoParaRuta";

// Responde si un rol (o la ausencia de sesión) puede acceder a una ruta según
// la política central. Es una comprobación de UI/proxy: la autorización real
// de las operaciones se hace igualmente en el servidor.
export function puedeAcceder(rol: Rol | null, pathname: string): boolean {
  const nivel = nivelRequeridoParaRuta(pathname);

  if (nivel === "PUBLICO") return true;
  if (nivel === "AUTENTICADO") return rol !== null;

  return rol === "ADMIN";
}
