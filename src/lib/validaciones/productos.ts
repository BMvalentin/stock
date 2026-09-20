import { z } from "zod";

const descripcionOpcional = z
  .string()
  .trim()
  .max(500, "Máximo 500 caracteres")
  .optional()
  .transform((valor) => (valor ? valor : undefined));

export const esquemaProducto = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  descripcion: descripcionOpcional,
  sku: z
    .string()
    .trim()
    .min(1, "El SKU es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  categoriaId: z.string().min(1, "Seleccioná una categoría"),
  stockMinimo: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo"),
  unidadesPorBulto: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "El mínimo es 1"),
});

export const esquemaPrecioProducto = z.object({
  metodoPagoId: z.string().min(1),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

export const esquemaStockInicial = z.coerce
  .number()
  .int("Debe ser un número entero")
  .min(0, "No puede ser negativo");

export const esquemaActivo = z.coerce.boolean();
