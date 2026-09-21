import { z } from "zod";

// Importes como texto con hasta 2 decimales. Se validan como string para
// convertirlos a `Prisma.Decimal` sin pasar por aritmética de punto flotante.
const textoDecimal = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Importe inválido");

export const esquemaMontoPositivo = textoDecimal.refine(
  (valor) => Number(valor) > 0,
  "El importe debe ser mayor a 0",
);

export const esquemaMontoNoNegativo = textoDecimal;

// Horas de jornada como texto decimal, mayores a 0 y hasta 24.
export const esquemaHorasJornada = textoDecimal
  .refine((valor) => Number(valor) > 0, "Las horas deben ser mayores a 0")
  .refine((valor) => Number(valor) <= 24, "Máximo 24 horas");
