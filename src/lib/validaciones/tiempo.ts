import { z } from "zod";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";

// Fecha de calendario "YYYY-MM-DD" válida.
export const esquemaFechaCalendario = z
  .string()
  .trim()
  .refine(
    (valor) => parsearFechaCalendario(valor) !== undefined,
    "Fecha inválida",
  );

// Hora en formato de 24 horas "HH:mm".
export const esquemaHora = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (HH:mm)");

// Hora opcional: una cadena vacía se normaliza a undefined.
export const esquemaHoraOpcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor ? valor : undefined))
  .refine(
    (valor) => valor === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(valor),
    "Hora inválida (HH:mm)",
  );
