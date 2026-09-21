import { prisma } from "@/lib/prisma/cliente";
import { generarTokenFichaje } from "@/lib/utilidades/generarTokenFichaje";
import { hashearToken } from "@/lib/utilidades/hashearToken";
import { DURACION_TOKEN_FICHAJE_MS } from "@/constantes/fichaje";

export type TokenFichajeGenerado = {
  token: string;
  expiraEn: Date;
};

// Genera un token temporal para la pantalla de fichaje y limpia los vencidos.
// Se guarda solo el hash. El token en claro se devuelve una única vez para
// dibujar el QR.
export async function generarTokenFichajeQR(
  creadoPorId: string,
): Promise<TokenFichajeGenerado> {
  const token = generarTokenFichaje();
  const expiraEn = new Date(Date.now() + DURACION_TOKEN_FICHAJE_MS);

  await prisma.$transaction(async (tx) => {
    await tx.tokenFichajeQR.deleteMany({
      where: { expiraEn: { lt: new Date() } },
    });

    await tx.tokenFichajeQR.create({
      data: {
        tokenHash: hashearToken(token),
        expiraEn,
        creadoPorId,
      },
    });
  });

  return { token, expiraEn };
}
