import { z } from "zod";

export const esquemaEmpleado = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  email: z.email({ message: "Correo electrónico inválido" }),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "Máximo 72 caracteres"),
  rol: z.enum(["ADMIN", "EMPLEADO"], { message: "Rol inválido" }),
});

export const esquemaRol = z.enum(["ADMIN", "EMPLEADO"], {
  message: "Rol inválido",
});
