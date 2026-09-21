import { z } from "zod";
import { normalizarCodigoBarras } from "@/lib/utilidades/normalizarCodigoBarras";
import { tieneMaximoTresDecimales } from "@/lib/utilidades/tieneMaximoTresDecimales";

const descripcionOpcional = z
  .string()
  .trim()
  .max(500, "Máximo 500 caracteres")
  .optional()
  .transform((valor) => (valor ? valor : undefined));

// EAN-13/EAN-8/UPC-A/UPC-E son numéricos; Code 128 admite alfanumérico y
// algunos símbolos. No se valida dígito verificador para no rechazar etiquetas
// internas ni Code 128.
const PATRON_BARCODE = /^[0-9A-Za-z\-._/+]{4,64}$/;
const MENSAJE_BARCODE = "Código de barras inválido";

export const esquemaBarcode = z
  .string()
  .trim()
  .transform(normalizarCodigoBarras)
  .refine((valor) => PATRON_BARCODE.test(valor), MENSAJE_BARCODE);

const barcodeOpcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor ? normalizarCodigoBarras(valor) : undefined))
  .refine(
    (valor) => valor === undefined || PATRON_BARCODE.test(valor),
    MENSAJE_BARCODE,
  );

export const esquemaProducto = z.object({
  barcode: barcodeOpcional,
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
  unidadVenta: z.enum(["UNIDAD", "KILOGRAMO"], {
    message: "Modalidad de venta inválida",
  }),
  stockMinimo: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
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
  .min(0, "No puede ser negativo")
  .refine(tieneMaximoTresDecimales, "Máximo 3 decimales");

export const esquemaActivo = z.coerce.boolean();
