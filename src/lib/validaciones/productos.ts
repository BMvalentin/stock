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

// Número opcional que admite "" o null como ausencia de valor.
const numeroOpcionalPositivo = z.preprocess(
  (valor) => (valor === "" || valor === undefined || valor === null ? null : valor),
  z.coerce
    .number()
    .positive("Debe ser mayor a cero")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales")
    .nullable(),
);

// Una regla de precio de una modalidad. `UNITARIO` cubre un rango de cantidad;
// `TOTAL` representa un pack de `cantidadDesde` unidades por un precio total.
export const esquemaReglaPrecio = z
  .object({
    id: z.string().optional(),
    metodoPagoId: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .transform((valor) => valor ?? null),
    cantidadDesde: z.coerce
      .number()
      .positive("Debe ser mayor a cero")
      .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
    cantidadHasta: numeroOpcionalPositivo,
    tipoPrecio: z.enum(["UNITARIO", "TOTAL", "PRESENTACION"], {
      message: "Tipo de precio inválido",
    }),
    precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
    activo: z.boolean().default(true),
  })
  .superRefine((regla, ctx) => {
    if (
      regla.tipoPrecio === "UNITARIO" &&
      regla.cantidadHasta !== null &&
      regla.cantidadHasta < regla.cantidadDesde
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cantidadHasta"],
        message: "El máximo no puede ser menor al mínimo",
      });
    }

    if (
      (regla.tipoPrecio === "TOTAL" || regla.tipoPrecio === "PRESENTACION") &&
      regla.precio <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["precio"],
        message: "El precio debe ser mayor a cero",
      });
    }
  });

export const esquemaModalidadVenta = z.object({
  id: z.string().optional(),
  nombre: z
    .string()
    .trim()
    .min(1, "Poné un nombre a la modalidad")
    .max(80, "Máximo 80 caracteres"),
  unidadVenta: z.enum(["UNIDAD", "KILOGRAMO"], {
    message: "Unidad de venta inválida",
  }),
  contenido: numeroOpcionalPositivo,
  etiquetaPresentacion: z.preprocess(
    (valor) => (valor === "" || valor === undefined ? null : valor),
    z.string().trim().max(50, "Máximo 50 caracteres").nullable(),
  ),
  esBase: z.boolean().default(false),
  activo: z.boolean().default(true),
  orden: z.coerce.number().int().min(0).default(0),
  reglas: z
    .array(esquemaReglaPrecio)
    .min(1, "Cada modalidad necesita al menos un precio"),
});

export const esquemaModalidades = z
  .array(esquemaModalidadVenta)
  .min(1, "Agregá al menos una modalidad de venta")
  .superRefine((modalidades, ctx) => {
    const nombres = new Set<string>();

    modalidades.forEach((modalidad, indice) => {
      const clave = modalidad.nombre.toLowerCase();

      if (nombres.has(clave)) {
        ctx.addIssue({
          code: "custom",
          path: [indice, "nombre"],
          message: "Nombre de modalidad repetido",
        });
      }

      nombres.add(clave);
    });

    if (!modalidades.some((modalidad) => modalidad.esBase)) {
      ctx.addIssue({
        code: "custom",
        path: [0, "esBase"],
        message: "Marcá una modalidad como principal",
      });
    }
  });

export const esquemaProducto = z.object({
  barcode: barcodeOpcional,
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres"),
  descripcion: descripcionOpcional,
  sku: skuOpcional,
  categoriaId: z.string().min(1, "Seleccioná una categoría"),
  stockMinimo: z.coerce
    .number()
    .min(0, "No puede ser negativo")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
  unidadesPorBulto: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "El mínimo es 1"),
});

export const esquemaStockInicial = z.coerce
  .number()
  .min(0, "No puede ser negativo")
  .refine(tieneMaximoTresDecimales, "Máximo 3 decimales");

export const esquemaActivo = z.coerce.boolean();
