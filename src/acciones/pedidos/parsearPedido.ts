import { z } from "zod";
import { esquemaPedido } from "@/lib/validaciones/pedidos";
import type { DatosPedido } from "@/servicios/pedidos/crearPedido";

export type ResultadoParseoPedido =
  | { ok: true; datos: DatosPedido }
  | { ok: false; errores: Record<string, string[]> };

// Traduce el FormData del formulario de pedido a los datos validados del
// servicio. Las líneas viajan como JSON; solo se aceptan producto y cantidad.
export function parsearPedido(formData: FormData): ResultadoParseoPedido {
  const lineasCrudas = formData.get("lineas");
  let lineas: unknown = [];

  if (typeof lineasCrudas === "string" && lineasCrudas.trim()) {
    try {
      lineas = JSON.parse(lineasCrudas);
    } catch {
      return {
        ok: false,
        errores: { lineas: ["No se pudieron leer los productos del pedido."] },
      };
    }
  }

  const resultado = esquemaPedido.safeParse({
    clienteNombre: formData.get("clienteNombre"),
    clienteTelefono: formData.get("clienteTelefono"),
    tipoEntrega: formData.get("tipoEntrega"),
    direccion: formData.get("direccion"),
    localidad: formData.get("localidad"),
    referencia: formData.get("referencia"),
    mapsUrl: formData.get("mapsUrl"),
    latitud: formData.get("latitud"),
    longitud: formData.get("longitud"),
    metodoPagoId: formData.get("metodoPagoId"),
    observaciones: formData.get("observaciones"),
    lineas,
  });

  if (!resultado.success) {
    return { ok: false, errores: z.flattenError(resultado.error).fieldErrors };
  }

  // Consolida líneas repetidas sumando sus cantidades. La clave incluye la
  // modalidad: un mismo producto puede venderse como presentación y suelto.
  const consolidadas = new Map<
    string,
    { productoId: string; modalidad?: "UNIDAD" | "KILOGRAMO"; cantidad: number }
  >();

  for (const linea of resultado.data.lineas) {
    const clave = `${linea.productoId}::${linea.modalidad ?? ""}`;
    const existente = consolidadas.get(clave);

    if (existente) {
      existente.cantidad += linea.cantidad;
      continue;
    }

    consolidadas.set(clave, {
      productoId: linea.productoId,
      modalidad: linea.modalidad,
      cantidad: linea.cantidad,
    });
  }

  return {
    ok: true,
    datos: {
      clienteNombre: resultado.data.clienteNombre,
      clienteTelefono: resultado.data.clienteTelefono,
      tipoEntrega: resultado.data.tipoEntrega,
      direccion: resultado.data.direccion,
      localidad: resultado.data.localidad,
      referencia: resultado.data.referencia,
      mapsUrl: resultado.data.mapsUrl,
      latitud: resultado.data.latitud,
      longitud: resultado.data.longitud,
      metodoPagoId: resultado.data.metodoPagoId,
      observaciones: resultado.data.observaciones,
      lineas: [...consolidadas.values()],
    },
  };
}
