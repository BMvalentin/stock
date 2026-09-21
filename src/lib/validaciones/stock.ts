import { z } from "zod";
import { tieneMaximoTresDecimales } from "@/lib/utilidades/tieneMaximoTresDecimales";

export const esquemaMovimiento = z.object({
  productoId: z.string().min(1, "Seleccioná un producto"),
  tipo: z.enum(
    ["INGRESO", "EGRESO", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"],
    { message: "Tipo de movimiento inválido" },
  ),
  cantidad: z.coerce
    .number()
    .positive("Debe ser mayor a cero")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
  motivo: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .transform((valor) => (valor ? valor : undefined)),
});
