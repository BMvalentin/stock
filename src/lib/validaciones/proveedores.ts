import { z } from "zod";

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((valor) => (valor ? valor : undefined));

export const esquemaProveedor = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  empresa: opcional(120),
  telefono: opcional(40),
  whatsapp: opcional(40),
  email: z
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .optional()
    .transform((valor) => (valor ? valor : undefined))
    .refine(
      (valor) => !valor || z.email().safeParse(valor).success,
      "Correo electrónico inválido",
    ),
  direccion: opcional(200),
  notas: opcional(500),
});
