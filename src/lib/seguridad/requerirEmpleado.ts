import { redirect } from "next/navigation";
import {
  requerirSesion,
  type UsuarioSesion,
} from "@/lib/seguridad/requerirSesion";

// Autorización de servidor para el área del empleado. Un ADMIN no usa estas
// rutas: se lo redirige al panel administrativo. La autorización real del
// backend se valida aquí y en cada Server Action; la navegación solo oculta.
export async function requerirEmpleado(): Promise<UsuarioSesion> {
  const usuario = await requerirSesion();

  if (usuario.rol !== "EMPLEADO") {
    redirect("/admin");
  }

  return usuario;
}
