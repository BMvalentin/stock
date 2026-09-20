import { z } from "zod";

// Validación de credenciales. La normalización (trim/minúsculas) se aplica
// antes de consultar la base de datos.
export const esquemaCredenciales = z.object({
  email: z.email({ message: "Correo electrónico inválido" }),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
