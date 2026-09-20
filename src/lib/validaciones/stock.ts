import { z } from "zod";

export const esquemaMovimiento = z.object({
  productoId: z.string().min(1, "Seleccioná un producto"),
  tipo: z.enum(
    ["INGRESO", "EGRESO", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"],
    { message: "Tipo de movimiento inválido" },
  ),
  cantidad: z.coerce
    .number()
    .int("Debe ser un número entero")
    .positive("Debe ser mayor a cero"),
  motivo: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .transform((valor) => (valor ? valor : undefined)),
});
