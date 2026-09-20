import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/cliente";
import type { Rol } from "@/generated/prisma/enums";

export type UsuarioSesion = {
  id: string;
  nombre: string | null;
  email: string;
  rol: Rol;
};

// Autorización de servidor: valida la sesión y vuelve a leer el usuario desde
// la base de datos para reflejar cambios de rol o desactivaciones inmediatas.
export async function requerirSesion(): Promise<UsuarioSesion> {
  const sesion = await auth();

  if (!sesion?.user?.id) {
    redirect("/login");
  }

  const usuario = await prisma.user.findUnique({
    where: { id: sesion.user.id },
    select: { id: true, name: true, email: true, rol: true, activo: true },
  });

  if (!usuario || !usuario.activo) {
    redirect("/login");
  }

  return {
    id: usuario.id,
    nombre: usuario.name,
    email: usuario.email,
    rol: usuario.rol,
  };
}
