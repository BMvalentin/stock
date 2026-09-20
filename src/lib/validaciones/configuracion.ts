import { z } from "zod";

export const esquemaConfiguracionGeneral = z.object({
  nombreComercio: z
    .string()
    .trim()
    .min(1, "El nombre del comercio es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  moneda: z
    .string()
    .trim()
    .length(3, "Usá el código de 3 letras (por ejemplo ARS)")
    .toUpperCase(),
  locale: z
    .string()
    .trim()
    .min(2, "Locale inválido")
    .max(10, "Locale inválido"),
});

export const esquemaMetodoPago = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código es obligatorio")
    .max(30, "Máximo 30 caracteres")
    .transform((valor) => valor.toUpperCase().replace(/\s+/g, "_")),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(60, "Máximo 60 caracteres"),
  orden: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
});

export const esquemaConfiguracionEnvio = z.object({
  tipo: z.enum(
    ["SIN_CARGO", "TARIFA_FIJA", "POR_PRODUCTO", "POR_BULTO"],
    { message: "Tipo de cálculo inválido" },
  ),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
});
