import { redirect } from "next/navigation";
import {
  requerirSesion,
  type UsuarioSesion,
} from "@/lib/seguridad/requerirSesion";

// Autorización de servidor para acciones y rutas administrativas.
// Un EMPLEADO nunca debe poder ejecutar operaciones de administración aunque
// invoque la Server Action manualmente.
export async function requerirAdmin(): Promise<UsuarioSesion> {
  const usuario = await requerirSesion();

  if (usuario.rol !== "ADMIN") {
    redirect("/dashboard?error=sin-permiso");
  }

  return usuario;
}
