import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { hashearToken } from "@/lib/utilidades/hashearToken";

// Valida que el token leído del QR exista y esté vigente. El token se compara
// por hash; nunca se guarda ni se registra en claro.
export async function validarTokenFichajeQR(token: string): Promise<void> {
  const registro = await prisma.tokenFichajeQR.findUnique({
    where: { tokenHash: hashearToken(token) },
    select: { id: true, expiraEn: true },
  });

  if (!registro || registro.expiraEn.getTime() <= Date.now()) {
    throw new ErrorNegocio(
      "El código QR expiró. Escaneá el código actualizado del comercio.",
    );
  }
}
