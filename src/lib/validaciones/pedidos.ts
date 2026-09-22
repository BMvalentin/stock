import { z } from "zod";
import { normalizarTelefono } from "@/lib/utilidades/normalizarTelefono";
import { tieneMaximoTresDecimales } from "@/lib/utilidades/tieneMaximoTresDecimales";
import {
  latitudOpcional,
  longitudOpcional,
  mapsUrlOpcional,
} from "@/lib/validaciones/ubicacion";

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((valor) => (valor ? valor : undefined));

// Línea enviada por el cliente. Solo se aceptan el producto, la cantidad y la
// modalidad de venta elegida: el precio y el subtotal los reconstruye el
// servidor. Las cantidades por kg admiten hasta 3 decimales.
export const esquemaLineaPedido = z.object({
  productoId: z.string().min(1, "Producto inválido"),
  modalidadId: z.string().min(1, "Modalidad inválida"),
  cantidad: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a cero")
    .refine(tieneMaximoTresDecimales, "Máximo 3 decimales"),
});

export const esquemaLineasPedido = z
  .array(esquemaLineaPedido)
  .min(1, "Agregá al menos un producto");

export const esquemaPedido = z
  .object({
    clienteNombre: z
      .string()
      .trim()
      .min(1, "El nombre del cliente es obligatorio")
      .max(150, "Máximo 150 caracteres"),
    clienteTelefono: z
      .string()
      .trim()
      .min(1, "El teléfono es obligatorio")
      .transform(normalizarTelefono)
      .refine(
        (valor) => valor.replace(/\D/g, "").length >= 6,
        "Teléfono inválido",
      ),
    tipoEntrega: z.enum(["RETIRO", "ENVIO_DOMICILIO"], {
      message: "Tipo de entrega inválido",
    }),
    direccion: opcional(200),
    localidad: opcional(120),
    referencia: opcional(200),
    mapsUrl: mapsUrlOpcional,
    latitud: latitudOpcional,
    longitud: longitudOpcional,
    metodoPagoId: z.string().min(1, "Seleccioná un método de pago"),
    observaciones: opcional(500),
    lineas: esquemaLineasPedido,
  })
  .superRefine((datos, ctx) => {
    if (datos.tipoEntrega !== "ENVIO_DOMICILIO") return;

    if (!datos.direccion) {
      ctx.addIssue({
        code: "custom",
        path: ["direccion"],
        message: "La dirección es obligatoria para envío a domicilio",
      });
    }

    if (!datos.localidad) {
      ctx.addIssue({
        code: "custom",
        path: ["localidad"],
        message: "La localidad es obligatoria para envío a domicilio",
      });
    }
  });
