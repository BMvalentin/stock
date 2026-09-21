import { z } from "zod";

// Token leído del QR. El servidor solo confía en su vigencia y en la sesión
// autenticada; el empleado nunca se recibe desde el cliente.
export const esquemaFichajeQR = z.object({
  token: z
    .string()
    .trim()
    .min(10, "El código QR no es válido")
    .max(200, "El código QR no es válido"),
});
