import { z } from "zod";
import { normalizarCbuCvu } from "@/lib/utilidades/normalizarCbuCvu";
import { normalizarCuit } from "@/lib/utilidades/normalizarCuit";

// Texto opcional: recorta y colapsa espacios internos. Un valor vacío se
// convierte en undefined para no persistir cadenas vacías.
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((valor) => {
      const limpio = valor?.replace(/\s+/g, " ").trim();
      return limpio ? limpio : undefined;
    });

// CBU/CVU: se guardan solo dígitos. Si el usuario escribe algo, debe resultar
// en exactamente 22 dígitos.
const campoBancario = (etiqueta: string) =>
  z
    .string()
    .optional()
    .transform((valor) => {
      const original = valor?.trim() ?? "";
      if (!original) return undefined;
      return normalizarCbuCvu(original);
    })
    .refine(
      (valor) => valor === undefined || valor.length === 22,
      `${etiqueta} debe contener 22 dígitos`,
    );

// CUIT/CUIL del titular: se guarda solo dígitos (11).
const campoCuit = z
  .string()
  .optional()
  .transform((valor) => {
    const original = valor?.trim() ?? "";
    if (!original) return undefined;
    return normalizarCuit(original);
  })
  .refine(
    (valor) => valor === undefined || valor.length === 11,
    "El CUIT/CUIL debe contener 11 dígitos",
  );

export const esquemaCuentaPagoProveedor = z
  .object({
    metodoPago: z.enum(
      [
        "TRANSFERENCIA_BANCARIA",
        "TRANSFERENCIA_CVU",
        "MERCADO_PAGO",
        "EFECTIVO",
        "OTRO",
      ],
      { message: "Medio de pago inválido" },
    ),
    tipoCuenta: z
      .enum(
        ["CAJA_AHORRO", "CUENTA_CORRIENTE", "CUENTA_VIRTUAL", "OTRA"],
        { message: "Tipo de cuenta inválido" },
      )
      .optional(),
    alias: textoOpcional(60),
    cbu: campoBancario("El CBU"),
    cvu: campoBancario("El CVU"),
    titular: textoOpcional(120),
    titularCuit: campoCuit,
    banco: textoOpcional(80),
    esPrincipal: z.boolean(),
    activo: z.boolean(),
  })
  .superRefine((datos, ctx) => {
    const tieneIdentificador = Boolean(datos.alias || datos.cbu || datos.cvu);

    // Regla general: no se admite una cuenta sin identificador de pago.
    // EFECTIVO queda exceptuado porque el propio medio identifica el pago.
    if (datos.metodoPago !== "EFECTIVO" && !tieneIdentificador) {
      ctx.addIssue({
        code: "custom",
        message: "Ingresá al menos un alias, CBU o CVU.",
        path: ["alias"],
      });
    }

    if (datos.metodoPago === "TRANSFERENCIA_BANCARIA" && !datos.cbu) {
      ctx.addIssue({
        code: "custom",
        message: "La transferencia bancaria requiere CBU.",
        path: ["cbu"],
      });
    }

    if (datos.metodoPago === "TRANSFERENCIA_CVU" && !datos.cvu) {
      ctx.addIssue({
        code: "custom",
        message: "La transferencia por CVU requiere CVU.",
        path: ["cvu"],
      });
    }

    if (
      datos.metodoPago === "MERCADO_PAGO" &&
      !datos.alias &&
      !datos.cvu
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Mercado Pago requiere alias o CVU.",
        path: ["alias"],
      });
    }

    if (datos.esPrincipal && !datos.activo) {
      ctx.addIssue({
        code: "custom",
        message: "Una cuenta inactiva no puede ser principal.",
        path: ["activo"],
      });
    }
  });
