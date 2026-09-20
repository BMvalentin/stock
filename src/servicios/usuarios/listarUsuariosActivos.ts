import { prisma } from "@/lib/prisma/cliente";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

export async function listarUsuariosActivos(): Promise<OpcionCampo[]> {
  const usuarios = await prisma.user.findMany({
    where: { activo: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return usuarios.map((usuario) => ({
    valor: usuario.id,
    etiqueta: usuario.name ?? usuario.email,
  }));
}
