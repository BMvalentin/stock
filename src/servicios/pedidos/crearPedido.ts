import { prisma } from "@/lib/prisma/cliente";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import {
  calcularTotalesPedido,
  type LineaPedidoEntrada,
} from "@/servicios/pedidos/calcularTotalesPedido";
import { calcularCostoEnvio } from "@/servicios/configuracion/calcularCostoEnvio";
import { validarStockPedido } from "@/servicios/pedidos/validarStockPedido";
import type { TipoEntrega } from "@/generated/prisma/enums";

export type { LineaPedidoEntrada };

export type DatosPedido = {
  clienteNombre: string;
  clienteTelefono: string;
  tipoEntrega: TipoEntrega;
  direccion?: string;
  localidad?: string;
  referencia?: string;
  mapsUrl?: string;
  latitud?: number;
  longitud?: number;
  metodoPagoId: string;
  observaciones?: string;
  lineas: LineaPedidoEntrada[];
};

// Crea un pedido administrativo. El servidor reconstruye precios, subtotales,
// envío y total a partir de los productos: ignora cualquier importe que envíe
// el cliente. Guarda snapshot de cliente, entrega y precio de cada línea.
export async function crearPedido(
  datos: DatosPedido,
  usuarioId: string,
): Promise<{ id: string; numero: number }> {
  const metodoPago = await prisma.metodoPago.findFirst({
    where: { id: datos.metodoPagoId, activo: true },
    select: { id: true },
  });

  if (!metodoPago) {
    throw new ErrorNegocio("El método de pago no existe o está inactivo.");
  }

  const { lineas, subtotal } = await calcularTotalesPedido(
    datos.lineas,
    datos.metodoPagoId,
  );

  validarStockPedido(lineas);

  const costoEnvio = await calcularCostoEnvio(
    datos.tipoEntrega,
    lineas.map((linea) => ({
      cantidad: linea.cantidad.toNumber(),
      bultos: linea.bultos.toNumber(),
    })),
  );

  const total = subtotal.add(costoEnvio);
  const esEnvio = datos.tipoEntrega === "ENVIO_DOMICILIO";

  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        clienteNombre: datos.clienteNombre,
        clienteTelefono: datos.clienteTelefono,
        clienteDireccion: esEnvio ? (datos.direccion ?? null) : null,
        clienteLocalidad: esEnvio ? (datos.localidad ?? null) : null,
        direccionEntrega: esEnvio ? (datos.direccion ?? null) : null,
        referenciaEntrega: esEnvio ? (datos.referencia ?? null) : null,
        mapsUrl: esEnvio ? (datos.mapsUrl ?? null) : null,
        latitud: esEnvio ? (datos.latitud ?? null) : null,
        longitud: esEnvio ? (datos.longitud ?? null) : null,
        usuarioId,
        metodoPagoId: datos.metodoPagoId,
        tipoEntrega: datos.tipoEntrega,
        subtotal,
        costoEnvio,
        total,
        observaciones: datos.observaciones ?? null,
        detalles: {
          create: lineas.map((linea) => ({
            productoId: linea.productoId,
            nombreProducto: linea.nombreProducto,
            unidadVenta: linea.unidadVenta,
            pesoPresentacionKg: linea.pesoPresentacionKg,
            precioUnitario: linea.precioUnitario,
            cantidad: linea.cantidad,
            subtotal: linea.subtotal,
          })),
        },
      },
      select: { id: true, numero: true },
    });

    await registrarAuditoria(
      {
        usuarioId,
        accion: ACCIONES_AUDITORIA.PEDIDO_CREADO,
        entidad: "Pedido",
        entidadId: pedido.id,
        datos: {
          numero: pedido.numero,
          cantidadProductos: lineas.length,
          total: total.toString(),
          metodoPagoId: datos.metodoPagoId,
          tipoEntrega: datos.tipoEntrega,
        },
      },
      tx,
    );

    return { id: pedido.id, numero: pedido.numero };
  });
}
