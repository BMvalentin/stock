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

// SKU opcional: si se ingresa se valida y conserva; si queda vacío se normaliza
// a `undefined` para persistirlo como NULL.
const skuOpcional = z
  .string()
  .trim()
  .max(50, "Máximo 50 caracteres")
  .optional()
  .transform((valor) => (valor ? valor : undefined));

// Peso de la presentación en kg. Es opcional en general, pero obligatorio
// cuando el producto permite venta suelta (se valida en `superRefine`).
const pesoPresentacionOpcional = z.preprocess(
  (valor) => (valor === "" || valor === null ? undefined : valor),
  z.coerce
    .number()
    .positive("Debe ser mayor a cero")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales")
    .optional(),
);

export const esquemaProducto = z
  .object({
    barcode: barcodeOpcional,
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(150, "Máximo 150 caracteres"),
    descripcion: descripcionOpcional,
    sku: skuOpcional,
    categoriaId: z.string().min(1, "Seleccioná una categoría"),
    unidadVenta: z.enum(["UNIDAD", "KILOGRAMO"], {
      message: "Modalidad de venta inválida",
    }),
    permiteVentaSuelta: z.boolean().default(false),
    pesoPresentacionKg: pesoPresentacionOpcional,
    stockMinimo: z.coerce
      .number()
      .min(0, "No puede ser negativo")
      .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
    unidadesPorBulto: z.coerce
      .number()
      .int("Debe ser un número entero")
      .min(1, "El mínimo es 1"),
  })
  .superRefine((datos, ctx) => {
    if (!datos.permiteVentaSuelta) return;

    if (datos.unidadVenta !== "UNIDAD") {
      ctx.addIssue({
        code: "custom",
        path: ["permiteVentaSuelta"],
        message:
          "La venta suelta solo aplica a productos vendidos por unidad o presentación.",
      });
    }

    if (datos.pesoPresentacionKg === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["pesoPresentacionKg"],
        message: "Indicá el peso de la presentación para la venta suelta.",
      });
    }
  });

export const esquemaPrecioProducto = z.object({
  metodoPagoId: z.string().min(1),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

// Precio de venta suelta por kg: obligatorio y mayor a cero cuando la venta
// suelta está habilitada.
export const esquemaPrecioProductoSuelto = z.object({
  metodoPagoId: z.string().min(1),
  precio: z.coerce.number().positive("El precio por kg debe ser mayor a cero"),
});

export const esquemaStockInicial = z.coerce
  .number()
  .min(0, "No puede ser negativo")
  .refine(tieneMaximoTresDecimales, "Máximo 3 decimales");

export const esquemaActivo = z.coerce.boolean();
